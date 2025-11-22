const STORAGE_KEY = 'savedLinks';
const MODE_KEY = 'selectedMode';
const LAST_SCRAPE_KEY = 'lastScrape'; // new
let currentMode = null; // 'addingCart' | 'amazonScraper'
let scrapedData = null;

// --- storage helpers ---
function getMode() {
  return new Promise((resolve) => {
    chrome.storage.local.get([MODE_KEY], (res) => resolve(res[MODE_KEY] || null));
  });
}
function saveMode(mode) {
  return new Promise((resolve) => {
    const obj = {}; obj[MODE_KEY] = mode;
    chrome.storage.local.set(obj, () => resolve());
  });
}
function getLinks() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (res) => resolve(res[STORAGE_KEY] || []));
  });
}
function saveLinks(links) {
  return new Promise((resolve) => {
    const obj = {}; obj[STORAGE_KEY] = links;
    chrome.storage.local.set(obj, () => resolve());
  });
}

// new: persist last scrape
function saveLastScrape(data) {
  try {
    const obj = {};
    obj[LAST_SCRAPE_KEY] = data;
    chrome.storage.local.set(obj);
  } catch (e) {
    // ignore
  }
}

// new: load last scrape from storage
function loadLastScrape() {
  return new Promise((resolve) => {
    chrome.storage.local.get([LAST_SCRAPE_KEY], (res) => {
      resolve(res[LAST_SCRAPE_KEY] || null);
    });
  });
}

// --- helper functions ---
function makeId() { return `${Date.now()}-${Math.floor(Math.random()*100000)}`; }
function normalizeUrl(url) {
  try { const u = new URL(url); return u.href; } catch (e) {
    try { return new URL('https://' + url).href; } catch (e2) { return null; }
  }
}
function isAmazonUrl(url) {
  try { const u = new URL(url); return /\.amazon\./i.test(u.hostname); } catch (e) { return false; }
}
function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs && tabs[0]));
  });
}

// --- Adding Cart features (add/remove/render/openAll) ---
async function addLink(title, qty = 1) {
  const tab = await getActiveTab();
  if (!tab || !tab.url) throw new Error('No active tab with a URL');
  const normalized = normalizeUrl(tab.url);
  if (!normalized) throw new Error('Invalid URL');
  if (!isAmazonUrl(normalized)) throw new Error('Only Amazon links are allowed');
  const links = await getLinks();
  const quantity = Math.max(1, parseInt(qty, 10) || 1);
  links.unshift({ id: makeId(), title: title || tab.title || '', url: normalized, qty: quantity });
  await saveLinks(links);
}
async function removeLink(id) {
  const links = await getLinks();
  const filtered = links.filter(l => l.id !== id);
  await saveLinks(filtered);
}

// render UI (links list + mode label)
async function render() {
  // mode label
  let modeLabel = document.getElementById('modeLabel');
  if (!modeLabel) {
    modeLabel = document.createElement('div');
    modeLabel.id = 'modeLabel';
    document.body.prepend(modeLabel);
  }
  modeLabel.textContent = currentMode === 'amazonScraper' ? 'Mode: AmazonCartScraper' : (currentMode === 'addingCart' ? 'Mode: Adding Cart' : 'Mode: (not selected)');

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

    const qtyEl = document.createElement('div');
    qtyEl.className = 'link-qty';
    qtyEl.textContent = `Quantity: ${link.qty || 1}`;

    const actions = document.createElement('div');
    actions.className = 'link-actions';

    const openBtn = document.createElement('button');
    openBtn.textContent = 'Open';
    if (currentMode === 'amazonScraper') {
      openBtn.disabled = true;
      openBtn.title = 'Not available in Scraper mode';
    } else {
      openBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'openAndClick', link });
      });
    }

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', async () => { await removeLink(link.id); render(); });

    actions.appendChild(openBtn);
    actions.appendChild(removeBtn);

    const urlEl = document.createElement('div');
    urlEl.className = 'link-url';
    urlEl.textContent = link.url;

    li.appendChild(title);
    li.appendChild(qtyEl);
    li.appendChild(urlEl);
    li.appendChild(actions);
    list.appendChild(li);
  }
}

// --- Scraper logic (injected into Amazon cart page) ---
const scrapeScript = () => {
  const cartItems = [];
  const itemContainers = document.querySelectorAll('[data-item-count], .sc-list-item, [data-asin]:not([data-asin=""])');
  const items = itemContainers.length > 0 ? itemContainers : document.querySelectorAll('.sc-list-item-content, .a-list-item');

  items.forEach((item, idx) => {
    try {
      const linkEl = item.querySelector('a.sc-product-link, .sc-item-content-group a[href*="/dp/"], .a-link-normal[href*="/dp/"], a[href*="/gp/product/"]');
      const productLink = linkEl ? linkEl.href.split('?')[0] : null;

      const qtySelect = item.querySelector('select[name*="quantity"], .sc-quantity-textfield input, input[name*="quantity"]');
      const qtySpan = item.querySelector('.sc-item-quantity span, .a-dropdown-prompt');
      let quantity = 1;
      if (qtySelect) quantity = parseInt(qtySelect.value,10) || 1;
      else if (qtySpan) quantity = parseInt(qtySpan.textContent.trim(),10) || 1;

      const catEl = item.querySelector('.sc-product-category, [data-category], .a-size-small.a-color-secondary');
      let category = catEl ? catEl.textContent.trim() : null;
      if (!category) {
        const byline = item.querySelector('.a-size-small.a-color-link, .a-link-normal.a-size-small');
        category = byline ? byline.textContent.trim() : 'Unknown';
      }

      const titleEl = item.querySelector('.sc-product-title, .a-truncate-cut, .a-list-item .a-link-normal span');
      const title = titleEl ? titleEl.textContent.trim() : 'Unknown Product';

      const asin = item.getAttribute('data-asin') || (productLink ? productLink.match(/\/dp\/([A-Z0-9]+)/i)?.[1] : null);

      if (productLink || title !== 'Unknown Product') {
        cartItems.push({
          index: idx + 1,
          title: title.substring(0,150),
          productLink: productLink || 'Link not found',
          quantity,
          category: category || 'Unknown',
          asin: asin || 'N/A'
        });
      }
    } catch (e) {}
  });

  return cartItems;
};

// CSV helpers
function escapeHtml(str) { const d=document.createElement('div'); d.textContent = str||''; return d.innerHTML; }
function generateCSV(items) {
  const headers = ['Index','Title','Product Link','Quantity','Category','ASIN'];
  const escape = (s)=>`"${String(s||'').replace(/"/g,'""')}"`;
  const rows = items.map(i=>[i.index, i.title, i.productLink, i.quantity, i.category, i.asin].map(escape).join(','));
  return [headers.join(','), ...rows].join('\n');
}
function downloadCSV(csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const filename = `amazon_cart_${new Date().toISOString().split('T')[0]}.csv`;
  if (chrome && chrome.downloads && chrome.downloads.download) {
    chrome.downloads.download({ url, filename, saveAs: true });
  } else {
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  }
}

// --- event wiring ---
document.addEventListener('DOMContentLoaded', () => {
  // elements
  const form = document.getElementById('addForm');
  const titleInput = document.getElementById('title');
  const qtyInput = document.getElementById('quantity');
  const openAllBtn = document.getElementById('openAll');
  const clearAllBtn = document.getElementById('clearAll');
  const scrapeBtn = document.getElementById('scrapeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const scrapeResults = document.getElementById('scrapeResults');
  const itemCount = document.getElementById('itemCount');
  const totalQty = document.getElementById('totalQty');
  const categoryCount = document.getElementById('categoryCount');
  const itemsPreview = document.getElementById('itemsPreview');
  const changeModeBtn = document.getElementById('changeModeBtn');

  // helper: populate results UI from scrapedData
  function populateScrapeUI() {
    if (!scrapedData || !scrapedData.length) {
      scrapeResults.classList.remove('visible');
      downloadBtn.disabled = true;
      return;
    }
    itemCount.textContent = scrapedData.length;
    totalQty.textContent = scrapedData.reduce((s,i)=>s+i.quantity,0);
    const cats = [...new Set(scrapedData.map(i=>i.category).filter(Boolean))];
    categoryCount.textContent = cats.length;
    itemsPreview.innerHTML = scrapedData.slice(0,10).map(it=>`<div style="padding:6px;border-bottom:1px solid #eee"><div style="font-weight:600">${escapeHtml(it.title)}</div><div style="font-size:12px;color:#666">Qty: ${it.quantity} | ${escapeHtml(it.category||'N/A')}</div></div>`).join('');
    if (scrapedData.length > 10) itemsPreview.innerHTML += `<div style="padding:6px;color:#666">+${scrapedData.length-10} more...</div>`;
    scrapeResults.classList.add('visible');
    downloadBtn.disabled = false;
    // make sure display style is correct when updateModeUI toggles
    if (currentMode === 'amazonScraper') scrapeResults.style.display = 'block';
  }

  // mode picker (first run)
  function createModePicker() {
    const overlay = document.createElement('div');
    overlay.id = 'modePickerOverlay';
    overlay.style.position = 'fixed'; overlay.style.left='0'; overlay.style.top='0'; overlay.style.right='0'; overlay.style.bottom='0';
    overlay.style.background='rgba(0,0,0,0.4)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center';
    overlay.style.zIndex='9999';
    const box = document.createElement('div'); box.style.background='#fff'; box.style.padding='16px'; box.style.borderRadius='6px'; box.style.width='320px';
    const heading = document.createElement('div'); heading.textContent='Choose extension mode'; heading.style.fontWeight='600'; heading.style.marginBottom='8px';
    const desc = document.createElement('div'); desc.style.fontSize='13px'; desc.style.marginBottom='12px';
    desc.textContent = 'Select: "Adding Cart" for add-to-cart automation, or "Amazon Scraper" to extract cart items.';
    const btnAdd = document.createElement('button'); btnAdd.textContent='Adding Cart'; btnAdd.style.marginRight='8px';
    btnAdd.addEventListener('click', async ()=>{ await saveMode('addingCart'); currentMode='addingCart'; overlay.remove(); updateModeUI(); render(); });
    const btnScraper = document.createElement('button'); btnScraper.textContent='Amazon Scraper';
    btnScraper.addEventListener('click', async ()=>{ await saveMode('amazonScraper'); currentMode='amazonScraper'; overlay.remove(); updateModeUI(); render(); });
    box.appendChild(heading); box.appendChild(desc); box.appendChild(btnAdd); box.appendChild(btnScraper); overlay.appendChild(box); document.body.appendChild(overlay);
  }
  function updateModeUI() {
    // elements to show/hide
    const addFormEl = document.getElementById('addForm');
    const controlsEl = document.querySelector('.controls');
    const linksListEl = document.getElementById('linksList');
    const scrapeControlsEl = document.querySelector('.scrape-controls');
    const scrapeResultsEl = document.getElementById('scrapeResults');

    // mode label
    document.getElementById('modeLabel').textContent =
      currentMode === 'amazonScraper'
        ? 'Mode: AmazonCartScraper'
        : (currentMode === 'addingCart' ? 'Mode: Adding Cart' : 'Mode: (not selected)');

    // ensure the change-mode button is visible and wired once
    changeModeBtn.style.display = 'block';
    if (!changeModeBtn._wired) {
      changeModeBtn.addEventListener('click', createModePicker);
      changeModeBtn._wired = true;
    }

    // Always keep the add form visible so "Add Current" (save) button is present.
    if (addFormEl) addFormEl.style.display = '';

    // Default: hide other panes to avoid flicker
    if (controlsEl) controlsEl.style.display = 'none';
    if (linksListEl) linksListEl.style.display = 'none';
    if (scrapeControlsEl) scrapeControlsEl.style.display = 'none';
    if (scrapeResultsEl) scrapeResultsEl.style.display = 'none';

    // Enable/disable features depending on mode and show only the active pane
    const submitBtn = addFormEl?.querySelector('button[type="submit"]');
    const openAllBtn = document.getElementById('openAll');
    const scrapeBtnEl = document.getElementById('scrapeBtn');
    const downloadBtnEl = document.getElementById('downloadBtn');

    if (currentMode === 'addingCart') {
      // show Adding Cart UI
      if (controlsEl) controlsEl.style.display = 'flex';
      if (linksListEl) linksListEl.style.display = '';
      if (submitBtn) submitBtn.disabled = false;
      if (openAllBtn) openAllBtn.disabled = false;
      if (scrapeBtnEl) scrapeBtnEl.disabled = true;
      if (downloadBtnEl) downloadBtnEl.disabled = true;
      // hide scrape results panel (remove visible class)
      if (scrapeResultsEl) scrapeResultsEl.classList.remove('visible');
    } else if (currentMode === 'amazonScraper') {
      // show Scraper UI only
      if (scrapeControlsEl) scrapeControlsEl.style.display = 'flex';
      // show persisted results if present
      if (scrapeResultsEl && scrapeResultsEl.classList.contains('visible')) scrapeResultsEl.style.display = 'block';
      if (submitBtn) submitBtn.disabled = true; // disable add in scraper mode
      if (openAllBtn) openAllBtn.disabled = true;
      if (scrapeBtnEl) scrapeBtnEl.disabled = false;
      if (downloadBtnEl) downloadBtnEl.disabled = true;
    } else {
      // no mode selected: disable actions but keep add form visible in a disabled state
      if (submitBtn) submitBtn.disabled = true;
      if (openAllBtn) openAllBtn.disabled = true;
      if (scrapeBtnEl) scrapeBtnEl.disabled = true;
      if (downloadBtnEl) downloadBtnEl.disabled = true;
    }
  }

  // initialize mode and last-scrape: load persisted scrape first
  (async ()=> {
    const last = await loadLastScrape();
    if (last && Array.isArray(last) && last.length) {
      scrapedData = last;
    }
    const mode = await getMode();
    if (!mode) createModePicker();
    else { currentMode = mode; updateModeUI(); render(); }
    // if we loaded saved scrapedData and current mode is scraper, populate UI immediately
    if (scrapedData && currentMode === 'amazonScraper') populateScrapeUI();
  })();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area==='local' && changes[MODE_KEY]) { currentMode = changes[MODE_KEY].newValue; updateModeUI(); render(); }
    if (area==='local' && changes[STORAGE_KEY]) { render(); }
    if (area==='local' && changes[LAST_SCRAPE_KEY]) {
      scrapedData = changes[LAST_SCRAPE_KEY].newValue || null;
      // reflect in UI only if scraper mode is active
      if (currentMode === 'amazonScraper') populateScrapeUI();
    }
  });

  // Add form
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (currentMode === 'amazonScraper') { alert('Add/Open disabled in Scraper mode. Change mode to Adding Cart.'); return; }
    const title = titleInput.value.trim(); const qty = parseInt(qtyInput.value,10) || 1;
    try { await addLink(title, qty); titleInput.value=''; qtyInput.value='1'; render(); } catch (e) { alert('Unable to add current page — make sure a regular webpage is active and it is an Amazon product page.'); }
  });

  openAllBtn.addEventListener('click', async () => {
    if (currentMode === 'amazonScraper') {
      // keep the UI guidance but avoid browser alert popup
      console.warn('Open All is disabled in Scraper mode. Change mode to Adding Cart to use it.');
      return;
    }

    // disable button to prevent duplicate clicks while background starts
    openAllBtn.disabled = true;

    // fire-and-forget: ask background to cycle through all saved links and click add-to-cart on each
    chrome.runtime.sendMessage({ action: 'cycleAll', interval: 3000 }, (resp) => {
      try {
        console.log('cycleAll response:', resp);
        // no alert/popups shown — UI remains quiet
      } catch (e) {
        /* ignore logging errors */
      } finally {
        // re-enable the button after the background acknowledged (or after callback)
        openAllBtn.disabled = false;
      }
    });
  });

  clearAllBtn.addEventListener('click', async () => {
    if (!confirm('Clear all saved links?')) return;
    await saveLinks([]); render();
  });

  // Scrape button
  scrapeBtn.addEventListener('click', async () => {
    scrapeBtn.disabled = true; downloadBtn.disabled = true; scrapeResults.classList.remove('visible');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url?.match(/amazon\.(com|ca|co\.uk|co\.)/i)) {
        alert('Please open your Amazon cart page first (amazon.com / amazon.ca / amazon.co.uk etc).');
        scrapeBtn.disabled = false;
        return;
      }
      const results = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: scrapeScript });
      scrapedData = results?.[0]?.result || [];
      // persist the last scrape so it's available after popup close / reopen
      saveLastScrape(scrapedData);

      if (!scrapedData.length) {
        alert('No items found in cart.');
        scrapeBtn.disabled = false;
        return;
      }
      // update results UI
      populateScrapeUI();
    } catch (err) { alert('Scrape error: ' + (err && err.message)); }
    scrapeBtn.disabled = false;
  });

  // Download button
  downloadBtn.addEventListener('click', () => {
    if (!scrapedData?.length) return;
    const csv = generateCSV(scrapedData);
    downloadCSV(csv);
    alert('CSV downloaded or saving dialog opened.');
  });

});
