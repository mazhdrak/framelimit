import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ID = 'lenovo-legion-5-gen10-amd';
const ASIN = 'B0FPFP4T1R';
const FILES = [
  'review-lenovo-legion-5-gen10-amd.html',
  'reviews.html',
  'guide-best-thin-light-gaming-laptop-2026.html',
];

async function main() {
  const source = await fs.readFile(path.join(ROOT, 'laptops.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'laptops.js' });
  const matches = sandbox.window.LAPTOPS.filter((item) => item.id === ID);
  const errors = [];
  if (matches.length !== 1) errors.push(`expected one ${ID} catalog record, found ${matches.length}`);
  const item = matches[0];
  const expected = ['Legion 5 15AHP10', 'RTX 5060', '8GB GDDR7', 'AMD Ryzen 7 260', '16GB DDR5-5600', '1TB PCIe Gen4 NVMe', ASIN];
  if (item) {
    const record = JSON.stringify(item);
    for (const value of expected) if (!record.includes(value)) errors.push(`catalog missing ${value}`);
    if (item.tgp !== 115) errors.push(`catalog TGP must be 115W, found ${item.tgp}`);
    if (item.score != null || item.scores != null) errors.push('exact retail SKU must remain unranked');
  }
  for (const file of FILES) {
    const html = await fs.readFile(path.join(ROOT, file), 'utf8');
    if (!html.includes(ASIN)) errors.push(`${file} missing exact ASIN ${ASIN}`);
    if (html.includes('B0FVKMHCLS') || html.includes('B0FKHBQD31')) errors.push(`${file} retains an unsupported Legion 5 ASIN`);
  }
  const review = await fs.readFile(path.join(ROOT, FILES[0]), 'utf8');
  for (const value of ['15AHP10', 'RTX 5060', '16GB DDR5', '1.9kg', 'Specifications and the retail mapping were checked July 15, 2026']) {
    if (!review.includes(value)) errors.push(`review missing ${value}`);
  }
  const reviews = await fs.readFile(path.join(ROOT, 'reviews.html'), 'utf8');
  if (!reviews.includes('id="verified-legion5amd-benchmark" hidden data-nosnippet')) errors.push('legacy related benchmark block is not suppressed');
  if (source.includes("id: 'lenovo-legion-7-gen11'")) errors.push('misidentified duplicate catalog record remains');
  for (const error of errors) console.error(`ERROR ${error}`);
  console.log(`Audited Legion 5 15AHP10 retail mapping across ${FILES.length} pages: ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
