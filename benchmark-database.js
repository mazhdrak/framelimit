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

  const matchedGroups = [...rows.reduce((groups, row) => {
    const key = `${row.datasetId}||${row.game}||${row.conditions}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
    return groups;
  }, new Map()).entries()].filter(([, group]) => group.length > 1 && group.every((row) => row.mode !== 'unclear' && Number.isFinite(row.averageFps))).map(([key, group]) => ({
    key,
    rows: group,
    laptop: group[0].laptop,
    configuration: group[0].configuration,
    game: group[0].game,
    conditions: group[0].conditions,
    sourceName: group[0].sourceName,
    sourceUrl: group[0].sourceUrl
  })).sort((a, b) => a.laptop.localeCompare(b.laptop) || a.game.localeCompare(b.game) || a.conditions.localeCompare(b.conditions));

  const state = { mode: 'all', game: 'all', search: '', sort: 'laptop' };
  const gameSelect = document.getElementById('benchdb-game');
  [...new Set(rows.map((row) => row.game))].sort().forEach((game) => {
    const option = document.createElement('option');
    option.value = game;
    option.textContent = game;
    gameSelect.appendChild(option);
  });

  const chartSelect = document.getElementById('benchdb-chart-select');
  matchedGroups.forEach((group, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${group.laptop} · ${group.game} · ${group.conditions}`;
    chartSelect.appendChild(option);
  });

  function renderMatchedChart(index) {
    const group = matchedGroups[index];
    if (!group) return;
    const maxFps = Math.max(...group.rows.map((row) => row.averageFps));
    document.getElementById('benchdb-chart-title').textContent = `${group.laptop} · ${group.game}`;
    document.getElementById('benchdb-chart-meta').innerHTML = `${escapeHtml(group.conditions)}<br>${escapeHtml(group.configuration)}`;
    document.getElementById('benchdb-chart').innerHTML = group.rows.map((row) => {
      const averageWidth = row.averageFps / maxFps * 100;
      const lowWidth = Number.isFinite(row.low1Fps) ? row.low1Fps / maxFps * 100 : 0;
      return `<div class="benchdb-chart-row ${row.mode}">
        <div class="benchdb-chart-label">${escapeHtml(row.setting)}</div>
        <div class="benchdb-chart-track"><div class="benchdb-chart-bar" style="width:${averageWidth}%"></div>${lowWidth ? `<div class="benchdb-chart-low" style="width:${lowWidth}%"></div>` : ''}</div>
        <div class="benchdb-chart-value">${row.averageFps} FPS<small>${Number.isFinite(row.low1Fps) ? `${row.low1Fps} 1% low` : '1% low N/A'}</small></div>
      </div>`;
    }).join('') + `<p class="benchdb-chart-warning">Source: ${group.sourceUrl ? `<a class="benchdb-link" href="${escapeHtml(group.sourceUrl)}" target="_blank" rel="nofollow noopener">${escapeHtml(group.sourceName)} →</a>` : escapeHtml(group.sourceName)}. Compare only within this chart; no cross-source average is calculated.</p>`;
  }

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
  chartSelect.addEventListener('change', (event) => renderMatchedChart(Number(event.target.value)));
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
  document.getElementById('benchdb-matched-count').textContent = `${matchedGroups.length} exact-condition groups`;
  renderMatchedChart(0);
  displayRows();
})();
