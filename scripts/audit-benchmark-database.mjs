import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'guide-dlss-fsr-frame-generation-database.html';
const SLUG = PAGE.replace(/\.html$/, '');

async function loadBenchmarkData() {
  const source = await fs.readFile(path.join(ROOT, 'benchmark-data.js'), 'utf8');
  const sandbox = { window: {}, document: { readyState: 'loading', addEventListener() {} } };
  vm.runInNewContext(source, sandbox, { filename: 'benchmark-data.js' });
  return sandbox.window.FL_MODEL_BENCHMARKS || {};
}

function classify(setting) {
  const value = String(setting || '');
  if (/not stated|not separated|state not|multiplier not/i.test(value)) return 'unclear';
  if (/MFG\s*x?\d|FG\s*x\d|FG\s*on|Frame Generation\s*on/i.test(value)) return 'generated';
  if (/DLSS|FSR|XeSS|TSR/i.test(value) && !/(DLSS|FSR|XeSS|TSR)(?:\s*\/\s*FG)?\s*off/i.test(value)) return 'upscaled';
  if (/Native/i.test(value)) return 'native';
  return 'unclear';
}

async function main() {
  const datasets = await loadBenchmarkData();
  const rows = Object.values(datasets).flatMap((dataset) => dataset.games || []);
  const games = new Set(rows.map((row) => row[0]));
  const generated = rows.filter((row) => classify(row[2]) === 'generated');
  const matchedGroups = Object.values(datasets).flatMap((dataset) => {
    const groups = new Map();
    for (const row of dataset.games || []) {
      const key = `${row[0]}||${row[1]}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }
    return [...groups.values()].filter((group) => group.length > 1 && group.every((row) => classify(row[2]) !== 'unclear' && Number.isFinite(row[4])));
  });
  const lowRows = rows.filter((row) => Number.isFinite(row[5]));
  const minimumRows = rows.filter((row) => Number.isFinite(row[6]));
  const [page, script, sitemap] = await Promise.all([
    fs.readFile(path.join(ROOT, PAGE), 'utf8'),
    fs.readFile(path.join(ROOT, 'benchmark-database.js'), 'utf8'),
    fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8')
  ]);
  const errors = [];

  const requiredPageText = [
    `${Object.keys(datasets).length} benchmark datasets`,
    `${rows.length} game rows`,
    `${games.size} games`,
    `${generated.length}</b><span>Generated-frame rows`,
    `${matchedGroups.length} exact-condition groups`,
    `${lowRows.length} rows include a published 1% low`,
    `${minimumRows.length} include a minimum FPS`,
    '"@type":"Dataset"',
    '"@type":"FAQPage"',
    'Generated FPS is not rendered FPS',
    `rel="canonical" href="https://framelimit.com/${SLUG}"`,
    'benchmark-data.js',
    'benchmark-database.js'
  ];
  requiredPageText.forEach((value) => { if (!page.includes(value)) errors.push(`page is missing: ${value}`); });
  if (page.indexOf('benchmark-data.js') > page.indexOf('nav.js')) errors.push('benchmark-data.js must load before nav.js to prevent duplicate injection');

  for (const [id, dataset] of Object.entries(datasets)) {
    if (!dataset.title || !dataset.configuration) errors.push(`${id} is missing title or configuration`);
    if ((dataset.games || []).length && !(dataset.sources || []).some((source) => /^https:\/\//.test(source[1] || ''))) errors.push(`${id} has game rows without an HTTPS source`);
  }

  ['native', 'upscaled', 'generated', 'unclear'].forEach((mode) => {
    if (!page.includes(`data-mode="${mode}"`)) errors.push(`page filter is missing ${mode}`);
  });
  if (!script.includes('FL_MODEL_BENCHMARKS')) errors.push('client script does not use the central benchmark datasets');
  if (!script.includes("return 'generated'") || !script.includes("return 'upscaled'") || !script.includes("return 'native'")) errors.push('client classifier is incomplete');
  if (!page.includes('id="matched-mode-charts"') || !script.includes('renderMatchedChart') || !script.includes('matchedGroups')) errors.push('matched-condition charts are incomplete');
  if (!script.includes('role="img"') || !script.includes('aria-label=') || !script.includes('aria-hidden="true"')) errors.push('matched-condition charts are missing accessible value labels');
  if (!page.includes('Performance-per-dollar is intentionally omitted')) errors.push('chart section is missing the live-price limitation');
  if (!sitemap.includes(`https://framelimit.com/${SLUG}`)) errors.push('database is missing from sitemap.xml');

  const backlinks = ['guides.html', 'nav.js', 'methodology.html', 'guide-rtx-50-laptop-tgp-database.html', 'guide-rtx-vs-amd-2026.html'];
  for (const file of backlinks) {
    const source = await fs.readFile(path.join(ROOT, file), 'utf8');
    if (!source.includes(`href="${SLUG}"`)) errors.push(`${file} does not link to the database`);
  }

  errors.forEach((message) => console.log(`ERROR ${PAGE}: ${message}`));
  console.log(`Audited benchmark database: ${Object.keys(datasets).length} datasets, ${rows.length} game rows, ${games.size} games, ${matchedGroups.length} matched chart groups, ${lowRows.length} lows, ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
