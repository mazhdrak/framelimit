(function () {
  const laptops = Array.isArray(window.LAPTOPS) ? window.LAPTOPS : [];
  const history = window.FL_PRICE_HISTORY && Array.isArray(window.FL_PRICE_HISTORY.snapshots) ? window.FL_PRICE_HISTORY.snapshots : [];
  const tableBody = document.getElementById('pr-table-body');
  if (!tableBody) return;
  const state = { search: '', gpu: 'all', sort: 'gpu' };
  const gpuRank = { 'RTX 5090': 8, 'RTX 5080': 7, 'RTX 5070 Ti': 6, 'RTX 5070': 5, 'RTX 5060': 4, 'Radeon 8060S': 3, 'Radeon RX 7700S': 2 };
  const latest = history.at(-1) || null;
  const previous = history.at(-2) || null;

  function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
  function asinFromUrl(value) { const match = String(value || '').match(/\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i); return match ? match[1].toUpperCase() : null; }

  function renderGpuGrid() {
    const priority = ['RTX 5060', 'RTX 5070', 'RTX 5070 Ti', 'RTX 5080', 'RTX 5090'];
    const groups = priority.map((gpu) => ({ gpu, count: laptops.filter((item) => item.gpu === gpu).length }));
    const maximum = Math.max(...groups.map((group) => group.count));
    document.getElementById('pr-gpu-grid').innerHTML = groups.map((group) => {
      return `<div class="pr-gpu"><b>${group.gpu}</b><strong>${group.count}</strong><span>catalog configuration${group.count === 1 ? '' : 's'}</span><div class="pr-bar"><i style="width:${maximum ? group.count / maximum * 100 : 0}%"></i></div></div>`;
    }).join('');
  }

  function renderTable() {
    const query = state.search.toLowerCase();
    const filtered = laptops.filter((item) => {
      if (state.gpu !== 'all' && item.gpu !== state.gpu) return false;
      return !query || [item.brand, item.name, item.shortName, item.gpu, item.modelCode].join(' ').toLowerCase().includes(query);
    });
    filtered.sort((a, b) => {
      if (state.sort === 'gpu') return (gpuRank[b.gpu] || 0) - (gpuRank[a.gpu] || 0) || a.shortName.localeCompare(b.shortName);
      if (state.sort === 'name') return a.shortName.localeCompare(b.shortName);
      return a.shortName.localeCompare(b.shortName);
    });
    document.getElementById('pr-result-count').textContent = `${filtered.length} of ${laptops.length} configurations shown`;
    tableBody.innerHTML = filtered.map((item) => {
      const currentAsin = asinFromUrl(item.amazonUrl);
      const isAmazon = Boolean(currentAsin);
      const latestCandidate = latest && latest.offers ? latest.offers[item.id] : null;
      const live = latestCandidate && latestCandidate.asin === currentAsin ? latestCandidate : null;
      const oldCandidate = previous && previous.offers ? previous.offers[item.id] : null;
      const old = live && oldCandidate && oldCandidate.asin === live.asin ? oldCandidate : null;
      const referenceStatus = Number.isFinite(item.price) && item.priceCheckedAt ? `<span class="pr-ref">CHECKED ${escapeHtml(item.priceCheckedAt)}</span>` : '<span class="pr-muted">No current reference</span>';
      const historyStatus = live && old ? '<span>Comparable snapshots available</span>' : '<span class="pr-muted">Insufficient history</span>';
      return `<tr><td><div class="pr-model">${escapeHtml(item.shortName)}</div></td><td>${escapeHtml(item.gpu)}</td><td>${referenceStatus}</td><td>${live ? `<span>Amazon snapshot archived</span><div class="pr-sub">${escapeHtml(latest.month)}</div>` : '<span class="pr-muted">Awaiting eligible API snapshot</span>'}</td><td>${historyStatus}</td><td>${item.amazonUrl ? `<a class="pr-link" href="${escapeHtml(item.amazonUrl)}" target="_blank" rel="${isAmazon ? 'nofollow sponsored noopener' : 'noopener'}">${isAmazon ? 'Amazon' : escapeHtml(item.retailerName || 'Retailer')} →</a>` : '<span>Exact retail listing under review</span>'}</td></tr>`;
    }).join('');
  }

  const priced = laptops.filter((item) => Number.isFinite(item.price));
  const linked = laptops.filter((item) => item.amazonUrl).length;
  document.getElementById('pr-catalog-count').textContent = laptops.length;
  document.getElementById('pr-priced-count').textContent = priced.length;
  document.getElementById('pr-median-price').textContent = linked;
  document.getElementById('pr-live-months').textContent = history.length;
  if (history.length) document.getElementById('pr-status').innerHTML = `<strong>Live history active:</strong> ${history.length} monthly Amazon snapshot${history.length === 1 ? '' : 's'} archived through ${escapeHtml(latest.month)}. Month-over-month values appear only when the same ASIN exists in consecutive snapshots and still matches the current catalog configuration.`;

  const gpuSelect = document.getElementById('pr-gpu');
  [...new Set(laptops.map((item) => item.gpu))].sort((a, b) => (gpuRank[b] || 0) - (gpuRank[a] || 0)).forEach((gpu) => gpuSelect.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(gpu)}">${escapeHtml(gpu)}</option>`));
  document.getElementById('pr-search').addEventListener('input', (event) => { state.search = event.target.value.trim(); renderTable(); });
  gpuSelect.addEventListener('change', (event) => { state.gpu = event.target.value; renderTable(); });
  document.getElementById('pr-sort').addEventListener('change', (event) => { state.sort = event.target.value; renderTable(); });
  renderGpuGrid();
  renderTable();
})();
