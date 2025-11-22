// helper: get active tab
function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs && tabs[0]);
    });
  });
}

function waitForTabComplete(tabId, timeout = 20000) {
  return new Promise((resolve) => {
    const start = Date.now();
    function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      } else if (Date.now() - start > timeout) {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function clickAddToCart(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const selectors = [
          '#add-to-cart-button',
          'input#add-to-cart-button',
          'input[name="submit.add-to-cart"]',
          'input[name="submit.addToCart"]',
          'button[name="add"]',
          'input#addToCart',
          '#buy-now-button'
        ];
        let clicked = false;
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el && !el.disabled) {
            el.click();
            clicked = true;
            break;
          }
        }
        if (!clicked) {
          const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a'));
          for (const b of buttons) {
            const text = (b.innerText || b.value || b.getAttribute('aria-label') || '').toLowerCase();
            if (text.includes('add to cart') || text.includes('add to basket') || text.includes('add to shopping basket')) {
              try { b.click(); clicked = true; break; } catch (e) {}
            }
          }
        }
        return clicked;
      }
    });
    return Array.isArray(results) && results.length ? results[0].result : false;
  } catch (e) {
    return false;
  }
}

// tries to find and click "No Thanks" style buttons/links in common variations
async function dismissNoThanks(tabId, attempts = 3, delayMs = 1200) {
  for (let i = 0; i < attempts; i++) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const textCandidates = ['no thanks', 'no, thanks', 'no thank you', 'skip', 'skip this offer'];
          const clickable = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]'));
          for (const el of clickable) {
            const txt = (el.innerText || el.value || el.getAttribute('aria-label') || '').toLowerCase().trim();
            if (!txt) continue;
            for (const cand of textCandidates) {
              if (txt.includes(cand)) {
                try { el.click(); return { clicked: true, text: txt }; } catch (e) { /* ignore */ }
              }
            }
          }
          // also try common Amazon dismissal selectors
          const altSelectors = [
            '[aria-label="No thanks"]',
            '[data-testid="no-thanks"]',
            '.a-button-text:contains("No thanks")' // Note: :contains won't work in querySelector; left as hint
          ];
          // fallback attempt: search entire text nodes for "no thanks" and click parent button/link
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
          let node;
          while ((node = walker.nextNode())) {
            const t = node.textContent.toLowerCase().trim();
            if (t.includes('no thanks') || t.includes('no, thanks') || t.includes('no thank you')) {
              const parent = node.parentElement;
              if (parent) {
                const btn = parent.closest('button, a, input[type="button"], input[type="submit"], [role="button"]');
                if (btn) {
                  try { btn.click(); return { clicked: true, text: node.textContent.trim() }; } catch (e) {}
                }
              }
            }
          }
          return { clicked: false };
        }
      });
      if (Array.isArray(results) && results.length && results[0].result && results[0].result.clicked) return true;
    } catch (e) {
      // ignore injection errors
    }
    await sleep(delayMs);
  }
  return false;
}

async function openAndClick(link) {
  const tab = await getActiveTab();
  if (!tab || !tab.id) return;
  await new Promise((resolve) => {
    chrome.tabs.update(tab.id, { url: link.url }, () => resolve());
  });
  await waitForTabComplete(tab.id);
  await clickAddToCart(tab.id);
  // try to dismiss any "No Thanks" / upsell prompts that may appear
  await sleep(500);
  await dismissNoThanks(tab.id, 4, 1000);
}

async function cycleLinks(links, interval = 3000) {
  const tab = await getActiveTab();
  if (!tab || !tab.id) return;
  for (const link of links) {
    await new Promise((resolve) => {
      chrome.tabs.update(tab.id, { url: link.url }, () => resolve());
    });
    await waitForTabComplete(tab.id);
    await clickAddToCart(tab.id);
    // short pause, then try dismiss prompts that may appear after add-to-cart
    await sleep(600);
    await dismissNoThanks(tab.id, 4, 1000);
    await sleep(interval);
  }
}

// listen for popup messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.action) return;
  if (msg.action === 'openAndClick' && msg.link) {
    openAndClick(msg.link);
  } else if (msg.action === 'cycleAll') {
    // get saved links from storage and start cycling
    chrome.storage.local.get(['savedLinks'], (res) => {
      const links = res.savedLinks || [];
      const interval = msg.interval || 3000;
      const filtered = links.filter(l => {
        try { return /\.amazon\./i.test(new URL(l.url).hostname); } catch (e) { return false; }
      });
      if (filtered.length) cycleLinks(filtered, interval);
    });
  }
});
