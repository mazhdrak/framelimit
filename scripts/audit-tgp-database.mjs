import fs from 'node:fs/promises';
import path from 'node:path';
import {
  CSV_COLUMNS,
  CSV_EXPORT,
  DATASET_LICENSE_URL,
  DATASET_PAGE_URL,
  DATASET_RELEASE_DATE,
  DATASET_VERSION,
  JSON_EXPORT,
  ROOT,
  createCsv,
  createDatasetRows,
  createJsonDataset,
  loadLaptops
} from './tgp-dataset-lib.mjs';

const PAGE = 'guide-rtx-50-laptop-tgp-database.html';

function add(results, message) {
  results.push(message);
}

async function main() {
  const laptops = await loadLaptops();
  const rows = createDatasetRows(laptops);
  const [page, script, sitemap, guides, nav, methodology, jsonExport, csvExport] = await Promise.all([
    fs.readFile(path.join(ROOT, PAGE), 'utf8'),
    fs.readFile(path.join(ROOT, 'tgp-database.js'), 'utf8'),
    fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8'),
    fs.readFile(path.join(ROOT, 'guides.html'), 'utf8'),
    fs.readFile(path.join(ROOT, 'nav.js'), 'utf8'),
    fs.readFile(path.join(ROOT, 'methodology.html'), 'utf8'),
    fs.readFile(path.join(ROOT, JSON_EXPORT), 'utf8'),
    fs.readFile(path.join(ROOT, CSV_EXPORT), 'utf8')
  ]);
  const results = [];
  const knownPower = rows.filter((row) => row.oemMaximumGpuPowerWatts != null);
  const gpuTiers = new Set(rows.map((row) => row.gpu));
  const powerSpreadGroups = [...gpuTiers].filter((gpu) => new Set(rows.filter((row) => row.gpu === gpu && row.oemMaximumGpuPowerWatts != null).map((row) => row.oemMaximumGpuPowerWatts)).size > 1);
  const modelCodes = new Set();

  for (const row of rows) {
    if (modelCodes.has(row.exactModelSku)) add(results, `duplicate model code: ${row.exactModelSku}`);
    modelCodes.add(row.exactModelSku);
    if (!/^https:\/\//.test(row.sourceUrl)) add(results, `${row.id} has a non-HTTPS source`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.lastVerified)) add(results, `${row.id} has an invalid source-check date`);
    if (!['official-oem-specification', 'official-source-tgp-not-published'].includes(row.evidenceStatus)) add(results, `${row.id} has an invalid evidence status`);
    if (!row.nvidiaGpuSubsystemPowerRangeWatts) add(results, `${row.id} has no NVIDIA power-range reference`);
  }

  const expectedJson = `${JSON.stringify(createJsonDataset(rows), null, 2)}\n`;
  const expectedCsv = createCsv(rows);
  if (jsonExport !== expectedJson) add(results, `${JSON_EXPORT} is stale; run node scripts/generate-tgp-dataset.mjs`);
  if (csvExport !== expectedCsv) add(results, `${CSV_EXPORT} is stale; run node scripts/generate-tgp-dataset.mjs`);

  try {
    const parsed = JSON.parse(jsonExport);
    if (parsed.version !== DATASET_VERSION || parsed.released !== DATASET_RELEASE_DATE) add(results, 'JSON export metadata does not match the current release');
    if (parsed.pageUrl !== DATASET_PAGE_URL || parsed.licenseUrl !== DATASET_LICENSE_URL) add(results, 'JSON export citation or license URL is incorrect');
    if (!Array.isArray(parsed.records) || parsed.records.length !== rows.length) add(results, 'JSON export record count does not match the catalog');
  } catch {
    add(results, 'JSON export is invalid JSON');
  }
  if (csvExport.split(/\r?\n/, 1)[0] !== CSV_COLUMNS.join(',')) add(results, 'CSV export columns are out of contract');

  const expectedText = [
    `${rows.length} sourced configurations`,
    `${knownPower.length} published power values`,
    `${gpuTiers.size} RTX 50 GPU tiers`,
    `Dataset version ${DATASET_VERSION}`
  ];
  for (const value of expectedText) if (!page.includes(value)) add(results, `page summary is missing current value: ${value}`);

  if (!page.includes('tgp-database.js') || !page.includes('laptops.js')) add(results, 'database page is missing its data scripts');
  if (!page.includes(`href="${CSV_EXPORT}" download`) || !page.includes(`href="${JSON_EXPORT}" download`)) add(results, 'database page is missing downloadable CSV or JSON links');
  if (!page.includes('id="how-to-cite"') || !page.includes(DATASET_PAGE_URL) || !page.includes(DATASET_LICENSE_URL)) add(results, 'database page is missing complete citation guidance');
  if (!page.includes('id="dataset-changelog"') || !page.includes(`Version ${DATASET_VERSION}`) || !page.includes(DATASET_RELEASE_DATE)) add(results, 'database page is missing the current version changelog');
  if (!page.includes('"distribution"') || !page.includes(`"version": "${DATASET_VERSION}"`)) add(results, 'Dataset JSON-LD is missing export distribution or version metadata');
  if (!page.includes('id="same-gpu-tgp"') || !page.includes(`${powerSpreadGroups.length} same-GPU power groups`)) add(results, 'database page is missing the current same-GPU TGP comparison section');
  if (!script.includes('renderPowerSpread') || !script.includes('tgp-spread-grid')) add(results, 'client script does not render same-GPU TGP spreads');
  if (!script.includes("/^RTX 50/.test(laptop.gpu) && laptop.modelCode && laptop.specSource && laptop.specCheckedAt")) add(results, 'HTML table renderer does not use the canonical export inclusion rule');
  for (const marker of ['laptop.id', 'laptop.modelCode', 'laptop.gpu', 'laptop.tgp', 'laptop.specSource', 'laptop.specCheckedAt', 'evidenceStatus(laptop)']) {
    if (!script.includes(marker)) add(results, `HTML table renderer is missing canonical field: ${marker}`);
  }
  if (!page.includes('"@type": "Dataset"')) add(results, 'database page is missing Dataset JSON-LD');
  if (!page.includes('"license":') || !page.includes(`"url": "${DATASET_LICENSE_URL}"`)) add(results, 'Dataset JSON-LD is missing the versioned data license');
  if (!page.includes('"isAccessibleForFree": true')) add(results, 'Dataset JSON-LD must identify free public access');
  if (!methodology.includes('id="data-license-v1-0"') || !methodology.includes('FRAMELIMIT Data License 1.0')) add(results, 'methodology is missing the public license target');
  if (!sitemap.includes(DATASET_PAGE_URL)) add(results, 'database page is missing from sitemap.xml');
  if (!guides.includes('href="guide-rtx-50-laptop-tgp-database"')) add(results, 'database page is missing from guides.html');
  if (!nav.includes('href="guide-rtx-50-laptop-tgp-database"')) add(results, 'database page is missing from mobile navigation');

  const backlinkFiles = [
    'guide-best-rtx-5080-gaming-laptop-2026.html',
    'guide-best-rtx-5090-gaming-laptop-2026.html',
    'review-lenovo-legion-pro-7i-gen10.html',
    'review-hp-omen-max-16-2026.html',
    'review-msi-vector-16-hx-ai.html',
    'review-asus-rog-strix-scar-16-2026.html',
    'review-asus-rog-strix-scar-18-2026.html'
  ];
  for (const file of backlinkFiles) {
    const source = await fs.readFile(path.join(ROOT, file), 'utf8');
    if (!source.includes('href="guide-rtx-50-laptop-tgp-database"')) add(results, `${file} does not link back to the database`);
  }

  const reviewTargets = Array.from(script.matchAll(/:\s*'(review-[^']+)'/g), (match) => match[1]);
  for (const target of reviewTargets) {
    try { await fs.access(path.join(ROOT, `${target}.html`)); } catch { add(results, `review map target does not exist: ${target}`); }
  }

  results.forEach((message) => console.log(`ERROR ${PAGE}: ${message}`));
  console.log(`Audited RTX 50 TGP distribution pack: ${rows.length} catalog rows, ${knownPower.length} power values, ${results.length} errors.`);
  if (results.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
