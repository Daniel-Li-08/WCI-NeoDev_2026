// helper: get active tab (prefer lastFocusedWindow to avoid returning extension popup)
function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs && tabs.length) return resolve(tabs[0]);
      // fallback to currentWindow if nothing found
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs2) => {
        resolve((tabs2 && tabs2[0]) || null);
      });
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

// new helper: dispatch an Escape key on the page (tries keydown/keyup on document/window/active element)
async function pressEscape(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        try {
          const makeEv = (type) => {
            let ev;
            try {
              ev = new KeyboardEvent(type, { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true });
            } catch (e) {
              // fallback for strict environments
              ev = document.createEvent('KeyboardEvent');
              try { ev.initKeyboardEvent(type, true, true, window, 'Escape', 0, '', false, ''); } catch (e2) {}
            }
            return ev;
          };
          const down = makeEv('keydown');
          const up = makeEv('keyup');
          [document, window, document.activeElement].forEach(target => {
            try {
              if (target) {
                target.dispatchEvent(down);
                target.dispatchEvent(up);
              }
            } catch (e) {}
          });
        } catch (e) {}
      }
    });
    return true;
  } catch (e) {
    return false;
  }
}

// robust helper: try repeatedly to set quantity on the page without throwing
async function setQuantity(tabId, quantity, timeout = 8000, interval = 500) {
  if (!quantity || quantity <= 1) return false;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: (qty) => {
          try {
            const selectors = [
              'select#quantity',
              'select#quantity_1',
              'select[name="quantity"]',
              'select#qty',
              'select#native-dropdown-select-quantity',
              'input#quantity',
              'input[name="quantity"]',
              'input#qty'
            ];
            function setElValue(el, val) {
              try {
                const tag = (el.tagName || '').toLowerCase();
                if (tag === 'select') {
                  // try to pick an option that matches value or text
                  const options = Array.from(el.options || []);
                  const opt = options.find(o => o.value == String(val) || (o.text || '').trim() == String(val) || (o.text || '').includes(String(val)));
                  if (opt) {
                    el.value = opt.value;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    return true;
                  }
                  // fallback: try setting value directly
                  el.value = String(val);
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                  return true;
                } else {
                  el.focus && el.focus();
                  el.value = String(val);
                  el.dispatchEvent(new Event('input', { bubbles: true }));
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                  el.blur && el.blur();
                  return true;
                }
              } catch (e) {
                return false;
              }
            }

            for (const sel of selectors) {
              try {
                const el = document.querySelector(sel);
                if (el && setElValue(el, qty)) return true;
              } catch (e) { /* ignore per-selector errors */ }
            }

            // fallback: find labels or nearby controls mentioning "quantity"
            const texts = Array.from(document.querySelectorAll('label, span, div')).filter(n => (n.innerText || '').toLowerCase().includes('quantity'));
            for (const t of texts) {
              const el = t.querySelector('select, input');
              if (el && setElValue(el, qty)) return true;
              // try closest selectable control
              const close = t.closest('form, div, section')?.querySelector('select, input');
              if (close && setElValue(close, qty)) return true;
            }

            return false;
          } catch (e) {
            return false;
          }
        },
        args: [quantity]
      });
      if (Array.isArray(results) && results.length && results[0].result) return true;
    } catch (e) {
      // ignore injection errors and retry
    }
    await sleep(interval);
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

  try {
    if (link.qty && link.qty > 1) {
      await setQuantity(tab.id, link.qty);
      await sleep(300);
    }
  } catch (e) {
    // swallow any error and continue to attempt purchase
  }

  await clickAddToCart(tab.id);
  await sleep(500);
  await dismissNoThanks(tab.id, 4, 1000);
  await sleep(200);
  await pressEscape(tab.id);
}

async function cycleLinks(links, interval = 3000) {
  const tab = await getActiveTab();
  if (!tab || !tab.id) return;
  for (const link of links) {
    await new Promise((resolve) => {
      chrome.tabs.update(tab.id, { url: link.url }, () => resolve());
    });
    await waitForTabComplete(tab.id);

    try {
      if (link.qty && link.qty > 1) {
        await setQuantity(tab.id, link.qty);
        await sleep(300);
      }
    } catch (e) {
      // continue even if quantity couldn't be set
    }

    await clickAddToCart(tab.id);
    await sleep(600);
    await dismissNoThanks(tab.id, 4, 1000);
    await sleep(200);
    await pressEscape(tab.id);
    await sleep(interval);
  }
}

// listen for popup messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.action) {
    return;
  }
  if (msg.action === 'openAndClick' && msg.link) {
    console.log('background: received openAndClick', msg.link && msg.link.url);
    openAndClick(msg.link).catch((e) => console.error('openAndClick error', e));
    // acknowledge receipt immediately
    sendResponse({ accepted: true });
    return true; // keep channel open if needed
  } else if (msg.action === 'cycleAll') {
    console.log('background: received cycleAll, loading savedLinks...');
    // get saved links from storage and start cycling
    chrome.storage.local.get(['savedLinks'], (res) => {
      const links = res.savedLinks || [];
      const interval = msg.interval || 3000;
      const filtered = links.filter(l => {
        try { return /\.amazon\./i.test(new URL(l.url).hostname); } catch (e) { return false; }
      });
      if (filtered.length) {
        // acknowledge how many will be processed, then start
        sendResponse({ started: filtered.length });
        cycleLinks(filtered, interval).catch((e) => console.error('cycleLinks error', e));
      } else {
        // nothing to do
        sendResponse({ started: 0 });
      }
    });
    // indicate we'll call sendResponse asynchronously
    return true;
  }
});
