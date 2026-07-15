import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RELATIONS = [
  ['review-razer-blade-14-2026.html', 'guide-rtx-50-laptop-tgp-database.html'],
  ['review-razer-blade-14-2026.html', 'guide-gaming-laptop-display-database.html'],
  ['review-razer-blade-14-2026.html', 'guide-dlss-fsr-frame-generation-database.html'],
  ['review-asus-rog-zephyrus-g14-2026.html', 'guide-rtx-50-laptop-tgp-database.html'],
  ['review-asus-rog-zephyrus-g14-2026.html', 'guide-gaming-laptop-display-database.html'],
  ['review-lenovo-legion-5i-gen10.html', 'guide-rtx-50-laptop-tgp-database.html'],
  ['review-lenovo-legion-5i-gen10.html', 'guide-gaming-laptop-display-database.html'],
  ['review-lenovo-legion-5i-gen10.html', 'guide-dlss-fsr-frame-generation-database.html'],
  ['review-asus-tuf-gaming-f16-rtx5070.html', 'guide-rtx-50-laptop-tgp-database.html'],
  ['review-asus-tuf-gaming-f16-rtx5070.html', 'guide-gaming-laptop-display-database.html'],
];

const slug = (file) => file.replace(/\.html$/, '');

async function main() {
  const files = new Set(RELATIONS.flat());
  const sources = new Map();
  const errors = [];
  for (const file of files) sources.set(file, await fs.readFile(path.join(ROOT, file), 'utf8'));
  for (const [review, guide] of RELATIONS) {
    if (!sources.get(review).includes(`href="${slug(guide)}`)) errors.push(`${review} does not link to ${guide}`);
    if (!sources.get(guide).includes(`href="${slug(review)}`)) errors.push(`${guide} does not link to ${review}`);
  }
  for (const error of errors) console.error(`ERROR ${error}`);
  console.log(`Audited ${RELATIONS.length} bidirectional review-to-technology-guide relations across ${files.size} files: ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
