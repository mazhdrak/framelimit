import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadCatalog() {
  const source = await fs.readFile(path.join(ROOT, 'laptops.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'laptops.js' });
  return sandbox.window.LAPTOPS || [];
}

async function loadReviewMap() {
  const source = await fs.readFile(path.join(ROOT, 'laptop-cards.js'), 'utf8');
  return new Map(Array.from(source.matchAll(/'([^']+)':\s*'([^']+)'/g), ([, id, target]) => [id, target]));
}

async function main() {
  const [catalog, reviewMap] = await Promise.all([loadCatalog(), loadReviewMap()]);
  const errors = [];
  const checked = [];
  const checkedAnchors = [];
  const ids = new Set();
  const asins = new Set();

  for (const laptop of catalog) {
    if (ids.has(laptop.id)) errors.push(`duplicate catalog id ${laptop.id}`);
    ids.add(laptop.id);
    if (!laptop.amazonAsin || !/^[A-Z0-9]{10}$/.test(laptop.amazonAsin)) errors.push(`${laptop.id} has invalid ASIN`);
    if (asins.has(laptop.amazonAsin)) errors.push(`duplicate catalog ASIN ${laptop.amazonAsin}`);
    asins.add(laptop.amazonAsin);
    const normalizedUrl = String(laptop.amazonUrl).replace(`/dp/${laptop.amazonAsin}/?`, `/dp/${laptop.amazonAsin}?`);
    const exactUrl = `https://www.amazon.com/dp/${laptop.amazonAsin}?tag=framelimit20-20`;
    if (normalizedUrl !== exactUrl) errors.push(`${laptop.id} direct URL does not match amazonAsin`);

    const target = reviewMap.get(laptop.id);
    if (!target) continue;
    const [page, fragment] = target.split('#');
    const file = `${page}.html`;
    const html = await fs.readFile(path.join(ROOT, file), 'utf8');

    if (!fragment) {
      checked.push([laptop.id, file]);
      if (!html.includes(laptop.amazonAsin)) errors.push(`${file} does not contain mapped ${laptop.id} ASIN ${laptop.amazonAsin}`);
      continue;
    }

    const headingPattern = new RegExp(`<h2\\s+id=["']${fragment}["'][^>]*>`, 'i');
    const heading = headingPattern.exec(html);
    checkedAnchors.push([laptop.id, `${file}#${fragment}`]);
    if (!heading) {
      errors.push(`${file} does not contain mapped anchor #${fragment} for ${laptop.id}`);
      continue;
    }
    const sectionStart = heading.index;
    const nextHeadingOffset = html.slice(sectionStart + heading[0].length).search(/<h2\\s+id=["']/i);
    const sectionEnd = nextHeadingOffset === -1
      ? html.length
      : sectionStart + heading[0].length + nextHeadingOffset;
    const section = html.slice(sectionStart, sectionEnd);
    if (!section.includes(laptop.amazonAsin)) {
      errors.push(`${file}#${fragment} does not contain mapped ${laptop.id} ASIN ${laptop.amazonAsin}`);
    }
  }

  for (const error of errors) console.error(`ERROR ${error}`);
  console.log(`Audited ${catalog.length} unique catalog offers, ${checked.length} direct review mappings and ${checkedAnchors.length} anchored review-note mappings: ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
