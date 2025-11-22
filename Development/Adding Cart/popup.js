const STORAGE_KEY = 'savedLinks';

function getLinks() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (res) => {
      resolve(res[STORAGE_KEY] || []);
    });
  });
}

function saveLinks(links) {
  return new Promise((resolve) => {
    const obj = {};
    obj[STORAGE_KEY] = links;
    chrome.storage.local.set(obj, () => resolve());
  });
}

function makeId() {
  return `${Date.now()}-${Math.floor(Math.random()*100000)}`;
}

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return u.href;
  } catch (e) {
    // try to add scheme
    try {
      return new URL('https://' + url).href;
    } catch (e2) {
      return null;
    }
  }
}

async function render() {
  const list = document.getElementById('linksList');
  list.innerHTML = '';
  const links = await getLinks();
  if (!links.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No links saved';
    list.appendChild(li);
    return;
  }

  for (const link of links) {
    const li = document.createElement('li');
    li.className = 'link-item';

    const title = document.createElement('div');
    title.className = 'link-title';
    title.textContent = link.title || link.url;

    const actions = document.createElement('div');
    actions.className = 'link-actions';

    const openBtn = document.createElement('button');
    openBtn.textContent = 'Open';
    // tell background to open this link on the current tab and click add-to-cart
    openBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openAndClick', link });
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', async () => {
      await removeLink(link.id);
      render();
    });

    actions.appendChild(openBtn);
    actions.appendChild(removeBtn);

    const urlEl = document.createElement('div');
    urlEl.className = 'link-url';
    urlEl.textContent = link.url;

    li.appendChild(title);
    li.appendChild(urlEl);
    li.appendChild(actions);
    list.appendChild(li);
  }
}

// helper: get active tab
function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs && tabs[0]);
    });
  });
}

// helper: check amazon url
function isAmazonUrl(url) {
  try {
    const u = new URL(url);
    return /\.amazon\./i.test(u.hostname);
  } catch (e) {
    return false;
  }
}

// replace addLink to only accept Amazon links
async function addLink(title) {
  const tab = await getActiveTab();
  if (!tab || !tab.url) throw new Error('No active tab with a URL');
  const normalized = normalizeUrl(tab.url);
  if (!normalized) throw new Error('Invalid URL');
  if (!isAmazonUrl(normalized)) throw new Error('Only Amazon links are allowed');
  const links = await getLinks();
  links.unshift({ id: makeId(), title: title || tab.title || '', url: normalized });
  await saveLinks(links);
}

async function removeLink(id) {
  const links = await getLinks();
  const filtered = links.filter(l => l.id !== id);
  await saveLinks(filtered);
}

// wait for tab to reach 'complete' status (resolves even on timeout)
function waitForTabComplete(tabId, timeout = 15000) {
  return new Promise((resolve) => {
    const start = Date.now();
    function listener(updatedTabId, info) {
      if (updatedTabId === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
      if (Date.now() - start > timeout) {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
  });
}

// replace openLink to navigate the current active tab and click Add to Cart
async function openLink(link) {
  const tab = await getActiveTab();
  if (!tab) return;
  chrome.tabs.update(tab.id, { url: link.url }, async () => {
    await waitForTabComplete(tab.id);
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
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
    } catch (e) {
      // ignore injection errors
    }
  });
}

// replace openAll to cycle through saved Amazon links on same active tab and click Add to Cart on each
async function openAll(interval = 3000) {
  const links = await getLinks();
  if (!links.length) return;
  const tab = await getActiveTab();
  if (!tab) return;

  for (const link of links) {
    // navigate
    await new Promise((resolve) => {
      chrome.tabs.update(tab.id, { url: link.url }, () => resolve());
    });

    // wait for load, then try inject click
    await waitForTabComplete(tab.id);
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
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
    } catch (e) {
      // ignore injection errors per page
    }

    // wait a bit before moving to next product to let cart update
    await new Promise((r) => setTimeout(r, interval));
  }
}

async function clearAll() {
  await saveLinks([]);
}

document.addEventListener('DOMContentLoaded', () => {
  render();

  const form = document.getElementById('addForm');
  const titleInput = document.getElementById('title');
  // url input removed

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const title = titleInput.value.trim();
    try {
      await addLink(title);
      titleInput.value = '';
      render();
    } catch (e) {
      alert('Unable to add current page — make sure a regular webpage is active and it is an Amazon product page.');
    }
  });

  document.getElementById('openAll').addEventListener('click', async () => {
    // ask background to cycle through all saved links and click add-to-cart on each
    chrome.runtime.sendMessage({ action: 'cycleAll', interval: 3000 });
  });

  document.getElementById('clearAll').addEventListener('click', async () => {
    if (!confirm('Clear all saved links?')) return;
    await clearAll();
    render();
  });
});
