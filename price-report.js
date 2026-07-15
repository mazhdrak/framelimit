(function () {
  const laptops = Array.isArray(window.LAPTOPS) ? window.LAPTOPS : [];
  const history = window.FL_PRICE_HISTORY && Array.isArray(window.FL_PRICE_HISTORY.snapshots) ? window.FL_PRICE_HISTORY.snapshots : [];
  const tableBody = document.getElementById('pr-table-body');
  if (!tableBody) return;
  const state = { search: '', gpu: 'all', sort: 'price-asc' };
  const gpuRank = { 'RTX 5090': 8, 'RTX 5080': 7, 'RTX 5070 Ti': 6, 'RTX 5070': 5, 'RTX 5060': 4, 'Radeon 8060S': 3, 'Radeon RX 7700S': 2 };
  const latest = history.at(-1) || null;
  const previous = history.at(-2) || null;

  function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
  function money(value) { return Number.isFinite(value) ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: value % 1 ? 2 : 0 }) : null; }
  function median(values) { const sorted = values.filter(Number.isFinite).sort((a, b) => a - b); if (!sorted.length) return null; const mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; }

  function renderGpuGrid() {
    const priority = ['RTX 5060', 'RTX 5070', 'RTX 5070 Ti', 'RTX 5080', 'RTX 5090'];
    const groups = priority.map((gpu) => ({ gpu, prices: laptops.filter((item) => item.gpu === gpu).map((item) => item.price).filter(Number.isFinite) }));
    const maximum = Math.max(...groups.map((group) => median(group.prices) || 0));
    document.getElementById('pr-gpu-grid').innerHTML = groups.map((group) => {
      const value = median(group.prices);
      return `<div class="pr-gpu"><b>${group.gpu}</b><strong>${money(value) || 'N/A'}</strong><span>${group.prices.length} priced configuration${group.prices.length === 1 ? '' : 's'}</span><div class="pr-bar"><i style="width:${value ? value / maximum * 100 : 0}%"></i></div></div>`;
    }).join('');
  }

  function renderTable() {
    const query = state.search.toLowerCase();
    const filtered = laptops.filter((item) => {
      if (state.gpu !== 'all' && item.gpu !== state.gpu) return false;
      return !query || [item.brand, item.name, item.shortName, item.gpu, item.modelCode].join(' ').toLowerCase().includes(query);
    });
    filtered.sort((a, b) => {
      if (state.sort === 'price-desc') return (b.price ?? -1) - (a.price ?? -1) || a.shortName.localeCompare(b.shortName);
      if (state.sort === 'gpu') return (gpuRank[b.gpu] || 0) - (gpuRank[a.gpu] || 0) || (a.price ?? Infinity) - (b.price ?? Infinity);
      if (state.sort === 'name') return a.shortName.localeCompare(b.shortName);
      return (a.price ?? Infinity) - (b.price ?? Infinity) || a.shortName.localeCompare(b.shortName);
    });
    document.getElementById('pr-result-count').textContent = `${filtered.length} of ${laptops.length} configurations shown`;
    tableBody.innerHTML = filtered.map((item) => {
      const live = latest && latest.offers ? latest.offers[item.id] : null;
      const old = previous && previous.offers ? previous.offers[item.id] : null;
      const delta = live && old && Number.isFinite(live.price) && Number.isFinite(old.price) ? (live.price - old.price) / old.price * 100 : null;
      const deltaText = delta == null ? '<span class="pr-muted">Insufficient history</span>' : `<span style="color:${delta < 0 ? 'var(--green)' : delta > 0 ? 'var(--orange)' : 'var(--muted)'}">${delta > 0 ? '+' : ''}${delta.toFixed(1)}%</span>`;
      return `<tr><td><div class="pr-model">${escapeHtml(item.shortName)}</div><div class="pr-sub">${escapeHtml(item.modelCode || 'Retail configuration')}</div></td><td>${escapeHtml(item.gpu)}</td><td>${Number.isFinite(item.price) ? `<div class="pr-price">${money(item.price)}</div><div class="pr-ref">EDITORIAL REFERENCE</div>` : '<span class="pr-muted">Check retailer</span>'}</td><td>${live ? `<div class="pr-price">${money(live.price)}</div><div class="pr-sub">${escapeHtml(latest.month)}</div>` : '<span class="pr-muted">Awaiting eligible API snapshot</span>'}</td><td>${deltaText}</td><td><a class="pr-link" href="${escapeHtml(item.amazonUrl)}" target="_blank" rel="nofollow sponsored">Amazon →</a></td></tr>`;
    }).join('');
  }

  const priced = laptops.map((item) => item.price).filter(Number.isFinite);
  document.getElementById('pr-catalog-count').textContent = laptops.length;
  document.getElementById('pr-priced-count').textContent = priced.length;
  document.getElementById('pr-median-price').textContent = money(median(priced));
  document.getElementById('pr-live-months').textContent = history.length;
  if (history.length) document.getElementById('pr-status').innerHTML = `<strong>Live history active:</strong> ${history.length} monthly Amazon snapshot${history.length === 1 ? '' : 's'} archived through ${escapeHtml(latest.month)}. Month-over-month values appear only where the same exact configuration exists in consecutive snapshots.`;

  const gpuSelect = document.getElementById('pr-gpu');
  [...new Set(laptops.map((item) => item.gpu))].sort((a, b) => (gpuRank[b] || 0) - (gpuRank[a] || 0)).forEach((gpu) => gpuSelect.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(gpu)}">${escapeHtml(gpu)}</option>`));
  document.getElementById('pr-search').addEventListener('input', (event) => { state.search = event.target.value.trim(); renderTable(); });
  gpuSelect.addEventListener('change', (event) => { state.gpu = event.target.value; renderTable(); });
  document.getElementById('pr-sort').addEventListener('change', (event) => { state.sort = event.target.value; renderTable(); });
  renderGpuGrid();
  renderTable();
})();
