import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'guide-gaming-laptop-price-report-july-2026.html';

async function loadWindowFile(file) {
  const source = await fs.readFile(path.join(ROOT, file), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: file });
  return sandbox.window;
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

async function main() {
  const [laptopWindow, historyWindow, page, script, workflow, sitemap, guides, nav] = await Promise.all([
    loadWindowFile('laptops.js'), loadWindowFile('price-history.js'),
    fs.readFile(path.join(ROOT, PAGE), 'utf8'), fs.readFile(path.join(ROOT, 'price-report.js'), 'utf8'),
    fs.readFile(path.join(ROOT, '.github/workflows/update-amazon-prices.yml'), 'utf8'),
    fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8'), fs.readFile(path.join(ROOT, 'guides.html'), 'utf8'),
    fs.readFile(path.join(ROOT, 'nav.js'), 'utf8')
  ]);
  const errors = [];
  const laptops = laptopWindow.LAPTOPS || [];
  const priced = laptops.filter((item) => Number.isFinite(item.price));
  const expectedMedian = median(priced.map((item) => item.price));
  const requiredText = [`${laptops.length} current configurations`, `${priced.length} reference-price records`, `$${expectedMedian.toLocaleString('en-US')}`];
  requiredText.forEach((value) => { if (!page.includes(value)) errors.push(`page is missing current baseline value: ${value}`); });

  if (!page.includes('"@type":"Dataset"')) errors.push('page is missing Dataset JSON-LD');
  if (!page.includes('price-history.js') || !page.includes('price-report.js') || !page.includes('laptops.js')) errors.push('page is missing a required data script');
  if (!script.includes('Insufficient history') || !script.includes('EDITORIAL REFERENCE')) errors.push('client script does not preserve price-status labels');
  if (!script.includes('latestCandidate.asin === currentAsin') || !script.includes('oldCandidate.asin === live.asin')) errors.push('client script does not enforce same-ASIN monthly comparisons');
  if (!workflow.includes('node scripts/archive-price-snapshot.mjs')) errors.push('Amazon workflow does not archive monthly history');
  if (!workflow.includes('price-snapshot.js price-history.js')) errors.push('Amazon workflow does not commit both price files');
  if (!sitemap.includes('https://framelimit.com/guide-gaming-laptop-price-report-july-2026')) errors.push('page is missing from sitemap.xml');
  if (!guides.includes('href="guide-gaming-laptop-price-report-july-2026"')) errors.push('page is missing from guides.html');
  if (!nav.includes('href="guide-gaming-laptop-price-report-july-2026"')) errors.push('page is missing from mobile navigation');

  for (const file of ['guide-best-gaming-laptops-2026.html', 'guide-best-gaming-laptop-under-1500.html', 'guide-best-gaming-laptop-under-3000.html']) {
    const source = await fs.readFile(path.join(ROOT, file), 'utf8');
    if (!source.includes('href="guide-gaming-laptop-price-report-july-2026"')) errors.push(`${file} does not link to the monthly report`);
  }

  const history = historyWindow.FL_PRICE_HISTORY || {};
  if (!Array.isArray(history.snapshots)) errors.push('price-history.js snapshots must be an array');
  for (const snapshot of history.snapshots || []) {
    if (!/^\d{4}-\d{2}$/.test(snapshot.month || '')) errors.push(`invalid history month: ${snapshot.month}`);
    if (!snapshot.generatedAt || !snapshot.offers) errors.push(`incomplete history snapshot: ${snapshot.month}`);
    const seenAsins = new Set();
    for (const [id, offer] of Object.entries(snapshot.offers || {})) {
      if (!/^[A-Z0-9]{10}$/.test(offer.asin || '')) errors.push(`${snapshot.month}/${id} has an invalid ASIN`);
      if (!Number.isFinite(offer.price) || offer.price <= 0) errors.push(`${snapshot.month}/${id} has an invalid price`);
      if (!offer.checkedAt) errors.push(`${snapshot.month}/${id} is missing checkedAt`);
      if (seenAsins.has(offer.asin)) errors.push(`${snapshot.month} repeats ASIN ${offer.asin}`);
      seenAsins.add(offer.asin);
    }
  }

  errors.forEach((message) => console.log(`ERROR ${PAGE}: ${message}`));
  console.log(`Audited monthly price report: ${laptops.length} configurations, ${priced.length} reference prices, ${(history.snapshots || []).length} live months, ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
