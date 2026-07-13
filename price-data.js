/* Central price presentation for buying guides.
 * LAPTOPS.price is a typical/reference price, never a guaranteed live offer.
 */
(function () {
  'use strict';

  const PRICE_TIERS = [
    { id: 'entry', label: 'Entry', min: 0, max: 999, guide: 'guide-best-gaming-laptop-under-1000.html' },
    { id: 'budget', label: 'Budget', min: 1000, max: 1499, guide: 'guide-best-gaming-laptop-under-1500.html' },
    { id: 'mid-range', label: 'Mid-range', min: 1500, max: 1999, guide: 'guide-best-gaming-laptop-under-2000.html' },
    { id: 'premium', label: 'Premium', min: 2000, max: 2999, guide: 'guide-best-gaming-laptop-under-3000.html' },
    { id: 'flagship', label: 'Flagship', min: 3000, max: Infinity, guide: 'guide-best-flagship-gaming-laptop-2026.html' }
  ];
  const MAX_LIVE_PRICE_AGE_MS = 24 * 60 * 60 * 1000;
  const snapshotOffers = (window.FL_PRICE_SNAPSHOT && window.FL_PRICE_SNAPSHOT.offers) || {};

  const EXTRA_RECORDS = {
    'lenovo-legion-7i-gen10': {
      id: 'lenovo-legion-7i-gen10',
      name: 'Lenovo Legion 7i Gen 10',
      price: 2199,
      amazonUrl: 'https://www.amazon.com/dp/B0FWVFBB81?tag=framelimit20-20'
    }
  };

  const ALIASES = {
    'asus scar 18': 'asus-rog-scar-18-2026',
    'asus rog strix scar 18 2025': 'asus-rog-scar-18-2026',
    'asus scar 16': 'asus-rog-scar-16-2026',
    'asus rog strix scar 16 2026': 'asus-rog-scar-16-2026',
    'razer blade 16': 'razer-blade-16-oled-2026',
    'zephyrus g16': 'asus-rog-zephyrus-g16-high',
    'asus rog zephyrus g16 2026': 'asus-rog-zephyrus-g16-high',
    'msi raider 18 hx ai': 'msi-raider-18-hx-ai',
    'msi titan 18 hx ai': 'msi-titan-18-hx-ai',
    'legion pro 7i gen 10': 'lenovo-legion-pro-7i-gen10',
    'hp omen max 16 amd': 'hp-omen-max-16-2026',
    'msi vector 16 hx ai': 'msi-vector-16-hx-ai',
    'asus rog zephyrus g14': 'asus-rog-zephyrus-g14-2026',
    'alienware 16x aurora': 'dell-alienware-16x-aurora',
    'lenovo legion 7i gen 10': 'lenovo-legion-7i-gen10',
    'legion 7i gen 10': 'lenovo-legion-7i-gen10',
    'lenovo legion 5i gen 10': 'lenovo-legion-5i-gen10',
    'legion 5i gen 10': 'lenovo-legion-5i-gen10',
    'acer predator helios neo 16': 'acer-predator-helios-neo-16-2025',
    'helios neo 16': 'acer-predator-helios-neo-16-2025',
    'asus tuf a18': 'asus-tuf-a15-rtx5060',
    'hp omen 16 slim': 'hp-omen-16-rtx5070-2026',
    'msi katana 15 hx': 'msi-katana-15-hx',
    'asus tuf f16': 'asus-tuf-gaming-f16-rtx5070',
    'lenovo loq 15 gen 10': 'lenovo-loq-15-gen10',
    'gigabyte gaming a16': 'gigabyte-gaming-a16-rtx5060',
    'asus tuf a16': 'asus-tuf-a16-entry',
    'dell g16 7630': 'dell-g16-rtx4070',
    'acer nitro v 16s': 'acer-nitro-v-16'
  };

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  const records = {};
  (window.LAPTOPS || []).forEach(function (laptop) {
    records[laptop.id] = laptop;
  });
  Object.assign(records, EXTRA_RECORDS);

  function resolveId(value) {
    if (records[value]) return value;
    const key = normalize(value);
    return ALIASES[key] || Object.keys(records).find(function (id) {
      return normalize(records[id].name) === key;
    });
  }

  function getRecord(value) {
    const id = resolveId(value);
    return id ? records[id] : null;
  }

  function getFreshOffer(value) {
    const id = resolveId(value);
    const offer = id ? snapshotOffers[id] : null;
    if (!offer || !Number.isFinite(offer.price) || !offer.checkedAt) return null;
    const age = Date.now() - Date.parse(offer.checkedAt);
    const unavailable = ['OUT_OF_STOCK', 'UNAVAILABLE'].includes(offer.availability);
    return age >= 0 && age <= MAX_LIVE_PRICE_AGE_MS && !unavailable ? offer : null;
  }

  function getPriceDisplay(value) {
    const offer = getFreshOffer(value);
    if (offer) {
      return {
        kind: 'amazon',
        text: `Amazon ${offer.displayPrice || '$' + offer.price.toLocaleString('en-US')}`,
        offer
      };
    }
    const record = getRecord(value);
    if (record && Number.isFinite(record.price)) {
      return { kind: 'reference', text: 'Typical $' + record.price.toLocaleString('en-US'), offer: null };
    }
    return { kind: 'unavailable', text: 'Check current price', offer: null };
  }

  function formatReferencePrice(value) {
    return getPriceDisplay(value).text;
  }

  function isSearchUrl(url) {
    return /amazon\.com\/s\?/i.test(url || '');
  }

  function hydratePriceNode(node, value) {
    const display = getPriceDisplay(value);
    node.textContent = display.text;
    node.classList.remove('price-amazon', 'price-reference', 'price-unavailable');
    node.classList.add('price-' + display.kind);
    node.title = display.kind === 'amazon'
      ? `Amazon price checked ${new Date(display.offer.checkedAt).toLocaleString('en-US')}. Price and availability can change.`
      : display.kind === 'reference'
        ? 'Typical street/reference price; not a guaranteed live offer.'
        : 'No recently verified exact offer. Check the retailer for current price and stock.';
  }

  function hydrateAmazonLink(link, value) {
    const record = getRecord(value);
    if (!record || !record.amazonUrl) return;
    const offer = getFreshOffer(value);
    link.href = (offer && offer.detailPageUrl) || record.amazonUrl;
    link.rel = 'nofollow sponsored noopener';
    link.target = '_blank';
    link.textContent = isSearchUrl(link.href) ? 'Search Amazon \u2192' : 'Check current price \u2192';
  }

  function hydrateCard(card) {
    const value = card.dataset.flLaptop;
    const scope = card.closest('.pick-card') || card;
    scope.querySelectorAll('.pick-spec').forEach(function (spec) {
      const label = spec.querySelector('.pick-spec-label');
      const price = spec.querySelector('.pick-spec-val');
      if (label && price && label.textContent.trim().toLowerCase() === 'price') {
        hydratePriceNode(price, value);
      }
    });
    const amazon = scope.querySelector('a.btn-buy[href*="amazon.com"]');
    if (amazon) hydrateAmazonLink(amazon, value);
  }

  function hydrateQuickPick(item) {
    const reason = item.querySelector('.qp-reason');
    if (!reason) return;
    const price = formatReferencePrice(item.dataset.flPriceId);
    reason.textContent = reason.textContent.replace(/^\$[\d,]+\.\s*/, price + '. ');
  }

  function hydrateComparisonTables() {
    document.querySelectorAll('.comparison-table').forEach(function (table) {
      const headers = Array.from(table.querySelectorAll('thead th'));
      const priceIndex = headers.findIndex(function (header) {
        return header.textContent.trim().toLowerCase() === 'price';
      });
      if (priceIndex < 0) return;
      table.querySelectorAll('tbody tr').forEach(function (row) {
        const cells = row.querySelectorAll('td');
        const record = cells.length ? getRecord(cells[0].textContent) : null;
        if (record && cells[priceIndex]) hydratePriceNode(cells[priceIndex], record.id);
      });
    });
  }

  function addPricePolicy() {
    if (!document.body.matches('[data-price-guide]') || document.querySelector('.price-guide-policy')) return;
    const quickPicks = document.querySelector('.quick-picks');
    if (!quickPicks) return;
    const policy = document.createElement('div');
    policy.className = 'price-guide-policy';
    policy.innerHTML = '<strong>How prices work:</strong> Fresh API prices are labeled “Amazon”; otherwise we show a typical street/reference price. Prices and stock can change at any time. Direct product pages are used when available; otherwise the button opens a model-specific affiliate search. <span>' + (window.FL_DATA_LAST_CHECKED_LABEL || 'Links checked regularly') + '.</span>';
    quickPicks.insertAdjacentElement('afterend', policy);
  }

  function hydrate() {
    document.querySelectorAll('[data-fl-price]').forEach(function (node) {
      hydratePriceNode(node, node.dataset.flPrice);
    });
    document.querySelectorAll('[data-fl-amazon]').forEach(function (link) {
      hydrateAmazonLink(link, link.dataset.flAmazon);
    });
    document.querySelectorAll('[data-fl-laptop]').forEach(hydrateCard);
    document.querySelectorAll('[data-fl-price-id]').forEach(hydrateQuickPick);
    hydrateComparisonTables();
    addPricePolicy();
  }

  window.FL_PRICE_TIERS = PRICE_TIERS;
  window.FL_PRICE_RECORDS = records;
  window.flGetPriceRecord = getRecord;
  window.flGetPriceDisplay = getPriceDisplay;
  window.flFormatReferencePrice = formatReferencePrice;
  window.flHydratePrices = hydrate;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate);
  } else {
    hydrate();
  }
}());
