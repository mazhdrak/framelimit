import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ID = 'razer-blade-14-2025';
const ASIN = 'B0DYLB2QRF';
const URL = `amazon.com/dp/${ASIN}?tag=framelimit20-20`;
const LINK_FILES = [
  'review-razer-blade-14-2026.html',
  'reviews.html',
  'guide-best-14-inch-gaming-laptop-2026.html',
  'guide-best-thin-light-gaming-laptop-2026.html',
  'guide-best-gaming-laptop-under-2500.html'
];

function requireText(errors, source, values, label) {
  if (!values.some((value) => source.includes(value))) errors.push(`missing ${label}`);
}

async function main() {
  const errors = [];
  const catalogSource = await fs.readFile(path.join(ROOT, 'laptops.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(catalogSource, sandbox, { filename: 'laptops.js' });
  const laptop = (sandbox.window.LAPTOPS || []).find((item) => item.id === ID);
  if (!laptop) {
    errors.push(`central catalog is missing ${ID}`);
  } else {
    const expected = {
      modelCode: 'RZ09-05306ES3-R3U1', gpu: 'RTX 5070', gpuVram: '8GB GDDR7', tgp: 115,
      cpu: 'AMD Ryzen AI 9 365', ram: '32GB LPDDR5X', storage: '1TB PCIe Gen4 NVMe',
      amazonAsin: ASIN, battery: 72, weight: 1.63
    };
    for (const [field, value] of Object.entries(expected)) {
      if (laptop[field] !== value) errors.push(`${ID} ${field} is ${laptop[field]}, expected ${value}`);
    }
    if (laptop.display?.res !== '2880×1800' || laptop.display?.hz !== 120 || laptop.display?.panel !== 'OLED') {
      errors.push(`${ID} display mapping is not exact`);
    }
    if (laptop.amazonUrl !== `https://www.${URL}`) errors.push(`${ID} affiliate URL is not the direct ASIN`);
    if (laptop.score !== null) errors.push(`${ID} must remain unranked`);
  }

  for (const file of LINK_FILES) {
    const source = await fs.readFile(path.join(ROOT, file), 'utf8');
    requireText(errors, source, [URL], `${file} direct Blade 14 affiliate URL`);
  }

  const review = await fs.readFile(path.join(ROOT, 'review-razer-blade-14-2026.html'), 'utf8');
  ['RZ09-05306ES3-R3U1', ASIN, 'Ryzen AI 9 365', '115W', '32GB LPDDR5X', '1TB PCIe 4.0 NVMe SSD', '72Wh', '1.63kg']
    .forEach((value) => requireText(errors, review, [value], `review exact value ${value}`));

  const central = await fs.readFile(path.join(ROOT, 'reviews.html'), 'utf8');
  const bladeCard = central.match(/<article class="review-card visible" id="blade14"[\s\S]*?<\/article>/)?.[0] || '';
  if (!bladeCard.includes(`data-laptop-id="${ID}"`)) errors.push('central Blade 14 card is not mapped to laptops.js');
  if (bladeCard.includes('B0FHZNH1MW')) errors.push('central Blade 14 card still links to the Zephyrus G14 ASIN');

  errors.forEach((error) => console.log(`ERROR ${error}`));
  console.log(`Audited Blade 14 retail mapping across ${LINK_FILES.length} pages: ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
