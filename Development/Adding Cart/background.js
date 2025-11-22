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
            const text = (b.innerText || b.value || '').toLowerCase();
            if (text.includes('add to cart') || text.includes('add to basket') || text.includes('add to shopping basket')) {
              b.click();
              clicked = true;
              break;
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

async function openAndClick(link) {
  const tab = await getActiveTab();
  if (!tab || !tab.id) return;
  await new Promise((resolve) => {
    chrome.tabs.update(tab.id, { url: link.url }, () => resolve());
  });
  await waitForTabComplete(tab.id);
  await clickAddToCart(tab.id);
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
      // only Amazon links expected, but safety: filter Amazon domains
      const filtered = links.filter(l => {
        try { return /\.amazon\./i.test(new URL(l.url).hostname); } catch (e) { return false; }
      });
      if (filtered.length) cycleLinks(filtered, interval);
    });
  }
});
