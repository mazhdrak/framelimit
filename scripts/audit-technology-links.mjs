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

  const reviewFiles = (await fs.readdir(ROOT)).filter((file) => /^review-.*\.html$/i.test(file));
  const indexableReviews = [];
  for (const review of reviewFiles) {
    const source = await fs.readFile(path.join(ROOT, review), 'utf8');
    if (review === 'review-notes-2026.html' || /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(source)) continue;

    indexableReviews.push(review);
    const title = source.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '';
    const description = source.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)/i)?.[1] ?? '';
    const identity = `${title} ${description}`;
    const isNvidia = /\b(?:RTX|GeForce)\s*(?:50|40|30)\d{2}/i.test(identity);
    const isRadeon = /\b(?:Radeon|RX)\s*(?:\d{4}[A-Z]*|8060S)/i.test(identity);

    if (!source.includes('href="guide-dlss-fsr-frame-generation-database')) {
      errors.push(`${review} does not link to the DLSS/FSR/Frame Generation database`);
    }
    if (isNvidia && !source.includes('href="guide-rtx-50-laptop-tgp-database')) {
      errors.push(`${review} does not link to the RTX 50 Laptop TGP Database`);
    }
    if (isRadeon && !source.includes('href="guide-rtx-vs-amd-2026')) {
      errors.push(`${review} does not link to the RTX versus AMD guide`);
    }
    if (!isNvidia && !isRadeon) errors.push(`${review} title does not identify its primary GPU family`);
  }

  for (const error of errors) console.error(`ERROR ${error}`);
  console.log(`Audited ${indexableReviews.length} indexable product reviews and ${RELATIONS.length} bidirectional review-to-technology-guide relations: ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
