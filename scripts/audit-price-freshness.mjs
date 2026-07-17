import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await fs.readFile(path.join(ROOT, 'laptops.js'), 'utf8');
const sandbox = { window: {}, Date, Intl };
vm.runInNewContext(source, sandbox, { filename: 'laptops.js' });
const laptops = sandbox.window.LAPTOPS || [];
const maxAgeDays = sandbox.window.FL_REFERENCE_PRICE_MAX_AGE_DAYS;
const now = Date.now();
const errors = [];
const priced = laptops.filter((laptop) => Number.isFinite(laptop.price));

if (!Number.isFinite(maxAgeDays) || maxAgeDays < 1 || maxAgeDays > 45) {
  errors.push(`reference-price maximum age must be between 1 and 45 days, found ${maxAgeDays}`);
}
for (const laptop of priced) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(laptop.priceCheckedAt || '')) {
    errors.push(`${laptop.id}: invalid priceCheckedAt`);
    continue;
  }
  const checkedAt = Date.parse(`${laptop.priceCheckedAt}T23:59:59Z`);
  const ageDays = (now - checkedAt) / (24 * 60 * 60 * 1000);
  if (ageDays < 0) errors.push(`${laptop.id}: reference-price date is in the future`);
  if (ageDays > maxAgeDays) errors.push(`${laptop.id}: reference price is ${Math.floor(ageDays)} days old`);
  if (!sandbox.window.flIsReferencePriceFresh(laptop, now)) errors.push(`${laptop.id}: freshness helper rejects a current audited price`);
}

const [priceUi, homepage] = await Promise.all([
  fs.readFile(path.join(ROOT, 'price-data.js'), 'utf8'),
  fs.readFile(path.join(ROOT, 'index.html'), 'utf8')
]);
if (!priceUi.includes('window.flIsReferencePriceFresh(record)')) errors.push('price-data.js does not suppress stale reference prices');
if (!homepage.includes('window.flIsReferencePriceFresh(laptop)')) errors.push('homepage finder does not exclude stale reference prices');

for (const error of errors) console.error(`ERROR reference-price freshness: ${error}`);
console.log(`Audited ${priced.length} dated reference prices with a ${maxAgeDays}-day maximum age: ${errors.length} errors.`);
if (errors.length) process.exitCode = 1;
