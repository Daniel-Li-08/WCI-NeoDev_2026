// FILE: popup.js
console.log("scraper called");
let scrapedData = null;

const scrapeBtn = document.getElementById('scrapeBtn');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');


const port = 5500;

function setStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

function clearStatus() {
  statusEl.className = 'status';
  statusEl.textContent = '';
}

function updateResults(items) {
  document.getElementById('itemCount').textContent = items.length;
  document.getElementById('totalQty').textContent = 
    items.reduce((sum, i) => sum + i.quantity, 0);
  
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  document.getElementById('categoryCount').textContent = categories.length;
  
  const preview = document.getElementById('itemsPreview');
  preview.innerHTML = items.slice(0, 5).map(item => `
    <div class="item-row">
      <div class="item-title">${escapeHtml(item.title)}</div>
      <div class="item-meta">Qty: ${item.quantity} | ${escapeHtml(item.category || 'N/A')}</div>
    </div>
  `).join('');
  
  if (items.length > 5) {
    preview.innerHTML += `<div class="item-row" style="text-align:center;color:#999;">
      +${items.length - 5} more items...
    </div>`;
  }
  
  resultsEl.classList.add('visible');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function generateCSV(items) {
  const headers = ['Index', 'Title', 'Product Link', 'Quantity', 'Category', 'ASIN'];
  const escape = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
  
  const rows = items.map(i => [
    i.index,
    escape(i.title),
    escape(i.productLink),
    i.quantity,
    escape(i.category),
    escape(i.asin)
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
}

// Content script to inject
const scrapeScript =  async (NAME) => {
  const cartItems = [];
  const sendlist = [];
  const itemContainers = document.querySelectorAll(
    '[data-item-count], .sc-list-item, [data-asin]:not([data-asin=""])'
  );
  
  const items = itemContainers.length > 0 
    ? itemContainers 
    : document.querySelectorAll('.sc-list-item-content, .a-list-item');


  items.forEach((item, idx) => {
    try {
      // Product link
      const linkEl = item.querySelector(
        'a.sc-product-link, ' +
        '.sc-item-content-group a[href*="/dp/"], ' +
        '.a-link-normal[href*="/dp/"], ' +
        'a[href*="/gp/product/"]'
      );
      const productLink = linkEl ? linkEl.href.split('?')[0] : null;

      // Quantity
      const qtySelect = item.querySelector(
        'select[name*="quantity"], .sc-quantity-textfield input, input[name*="quantity"]'
      );
      const qtySpan = item.querySelector('.sc-item-quantity span, .a-dropdown-prompt');
      let quantity = 1;
      if (qtySelect) quantity = parseInt(qtySelect.value, 10) || 1;
      else if (qtySpan) quantity = parseInt(qtySpan.textContent.trim(), 10) || 1;

      // Category
      const catEl = item.querySelector(
        '.sc-product-category, [data-category], .a-size-small.a-color-secondary'
      );
      let category = catEl ? catEl.textContent.trim() : null;
      if (!category) {
        const byline = item.querySelector('.a-size-small.a-color-link, .a-link-normal.a-size-small');
        category = byline ? byline.textContent.trim() : 'Unknown';
      }

      // Title
      const titleEl = item.querySelector(
        '.sc-product-title, .a-truncate-cut, .a-list-item .a-link-normal span'
      );
      const title = titleEl ? titleEl.textContent.trim() : 'Unknown Product';

      // ASIN
      const asin = item.getAttribute('data-asin') || 
        (productLink ? productLink.match(/\/dp\/([A-Z0-9]+)/i)?.[1] : null);

      if (productLink || title !== 'Unknown Product') {
        cartItems.push({
          index: idx + 1,
          title: title.substring(0, 150),
          productLink: productLink || 'Link not found',
          quantity,
          category: category || 'Unknown',
          asin: asin || 'N/A'
        });
      }

      // Creates a separate list to send to Vercel server
      if (productLink || title !== 'Unknown Product') {
        

        sendlist.push({
          link: productLink || 'Link not found',
          quantity: quantity,
          cart: NAME
        });
      }
    } catch (e) { /* skip item */ }
  });

  const VERCEL_URL = `https://wci-neo-dev-2025api.vercel.app/cart/additem`;
  const CLEAR_URL = `https://wci-neo-dev-2025api.vercel.app/cart/clear`;

  // Send JSON with explicit headers and safe parsing of the response.
  (async () => {
    try {

      // Clear fetch
        const res = await fetch(CLEAR_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        },
        body: JSON.stringify({cart: sendlist[0].cart})
      });


      for (let i = 0; i < sendlist.length; i++) {
      const res = await fetch(VERCEL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(sendlist[i])
      });
    }

      const text = await res.text();
      console.log(text)
      // Try to parse JSON but fall back to text to avoid throwing on non-JSON responses
      try {
        const json = text ? JSON.parse(text) : null;
        console.log('server response (json):', json);
      } catch {
        console.log('server response (text):', text);
      }

      console.log('POST', VERCEL_URL, 'status', res.status);
    } catch (err) {
      console.warn('Failed to send cart to server:', err);
    }
  })();



 
  console.log(cartItems)
  return cartItems;
};

// Scrape button handler
scrapeBtn.addEventListener('click', async () => {
  console.log('hello?')





  const nm = await localStorage.getItem("name");



    const res = await fetch("https://wci-neo-dev-2025api.vercel.app/user/getCart", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({name:nm})
    });

    const NAME = (await res.json()).cart
    if (NAME == ""){
        chrome.tabs.create({ url: "https://wci-neo-dev-2025.vercel.app/cart"});
        return
    }

  scrapeBtn.disabled = true;
  resultsEl.classList.remove('visible');
  setStatus('Scraping cart...', 'loading');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.url?.match(/amazon\.(com|ca).*cart/i)) {
      setStatus('Please navigate to your Amazon cart page first.', 'error');
      scrapeBtn.disabled = false;
      return;
    }
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeScript,
      args: [NAME]
    });
    
    scrapedData = results[0]?.result || [];
    
    if (scrapedData.length === 0) {
      setStatus('No items found. Is your cart empty?', 'error');
      scrapeBtn.disabled = false;
      return;
    }
    
    setStatus(`Found ${scrapedData.length} item(s)!`, 'success');
    updateResults(scrapedData);
    
  } catch (err) {
    setStatus(`Error: ${err.message}`, 'error');
  }
  
  scrapeBtn.disabled = false;
});