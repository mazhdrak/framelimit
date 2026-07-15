import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'guide-legion-pro-7i-vs-rog-strix-g16-rtx-5080.html';
const SLUG = PAGE.replace(/\.html$/, '');
const IDS = ['lenovo-legion-pro-7i-gen10', 'asus-rog-strix-g16-2026'];

async function loadLaptops() {
  const source = await fs.readFile(path.join(ROOT, 'laptops.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'laptops.js' });
  return sandbox.window.LAPTOPS || [];
}

function requireText(errors, source, value, label) {
  if (!source.includes(String(value))) errors.push(`missing ${label}: ${value}`);
}

async function main() {
  const laptops = await loadLaptops();
  const items = IDS.map((id) => laptops.find((laptop) => laptop.id === id));
  const [page, sitemap] = await Promise.all([
    fs.readFile(path.join(ROOT, PAGE), 'utf8'),
    fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8')
  ]);
  const errors = [];

  items.forEach((item, index) => {
    if (!item) {
      errors.push(`central catalog is missing ${IDS[index]}`);
      return;
    }
    const exactValues = [
      [item.modelCode, `${item.id} model code`],
      [item.gpu, `${item.id} GPU`],
      [item.gpuVram, `${item.id} VRAM`],
      [`${item.tgp}W`, `${item.id} TGP`],
      [item.cpu.replace(/^Intel /, ''), `${item.id} CPU`],
      [item.ram, `${item.id} memory`],
      [item.storage, `${item.id} storage`],
      [item.display.res, `${item.id} display resolution`],
      [`${item.display.hz}Hz`, `${item.id} refresh rate`],
      [`${item.battery}Wh`, `${item.id} battery`],
      [String(item.weight), `${item.id} weight`],
      [item.amazonAsin, `${item.id} ASIN`]
    ];
    exactValues.forEach(([value, label]) => requireText(errors, page, value, label));
    requireText(errors, page, `amazon.com/dp/${item.amazonAsin}?tag=framelimit20-20`, `${item.id} direct affiliate URL`);
  });

  requireText(errors, page, '"@type": "Article"', 'Article JSON-LD');
  requireText(errors, page, '"@type": "FAQPage"', 'FAQPage JSON-LD');
  requireText(errors, page, `rel="canonical" href="https://framelimit.com/${SLUG}"`, 'canonical URL');
  requireText(errors, page, 'No Defensible Universal Winner', 'evidence-safe performance verdict');
  requireText(errors, page, 'not a live checkout price', 'reference-price disclosure');
  requireText(errors, sitemap, `https://framelimit.com/${SLUG}`, 'sitemap URL');

  const backlinks = [
    'guides.html',
    'compare.html',
    'guide-best-rtx-5080-gaming-laptop-2026.html',
    'review-lenovo-legion-pro-7i-gen10.html',
    'review-asus-rog-strix-g16-2026.html'
  ];
  for (const file of backlinks) {
    const source = await fs.readFile(path.join(ROOT, file), 'utf8');
    if (!source.includes(`href="${SLUG}`)) errors.push(`${file} does not link to ${SLUG}`);
  }

  errors.forEach((message) => console.log(`ERROR ${PAGE}: ${message}`));
  console.log(`Audited model comparison: ${items.filter(Boolean).length} exact configurations, ${backlinks.length} backlinks, ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
