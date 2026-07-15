(function () {
  'use strict';
  const tableBody = document.getElementById('displaydb-table-body');
  if (!tableBody || !Array.isArray(window.LAPTOPS)) return;

  function panelType(value) {
    if (/mini.?led/i.test(value || '')) return 'Mini-LED';
    if (/oled/i.test(value || '')) return 'OLED';
    if (/ips/i.test(value || '')) return 'IPS';
    return 'Other';
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  const rows = window.LAPTOPS.filter((laptop) => laptop.modelCode && laptop.specSource && laptop.specCheckedAt && laptop.display).map((laptop) => ({
    ...laptop,
    normalizedPanel: panelType(laptop.display.panel)
  }));
  const state = { panel: 'all', brightness: 'all', refresh: 'all', search: '', sort: 'brightness-desc' };

  function formatDate(value) {
    const [year, month, day] = String(value).split('-');
    return `${month}/${day}/${year}`;
  }

  function displayRows() {
    const query = state.search.toLowerCase();
    const filtered = rows.filter((laptop) => {
      if (state.panel !== 'all' && laptop.normalizedPanel !== state.panel) return false;
      if (state.brightness === '500' && !(laptop.display.nits >= 500)) return false;
      if (state.refresh === '240' && !(laptop.display.hz >= 240)) return false;
      const haystack = [laptop.brand, laptop.name, laptop.shortName, laptop.modelCode, laptop.display.res, laptop.display.panel, laptop.display.hdr].join(' ').toLowerCase();
      return !query || haystack.includes(query);
    });

    filtered.sort((a, b) => {
      if (state.sort === 'brightness-asc') return (a.display.nits ?? Number.POSITIVE_INFINITY) - (b.display.nits ?? Number.POSITIVE_INFINITY) || a.shortName.localeCompare(b.shortName);
      if (state.sort === 'refresh-desc') return b.display.hz - a.display.hz || (b.display.nits ?? -1) - (a.display.nits ?? -1);
      if (state.sort === 'resolution') return b.display.size - a.display.size || a.display.res.localeCompare(b.display.res);
      if (state.sort === 'name') return a.shortName.localeCompare(b.shortName);
      return (b.display.nits ?? -1) - (a.display.nits ?? -1) || b.display.hz - a.display.hz || a.shortName.localeCompare(b.shortName);
    });

    document.getElementById('displaydb-result-count').textContent = `${filtered.length} of ${rows.length} sourced display configurations shown`;
    if (!filtered.length) {
      tableBody.innerHTML = '<tr><td colspan="9" class="displaydb-empty">No sourced display configurations match these filters.</td></tr>';
      return;
    }

    tableBody.innerHTML = filtered.map((laptop) => `<tr>
      <td><div class="displaydb-model">${escapeHtml(laptop.shortName)}</div><div class="displaydb-sku">${escapeHtml(laptop.modelCode)}</div></td>
      <td>${escapeHtml(laptop.display.size)}-inch</td>
      <td><strong>${escapeHtml(laptop.display.res)}</strong></td>
      <td><span class="displaydb-panel ${laptop.normalizedPanel.toLowerCase()}">${escapeHtml(laptop.normalizedPanel)}</span></td>
      <td class="displaydb-hz">${escapeHtml(laptop.display.hz)}Hz</td>
      <td>${Number.isFinite(laptop.display.nits) ? `<span class="displaydb-nits">${escapeHtml(laptop.display.nits)} nits</span>` : '<span class="displaydb-muted">Not published</span>'}</td>
      <td>${laptop.display.hdr ? escapeHtml(laptop.display.hdr) : '<span class="displaydb-muted">Not published</span>'}</td>
      <td><a class="displaydb-link" href="${escapeHtml(laptop.specSource)}" target="_blank" rel="nofollow noopener">Specification source →</a><div class="displaydb-sku">Checked ${formatDate(laptop.specCheckedAt)}</div></td>
      <td><a class="displaydb-link" href="${escapeHtml(laptop.amazonUrl)}" target="_blank" rel="nofollow sponsored noopener">Check exact retail page →</a></td>
    </tr>`).join('');
  }

  document.getElementById('displaydb-search').addEventListener('input', (event) => { state.search = event.target.value.trim(); displayRows(); });
  document.getElementById('displaydb-sort').addEventListener('change', (event) => { state.sort = event.target.value; displayRows(); });
  document.getElementById('displaydb-refresh').addEventListener('change', (event) => { state.refresh = event.target.value; displayRows(); });
  document.getElementById('displaydb-brightness').addEventListener('change', (event) => { state.brightness = event.target.value; displayRows(); });
  document.querySelectorAll('.displaydb-filter').forEach((button) => button.addEventListener('click', () => {
    state.panel = button.dataset.panel;
    document.querySelectorAll('.displaydb-filter').forEach((candidate) => candidate.classList.toggle('active', candidate === button));
    displayRows();
  }));

  document.getElementById('displaydb-model-count').textContent = rows.length;
  document.getElementById('displaydb-brightness-count').textContent = rows.filter((laptop) => Number.isFinite(laptop.display.nits)).length;
  document.getElementById('displaydb-hdr-count').textContent = rows.filter((laptop) => laptop.display.hdr).length;
  document.getElementById('displaydb-fast-count').textContent = rows.filter((laptop) => laptop.display.hz >= 240).length;
  displayRows();
})();
