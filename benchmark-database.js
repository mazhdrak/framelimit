(function () {
  'use strict';

  const datasets = window.FL_MODEL_BENCHMARKS || {};
  const tableBody = document.getElementById('benchdb-table-body');
  if (!tableBody) return;

  function classify(setting) {
    const value = String(setting || '');
    if (/not stated|not separated|state not|multiplier not/i.test(value)) return 'unclear';
    if (/MFG\s*x?\d|FG\s*x\d|FG\s*on|Frame Generation\s*on/i.test(value)) return 'generated';
    if (/DLSS|FSR|XeSS|TSR/i.test(value) && !/(DLSS|FSR|XeSS|TSR)(?:\s*\/\s*FG)?\s*off/i.test(value)) return 'upscaled';
    if (/Native/i.test(value)) return 'native';
    return 'unclear';
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function modeLabel(mode) {
    return { native: 'Native', upscaled: 'Upscaled', generated: 'Generated', unclear: 'Unclear' }[mode] || mode;
  }

  const rows = Object.entries(datasets).flatMap(([datasetId, dataset]) => (dataset.games || []).map((game, index) => ({
    datasetId,
    rowId: `${datasetId}-${index}`,
    laptop: dataset.title,
    configuration: dataset.configuration,
    game: game[0],
    conditions: game[1],
    setting: game[2],
    power: game[3],
    averageFps: game[4],
    low1Fps: game[5],
    minimumFps: game[6],
    mode: classify(game[2]),
    sourceName: dataset.sources?.[0]?.[0] || 'Published source',
    sourceUrl: dataset.sources?.[0]?.[1] || ''
  })));

  const state = { mode: 'all', game: 'all', search: '', sort: 'laptop' };
  const gameSelect = document.getElementById('benchdb-game');
  [...new Set(rows.map((row) => row.game))].sort().forEach((game) => {
    const option = document.createElement('option');
    option.value = game;
    option.textContent = game;
    gameSelect.appendChild(option);
  });

  function displayRows() {
    const query = state.search.toLowerCase();
    const filtered = rows.filter((row) => {
      if (state.mode !== 'all' && row.mode !== state.mode) return false;
      if (state.game !== 'all' && row.game !== state.game) return false;
      return !query || [row.laptop, row.configuration, row.game, row.conditions, row.setting, row.power].join(' ').toLowerCase().includes(query);
    });

    filtered.sort((a, b) => {
      if (state.sort === 'fps-desc') return (b.averageFps ?? -1) - (a.averageFps ?? -1) || a.laptop.localeCompare(b.laptop);
      if (state.sort === 'game') return a.game.localeCompare(b.game) || a.laptop.localeCompare(b.laptop);
      if (state.sort === 'mode') return a.mode.localeCompare(b.mode) || a.game.localeCompare(b.game);
      return a.laptop.localeCompare(b.laptop) || a.game.localeCompare(b.game);
    });

    document.getElementById('benchdb-result-count').textContent = `${filtered.length} of ${rows.length} sourced game rows shown`;
    if (!filtered.length) {
      tableBody.innerHTML = '<tr><td colspan="9" class="benchdb-empty">No published rows match these filters.</td></tr>';
      return;
    }

    tableBody.innerHTML = filtered.map((row) => `<tr>
      <td><div class="benchdb-model">${escapeHtml(row.laptop)}</div><div class="benchdb-config">${escapeHtml(row.configuration)}</div></td>
      <td><strong>${escapeHtml(row.game)}</strong><div class="benchdb-config">${escapeHtml(row.conditions)}</div></td>
      <td><span class="benchdb-mode ${row.mode}">${modeLabel(row.mode)}</span><div class="benchdb-setting">${escapeHtml(row.setting)}</div></td>
      <td>${escapeHtml(row.power)}</td>
      <td class="benchdb-fps">${row.averageFps ?? 'N/A'}</td>
      <td>${row.low1Fps ?? 'N/A'}</td>
      <td>${row.minimumFps ?? 'N/A'}</td>
      <td>${row.sourceUrl ? `<a class="benchdb-link" href="${escapeHtml(row.sourceUrl)}" target="_blank" rel="nofollow noopener">${escapeHtml(row.sourceName)} →</a>` : '<span class="benchdb-muted">Source unavailable</span>'}</td>
    </tr>`).join('');
  }

  document.getElementById('benchdb-search').addEventListener('input', (event) => { state.search = event.target.value.trim(); displayRows(); });
  gameSelect.addEventListener('change', (event) => { state.game = event.target.value; displayRows(); });
  document.getElementById('benchdb-sort').addEventListener('change', (event) => { state.sort = event.target.value; displayRows(); });
  document.querySelectorAll('.benchdb-filter').forEach((button) => button.addEventListener('click', () => {
    state.mode = button.dataset.mode;
    document.querySelectorAll('.benchdb-filter').forEach((candidate) => candidate.classList.toggle('active', candidate === button));
    displayRows();
  }));

  document.getElementById('benchdb-row-count').textContent = rows.length;
  document.getElementById('benchdb-dataset-count').textContent = Object.keys(datasets).length;
  document.getElementById('benchdb-game-count').textContent = new Set(rows.map((row) => row.game)).size;
  document.getElementById('benchdb-generated-count').textContent = rows.filter((row) => row.mode === 'generated').length;
  displayRows();
})();
