import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPECTED_TIERS = new Map([
  ['flagship', 'high-end'],
  ['mid', 'mid-range'],
  ['budget', 'budget'],
]);

async function loadCatalog() {
  const source = await fs.readFile(path.join(ROOT, 'laptops.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'laptops.js' });
  return new Map((sandbox.window.LAPTOPS || []).map((laptop) => [laptop.id, laptop]));
}

async function main() {
  const [html, catalog] = await Promise.all([
    fs.readFile(path.join(ROOT, 'index.html'), 'utf8'),
    loadCatalog(),
  ]);
  const errors = [];

  if (!html.includes('role="tablist"') || !html.includes('role="tabpanel"')) {
    errors.push('homepage pick tiers must use accessible tab semantics');
  }
  if (!html.includes('handlePicksTabKey(event)')) {
    errors.push('homepage pick tabs must support keyboard navigation');
  }

  for (const [panel, expectedTier] of EXPECTED_TIERS) {
    const pattern = new RegExp(`<div\\s+id=["']picks-${panel}["'][^>]*data-fl-picks-grid=["']([^"']+)["']`, 'i');
    const match = pattern.exec(html);
    if (!match) {
      errors.push(`missing picks-${panel} panel`);
      continue;
    }

    const ids = match[1].split(',').map((id) => id.trim());
    if (ids.length !== 3) errors.push(`picks-${panel} must contain exactly 3 recommendations`);

    const picks = ids.map((id) => catalog.get(id));
    ids.forEach((id, index) => {
      const laptop = picks[index];
      if (!laptop) errors.push(`picks-${panel} references unknown laptop ${id}`);
      else if (laptop.tier !== expectedTier) errors.push(`${id} belongs to ${laptop.tier}, not ${expectedTier}`);
      else if (!Number.isFinite(laptop.score)) errors.push(`${id} has no review score and cannot be a best pick`);
    });

    const valid = picks.filter(Boolean);
    for (let index = 1; index < valid.length; index += 1) {
      if (valid[index - 1].score < valid[index].score) {
        errors.push(`picks-${panel} is not sorted by descending review score`);
        break;
      }
    }
  }

  for (const error of errors) console.error(`ERROR ${error}`);
  console.log(`Audited ${EXPECTED_TIERS.size} homepage pick tiers: ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

await main();
