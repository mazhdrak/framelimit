import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RETAIL = {
  model: 'GA403UP-CS96',
  asin: 'B0FHZNH1MW',
  cpu: 'Ryzen 9 270',
  gpu: 'RTX 5070',
  tgp: '110W',
  ram: '32GB',
  resolution: ['2880×1800', '2880&times;1800'],
  battery: '73Wh',
  weight: '1.57kg'
};

const FILES = [
  'review-asus-rog-zephyrus-g14-2026.html',
  'guide-best-14-inch-gaming-laptop-2026.html',
  'guide-best-thin-light-gaming-laptop-2026.html',
  'guide-best-gaming-laptop-college-2026.html',
  'guide-best-gaming-laptop-under-2500.html',
  'guide-best-gaming-laptop-video-editing-2026.html'
];

function requireText(errors, source, values, label) {
  if (!values.some((value) => source.includes(value))) errors.push(`missing ${label}`);
}

async function main() {
  let totalErrors = 0;
  for (const file of FILES) {
    const source = await fs.readFile(path.join(ROOT, file), 'utf8');
    const errors = [];
    requireText(errors, source, [RETAIL.model], 'retail model code');
    requireText(errors, source, [RETAIL.gpu], 'retail GPU');
    requireText(errors, source, [RETAIL.tgp], 'retail TGP');
    requireText(errors, source, [RETAIL.ram], 'retail memory');
    requireText(errors, source, RETAIL.resolution, 'retail resolution');
    requireText(errors, source, [RETAIL.battery], 'battery capacity');
    requireText(errors, source, [RETAIL.weight], 'listed weight');
    if (source.includes('review-asus-rog-zephyrus-g14-2026#verified-g14-benchmark')) {
      errors.push('links the retail review to the incompatible GU405AR benchmark anchor');
    }
    if (/Zephyrus G14[^<]{0,100}GU405AR[^<]{0,200}(?:ranked|Best)/i.test(source)) {
      errors.push('still presents GU405AR as the active ranked retail pick');
    }
    errors.forEach((error) => console.log(`ERROR ${file}: ${error}`));
    console.log(`Audited ${file}: ${errors.length} errors.`);
    totalErrors += errors.length;
  }

  const review = await fs.readFile(path.join(ROOT, FILES[0]), 'utf8');
  const reviewErrors = [];
  [RETAIL.asin, RETAIL.cpu, 'Specifications-only for GA403UP-CS96', 'GU405AR', 'do not apply', `amazon.com/dp/${RETAIL.asin}?tag=framelimit20-20`]
    .forEach((value) => requireText(reviewErrors, review, [value], value));
  if (review.includes('"@type": "Product"') || review.includes('"@type":"Product"')) reviewErrors.push('retail specifications-only page still emits Product review markup');
  reviewErrors.forEach((error) => console.log(`ERROR ${FILES[0]}: ${error}`));
  totalErrors += reviewErrors.length;

  console.log(`Audited ${FILES.length} G14 cluster pages: ${totalErrors} total errors.`);
  if (totalErrors) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
