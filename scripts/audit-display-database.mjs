import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'guide-gaming-laptop-display-database.html';
const SLUG = PAGE.replace(/\.html$/, '');

async function loadLaptops() {
  const source = await fs.readFile(path.join(ROOT, 'laptops.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'laptops.js' });
  return sandbox.window.LAPTOPS || [];
}

function panelType(value) {
  if (/mini.?led/i.test(value || '')) return 'Mini-LED';
  if (/oled/i.test(value || '')) return 'OLED';
  if (/ips/i.test(value || '')) return 'IPS';
  return 'Other';
}

async function main() {
  const [laptops, page, client, sitemap] = await Promise.all([
    loadLaptops(),
    fs.readFile(path.join(ROOT, PAGE), 'utf8'),
    fs.readFile(path.join(ROOT, 'display-database.js'), 'utf8'),
    fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8')
  ]);
  const errors = [];
  const rows = laptops.filter((laptop) => laptop.modelCode && laptop.specSource && laptop.specCheckedAt && laptop.display);
  const panelCounts = rows.reduce((counts, laptop) => {
    const panel = panelType(laptop.display.panel);
    counts[panel] = (counts[panel] || 0) + 1;
    return counts;
  }, {});
  const brightnessRows = rows.filter((laptop) => Number.isFinite(laptop.display.nits));
  const hdrRows = rows.filter((laptop) => laptop.display.hdr);
  const fastRows = rows.filter((laptop) => laptop.display.hz >= 240);
  const modelCodes = new Set();

  for (const laptop of rows) {
    if (modelCodes.has(laptop.modelCode)) errors.push(`duplicate exact model code: ${laptop.modelCode}`);
    modelCodes.add(laptop.modelCode);
    if (!/^https:\/\//.test(laptop.specSource)) errors.push(`${laptop.id} has a non-HTTPS specification source`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(laptop.specCheckedAt)) errors.push(`${laptop.id} has an invalid specification check date`);
    if (!/amazon\.com\/dp\/[A-Z0-9]{10}/i.test(laptop.amazonUrl || '')) errors.push(`${laptop.id} is missing a direct Amazon ASIN URL`);
    if (!Number.isFinite(laptop.display.size) || !laptop.display.res || !Number.isFinite(laptop.display.hz)) errors.push(`${laptop.id} has incomplete display identity fields`);
  }

  const requiredPageText = [
    `${rows.length} sourced configurations`,
    `${panelCounts.OLED || 0} OLED`,
    `${panelCounts['Mini-LED'] || 0} Mini-LED`,
    `${panelCounts.IPS || 0} IPS`,
    `${brightnessRows.length} brightness records`,
    `<b id="displaydb-hdr-count">${hdrRows.length}</b>`,
    `<b id="displaydb-fast-count">${fastRows.length}</b>`,
    '"@type":"Dataset"',
    '"@type":"FAQPage"',
    `rel="canonical" href="https://framelimit.com/${SLUG}"`,
    'Published specifications are not lab measurements',
    'What Is Deliberately Missing?',
    'Color gamut, Delta E, black level, contrast ratio and response time',
    'laptops.js',
    'display-database.js'
  ];
  for (const value of requiredPageText) if (!page.includes(value)) errors.push(`page is missing: ${value}`);

  ['all', 'OLED', 'Mini-LED', 'IPS'].forEach((panel) => {
    if (!page.includes(`data-panel="${panel}"`)) errors.push(`page filter is missing ${panel}`);
  });
  if (!client.includes('laptop.modelCode && laptop.specSource && laptop.specCheckedAt && laptop.display')) errors.push('client does not restrict rows to exact sourced configurations');
  if (!client.includes('Specification source') || !client.includes('Check exact retail page')) errors.push('client does not expose source and exact retail links');
  if (!sitemap.includes(`https://framelimit.com/${SLUG}`)) errors.push('database is missing from sitemap.xml');

  const backlinks = [
    'guides.html',
    'nav.js',
    'methodology.html',
    'guide-gaming-laptop-buying-guide-2026.html',
    'guide-rtx-50-laptop-tgp-database.html'
  ];
  for (const file of backlinks) {
    const source = await fs.readFile(path.join(ROOT, file), 'utf8');
    if (!source.includes(`href="${SLUG}"`)) errors.push(`${file} does not link to the display database`);
  }

  errors.forEach((message) => console.log(`ERROR ${PAGE}: ${message}`));
  console.log(`Audited display database: ${rows.length} sourced rows, ${brightnessRows.length} brightness values, ${hdrRows.length} HDR labels, ${fastRows.length} high-refresh rows, ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
