import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'guide-rtx-50-laptop-tgp-database.html';

async function loadLaptops() {
  const source = await fs.readFile(path.join(ROOT, 'laptops.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'laptops.js' });
  return sandbox.window.LAPTOPS || [];
}

function add(results, message) {
  results.push(message);
}

async function main() {
  const [laptops, page, script, sitemap, guides, nav] = await Promise.all([
    loadLaptops(),
    fs.readFile(path.join(ROOT, PAGE), 'utf8'),
    fs.readFile(path.join(ROOT, 'tgp-database.js'), 'utf8'),
    fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8'),
    fs.readFile(path.join(ROOT, 'guides.html'), 'utf8'),
    fs.readFile(path.join(ROOT, 'nav.js'), 'utf8')
  ]);
  const results = [];
  const rows = laptops.filter((laptop) => /^RTX 50/.test(laptop.gpu) && laptop.modelCode && laptop.specSource && laptop.specCheckedAt);
  const knownPower = rows.filter((laptop) => laptop.tgp != null);
  const gpuTiers = new Set(rows.map((laptop) => laptop.gpu));
  const powerSpreadGroups = [...gpuTiers].filter((gpu) => new Set(rows.filter((laptop) => laptop.gpu === gpu && laptop.tgp != null).map((laptop) => laptop.tgp)).size > 1);
  const modelCodes = new Set();

  for (const laptop of rows) {
    if (modelCodes.has(laptop.modelCode)) add(results, `duplicate model code: ${laptop.modelCode}`);
    modelCodes.add(laptop.modelCode);
    if (!/^https:\/\//.test(laptop.specSource)) add(results, `${laptop.id} has a non-HTTPS source`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(laptop.specCheckedAt)) add(results, `${laptop.id} has an invalid source-check date`);
    if (!/amazon\.com\/dp\/[A-Z0-9]{10}/i.test(laptop.amazonUrl || '')) add(results, `${laptop.id} is missing a direct Amazon ASIN URL`);
  }

  const expectedText = [
    `${rows.length} sourced configurations`,
    `${knownPower.length} published power values`,
    `${gpuTiers.size} RTX 50 GPU tiers`
  ];
  for (const value of expectedText) if (!page.includes(value)) add(results, `page summary is missing current value: ${value}`);

  if (!page.includes('tgp-database.js') || !page.includes('laptops.js')) add(results, 'database page is missing its data scripts');
  if (!page.includes('id="same-gpu-tgp"') || !page.includes(`${powerSpreadGroups.length} same-GPU power groups`)) add(results, 'database page is missing the current same-GPU TGP comparison section');
  if (!script.includes('renderPowerSpread') || !script.includes('tgp-spread-grid')) add(results, 'client script does not render same-GPU TGP spreads');
  if (!page.includes('"@type": "Dataset"')) add(results, 'database page is missing Dataset JSON-LD');
  if (!sitemap.includes('https://framelimit.com/guide-rtx-50-laptop-tgp-database')) add(results, 'database page is missing from sitemap.xml');
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
  console.log(`Audited RTX 50 TGP database: ${rows.length} sourced rows, ${knownPower.length} power values, ${results.length} errors.`);
  if (results.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
