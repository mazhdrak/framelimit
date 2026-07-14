import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const guide = 'guide-best-gaming-laptop-under-1500.html';
const reviews = [
  'review-lenovo-loq-15-gen10.html',
  'review-acer-nitro-v-16-2026.html',
  'review-asus-tuf-gaming-a16-2026.html',
  'review-gigabyte-gaming-a16.html',
];

function textContent(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function linksFrom(source) {
  return Array.from(source.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi), (match) => ({
    target: match[1].split(/[?#]/, 1)[0],
    label: textContent(match[2]),
  }));
}

async function read(file) {
  return fs.readFile(path.join(ROOT, file), 'utf8');
}

async function main() {
  const errors = [];
  const sources = new Map();
  for (const file of [guide, ...reviews]) sources.set(file, await read(file));

  const guideLinks = linksFrom(sources.get(guide));
  for (const review of reviews) {
    const links = guideLinks.filter((link) => link.target === review);
    if (!links.length) errors.push(`${guide} must link to ${review}`);
    if (links.some((link) => /^(?:full review|read more)\s*(?:→|&rarr;)?$/i.test(link.label))) {
      errors.push(`${guide} uses a generic anchor for ${review}`);
    }
  }

  for (const review of reviews) {
    const links = linksFrom(sources.get(review));
    if (!links.some((link) => link.target === guide)) {
      errors.push(`${review} must link back to ${guide}`);
    }
    if (!links.some((link) => reviews.includes(link.target) && link.target !== review)) {
      errors.push(`${review} must link to at least one related RTX 5060 review`);
    }
  }

  for (const error of errors) console.error(`ERROR ${error}`);
  console.log(`Audited RTX 5060 cluster: ${reviews.length} reviews, ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
