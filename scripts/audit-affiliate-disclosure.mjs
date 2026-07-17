import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootFiles = await fs.readdir(ROOT);
const htmlFiles = rootFiles.filter((file) => file.endsWith('.html'));
const [nav, disclosure] = await Promise.all([
  fs.readFile(path.join(ROOT, 'nav.js'), 'utf8'),
  fs.readFile(path.join(ROOT, 'affiliate-disclosure.html'), 'utf8')
]);
const errors = [];
const affiliatePages = [];

if (!/class=["']aff-ribbon["']/.test(nav) || !/contains affiliate links/i.test(nav) || !/href=["']affiliate-disclosure["']/.test(nav)) {
  errors.push('nav.js is missing the visible site-wide affiliate disclosure ribbon');
}
if (!/<link\s+rel=["']canonical["']\s+href=["']https:\/\/framelimit\.com\/affiliate-disclosure["']/i.test(disclosure)) {
  errors.push('affiliate-disclosure.html has an invalid canonical');
}
if (!/Amazon Services LLC Associates Program/i.test(disclosure) || !/earn advertising fees/i.test(disclosure)) {
  errors.push('affiliate-disclosure.html is missing the Amazon Associates disclosure statement');
}

for (const file of htmlFiles) {
  const source = await fs.readFile(path.join(ROOT, file), 'utf8');
  const firstAffiliate = source.search(/href=["'][^"']*amazon\.com[^"']*["']/i);
  if (firstAffiliate < 0) continue;
  affiliatePages.push(file);

  const navRoot = source.search(/id=["']nav-root["']/i);
  const navScript = source.search(/<script\s+src=["']nav\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/i);
  const inlineDisclosure = source.search(/affiliate disclosure|qualifying purchases|may earn (?:an? )?affiliate commission/i);
  const usesSharedRibbon = navRoot >= 0 && navRoot < firstAffiliate && navScript >= 0;
  const hasNearbyInlineDisclosure = inlineDisclosure >= 0 && inlineDisclosure < firstAffiliate;

  if (!usesSharedRibbon && !hasNearbyInlineDisclosure) {
    errors.push(`${file}: first Amazon link is not preceded by the shared ribbon or an inline affiliate disclosure`);
  }
}

for (const error of errors) console.error(`ERROR affiliate disclosure: ${error}`);
console.log(`Audited affiliate disclosure coverage: ${affiliatePages.length} HTML pages with Amazon links, ${errors.length} errors.`);
if (errors.length) process.exitCode = 1;
