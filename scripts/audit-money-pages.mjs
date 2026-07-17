import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://framelimit.com/';
const PARTNER_TAG = 'framelimit20-20';

const [manifestSource, sitemap] = await Promise.all([
  fs.readFile(path.join(ROOT, 'money-pages.json'), 'utf8'),
  fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8')
]);
const pages = JSON.parse(manifestSource);
const errors = [];
const seen = new Set();

for (const page of pages) {
  if (seen.has(page.target)) errors.push(`${page.target}: duplicate money-page target`);
  seen.add(page.target);
  if (!/^[a-z0-9-]+$/.test(page.target || '')) {
    errors.push(`${page.target || '(missing)'}: invalid extensionless target`);
    continue;
  }

  const file = `${page.target}.html`;
  let source;
  try { source = await fs.readFile(path.join(ROOT, file), 'utf8'); } catch {
    errors.push(`${file}: missing money page`);
    continue;
  }
  const canonical = `${ORIGIN}${page.target}`;
  if (!source.includes(`<link rel="canonical" href="${canonical}">`)) errors.push(`${file}: invalid canonical`);
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) errors.push(`${file}: missing from sitemap.xml`);
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(source)) errors.push(`${file}: money page is noindex`);
  if (!/<title>[^<]{25,}<\/title>/i.test(source) || !/<meta\s+name=["']description["']\s+content=["'][^"']{70,}["']/i.test(source) || !/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(source)) {
    errors.push(`${file}: incomplete title, description or H1`);
  }

  const amazonLinks = Array.from(source.matchAll(/<a\b([^>]*href=["']https:\/\/www\.amazon\.com\/dp\/([A-Z0-9]{10})[^"']*["'][^>]*)>/gi));
  if (amazonLinks.length < page.minDirectOffers) errors.push(`${file}: expected at least ${page.minDirectOffers} direct Amazon offers, found ${amazonLinks.length}`);
  for (const [, attributes, asin] of amazonLinks) {
    const href = attributes.match(/href=["']([^"']+)["']/i)?.[1] || '';
    const rel = attributes.match(/rel=["']([^"']+)["']/i)?.[1] || '';
    if (!href.includes(`tag=${PARTNER_TAG}`)) errors.push(`${file}: ${asin} is missing tag=${PARTNER_TAG}`);
    if (!/\bsponsored\b/i.test(rel) || !/\bnofollow\b/i.test(rel)) errors.push(`${file}: ${asin} is missing sponsored/nofollow rel`);
  }

  const reviewLinks = new Set(Array.from(source.matchAll(/href=["'](review-[a-z0-9-]+)(?:#[^"']*)?["']/gi), (match) => match[1]));
  if (reviewLinks.size < page.minReviewLinks) errors.push(`${file}: expected at least ${page.minReviewLinks} review links, found ${reviewLinks.size}`);
  if (!/live (?:checkout )?price|not (?:a )?live (?:checkout )?price|verify (?:the )?(?:current |live )?(?:checkout )?price|price[^.]{0,80}(?:can change|at checkout)/i.test(source)) {
    errors.push(`${file}: missing visible live-price/checkout disclaimer`);
  }
  const navRoot = source.search(/id=["']nav-root["']/i);
  const firstAmazon = source.search(/href=["']https:\/\/www\.amazon\.com\/dp\//i);
  if (navRoot < 0 || navRoot > firstAmazon || !/<script\s+src=["']nav\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/i.test(source)) {
    errors.push(`${file}: shared affiliate ribbon is not guaranteed before the first offer`);
  }
}

for (const error of errors) console.error(`ERROR money-pages.json: ${error}`);
console.log(`Audited ${pages.length} priority money pages: ${errors.length} errors.`);
if (errors.length) process.exitCode = 1;
