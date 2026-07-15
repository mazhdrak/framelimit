(function () {
  const tableBody = document.getElementById('tgp-table-body');
  if (!tableBody || !Array.isArray(window.LAPTOPS)) return;

  const reviewUrls = {
    'lenovo-legion-pro-7i-gen10': 'review-lenovo-legion-pro-7i-gen10',
    'razer-blade-16-oled-2026': 'review-razer-blade-16-2026',
    'hp-omen-max-16-2026': 'review-hp-omen-max-16-2026',
    'lenovo-legion-5i-gen10': 'review-lenovo-legion-5i-gen10',
    'acer-predator-helios-neo-16-2025': 'review-acer-predator-helios-neo-16',
    'asus-tuf-gaming-f16-rtx5070': 'review-asus-tuf-gaming-f16-rtx5070',
    'msi-vector-16-hx-ai': 'review-msi-vector-16-hx-ai',
    'lenovo-loq-15-gen10': 'review-lenovo-loq-15-gen10',
    'acer-nitro-v-16': 'review-acer-nitro-v-16-2026',
    'asus-tuf-a16-entry': 'review-asus-tuf-gaming-a16-2026',
    'msi-katana-15-hx': 'review-msi-katana-15-hx',
    'gigabyte-gaming-a16-rtx5060': 'review-gigabyte-gaming-a16',
    'dell-g16-rtx4070': 'review-alienware-16-aurora',
    'asus-rog-zephyrus-g16-2026': 'review-asus-rog-zephyrus-g16-2026',
    'lenovo-legion-7-gen11': 'review-lenovo-legion-5-gen10-amd',
    'msi-raider-16-max-hx': 'review-msi-raider-18-hx-ai',
    'asus-rog-strix-g16-2026': 'review-asus-rog-strix-g16-2026',
    'msi-raider-a18-hx-amd': 'review-msi-raider-a18-hx-amd'
  };

  const gpuRank = { 'RTX 5090': 5, 'RTX 5080': 4, 'RTX 5070 Ti': 3, 'RTX 5070': 2, 'RTX 5060': 1 };
  const rows = window.LAPTOPS.filter((laptop) => /^RTX 50/.test(laptop.gpu) && laptop.modelCode && laptop.specSource && laptop.specCheckedAt);
  const state = { gpu: 'all', search: '', sort: 'power-desc' };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function formatDate(value) {
    const [year, month, day] = String(value).split('-');
    return `${month}/${day}/${year}`;
  }

  function displayRows() {
    const query = state.search.toLowerCase();
    const filtered = rows.filter((laptop) => {
      if (state.gpu !== 'all' && laptop.gpu !== state.gpu) return false;
      const haystack = [laptop.brand, laptop.name, laptop.shortName, laptop.gpu, laptop.modelCode].join(' ').toLowerCase();
      return !query || haystack.includes(query);
    });

    filtered.sort((a, b) => {
      if (state.sort === 'power-asc') return (a.tgp ?? Number.POSITIVE_INFINITY) - (b.tgp ?? Number.POSITIVE_INFINITY) || a.shortName.localeCompare(b.shortName);
      if (state.sort === 'gpu-desc') return (gpuRank[b.gpu] || 0) - (gpuRank[a.gpu] || 0) || (b.tgp ?? -1) - (a.tgp ?? -1) || a.shortName.localeCompare(b.shortName);
      if (state.sort === 'name-asc') return a.shortName.localeCompare(b.shortName);
      return (b.tgp ?? -1) - (a.tgp ?? -1) || (gpuRank[b.gpu] || 0) - (gpuRank[a.gpu] || 0) || a.shortName.localeCompare(b.shortName);
    });

    document.getElementById('tgp-result-count').textContent = `${filtered.length} of ${rows.length} sourced configurations shown`;
    if (!filtered.length) {
      tableBody.innerHTML = '<tr><td colspan="9" class="tgp-empty">No sourced configurations match these filters.</td></tr>';
      return;
    }

    tableBody.innerHTML = filtered.map((laptop) => {
      const reviewUrl = reviewUrls[laptop.id];
      const display = `${laptop.display.size}\" ${laptop.display.res} ${laptop.display.hz}Hz ${laptop.display.panel}`;
      const power = laptop.tgp == null
        ? '<span class="tgp-muted">Not published</span>'
        : `<div class="tgp-power">${laptop.tgp}W <small>MAX</small></div><div class="tgp-bar"><span style="width:${Math.min(100, laptop.tgp / 175 * 100)}%"></span></div>`;
      const review = reviewUrl ? `<a class="tgp-link" href="${reviewUrl}">Read review →</a>` : '<span class="tgp-muted">Pending</span>';
      return `<tr>
        <td><div class="tgp-model">${escapeHtml(laptop.shortName)}</div><div class="tgp-sku">${escapeHtml(laptop.modelCode)}</div></td>
        <td><span class="tgp-gpu">${escapeHtml(laptop.gpu)}</span></td>
        <td>${power}</td>
        <td>${escapeHtml(laptop.gpuVram)}</td>
        <td>${escapeHtml(display)}</td>
        <td>${laptop.weight == null ? '<span class="tgp-muted">N/A</span>' : `${escapeHtml(laptop.weight)}kg`}</td>
        <td><a class="tgp-link" href="${escapeHtml(laptop.specSource)}" target="_blank" rel="nofollow">Source →</a><div class="tgp-sku">Checked ${formatDate(laptop.specCheckedAt)}</div></td>
        <td>${review}</td>
        <td><a class="tgp-link" href="${escapeHtml(laptop.amazonUrl)}" target="_blank" rel="nofollow sponsored">Amazon →</a></td>
      </tr>`;
    }).join('');
  }

  document.getElementById('tgp-search').addEventListener('input', (event) => { state.search = event.target.value.trim(); displayRows(); });
  document.getElementById('tgp-sort').addEventListener('change', (event) => { state.sort = event.target.value; displayRows(); });
  document.querySelectorAll('.tgp-filter').forEach((button) => button.addEventListener('click', () => {
    state.gpu = button.dataset.gpu;
    document.querySelectorAll('.tgp-filter').forEach((candidate) => candidate.classList.toggle('active', candidate === button));
    displayRows();
  }));

  document.getElementById('tgp-model-count').textContent = rows.length;
  document.getElementById('tgp-power-count').textContent = rows.filter((laptop) => laptop.tgp != null).length;
  document.getElementById('tgp-gpu-count').textContent = new Set(rows.map((laptop) => laptop.gpu)).size;
  displayRows();
})();
