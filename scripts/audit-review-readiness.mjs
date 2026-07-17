import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://framelimit.com';
const errors = [];
const reviewFlags = [];

function add(file, message) {
  errors.push(`${file}: ${message}`);
}

function flag(file, message) {
  reviewFlags.push(`${file}: ${message}`);
}

function parseJsonLd(file, source) {
  const blocks = Array.from(source.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
  const nodes = [];
  for (const block of blocks) {
    try {
      const value = JSON.parse(block[1]);
      nodes.push(...(Array.isArray(value) ? value : [value]));
    } catch (error) {
      add(file, `invalid JSON-LD (${error.message})`);
    }
  }
  if (!nodes.length) add(file, 'missing valid JSON-LD');
  return nodes;
}

function sitemapEntries(source) {
  const entries = new Map();
  for (const match of source.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/gi)) {
    entries.set(match[1], match[2]);
  }
  return entries;
}

const rootFiles = await fs.readdir(ROOT);
const sitemap = await fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8');
const sitemapMap = sitemapEntries(sitemap);
const reviewFiles = [];

for (const file of rootFiles.filter((name) => /^review-.*\.html$/i.test(name))) {
  const source = await fs.readFile(path.join(ROOT, file), 'utf8');
  if (file === 'review-notes-2026.html' || /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(source)) continue;
  reviewFiles.push({ file, source });
}

for (const { file, source } of reviewFiles) {
  const slug = file.replace(/\.html$/i, '');
  const publicUrl = `${ORIGIN}/${slug}`;
  const title = source.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim() || '';
  const description = source.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1].trim() || '';
  const canonical = source.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];

  if (!/review/i.test(title)) add(file, 'title must identify the page as a review');
  if (description.length < 70) add(file, 'meta description is missing or too short');
  if (canonical !== publicUrl) add(file, `canonical must be ${publicUrl}`);

  const jsonLd = parseJsonLd(file, source);
  const datedNode = jsonLd.find((node) => node?.dateModified || node?.review?.dateModified);
  const dateModified = datedNode?.dateModified || datedNode?.review?.dateModified;
  if (!dateModified || !/^20\d{2}-\d{2}-\d{2}$/.test(dateModified)) add(file, 'JSON-LD needs an ISO dateModified');

  const sitemapLastmod = sitemapMap.get(publicUrl);
  if (!sitemapLastmod) add(file, 'missing from sitemap.xml');
  else if (dateModified && sitemapLastmod !== dateModified) add(file, `sitemap lastmod ${sitemapLastmod} does not match dateModified ${dateModified}`);

  if (!/\b(?:CPU|processor)\b/i.test(source) || !/\b(?:GPU|graphics)\b/i.test(source)) flag(file, 'CPU/GPU configuration is not explicit');
  if (!/\b(?:TGP|graphics power|power ceiling|power limit|\d{2,3}W)\b/i.test(source)) flag(file, 'GPU power or TGP status is not explicit');
  if (!/\b(?:RAM|memory)\b/i.test(source) || !/\bstorage\b/i.test(source) || !/\b(?:battery|Wh)\b/i.test(source) || !/\b(?:weight|kg|lb)\b/i.test(source)) {
    flag(file, 'display/RAM/storage/battery/weight specification set is incomplete');
  }

  const hasBenchmarkTemplate = /class=["'][^"']*hbench|benchmark-data\.js/i.test(source);
  const statesEvidenceBoundary = /specifications?-only|unranked|no matching|benchmark evidence boundary|exact-SKU attribution/i.test(source);
  if (!hasBenchmarkTemplate && !statesEvidenceBoundary) flag(file, 'needs the shared benchmark template or an explicit no-matched-evidence boundary');

  const amazonLinks = Array.from(source.matchAll(/<a\b([^>]*href=["'][^"']*amazon\.com\/dp\/[A-Z0-9]{10}[^"']*["'][^>]*)>/gi), (match) => match[1]);
  if (!amazonLinks.length) add(file, 'needs a direct-ASIN Amazon CTA or a clearly mapped buyable alternative');
  else if (amazonLinks.some((attributes) => !/rel=["'][^"']*sponsored/i.test(attributes))) add(file, 'Amazon CTA must use rel="sponsored"');

  const internalTargets = Array.from(source.matchAll(/<a\b[^>]*href=["']([^"'#?]+)[^"']*["'][^>]*>/gi), (match) => match[1].replace(/\.html$/i, ''));
  if (!internalTargets.some((target) => /^guide-/i.test(target))) add(file, 'needs an internal link to a relevant guide');
  if (!internalTargets.some((target) => /^review-/i.test(target) && target !== slug)) add(file, 'needs an internal link to a related review');
  if (!/<h2\b[^>]*[^>]*>\s*Sources\s*<\/h2>|\bSources?:\s*<\/|id=["']sources["']/i.test(source)) flag(file, 'needs a visible Sources section');
}

for (const error of errors) console.error(`ERROR review readiness: ${error}`);
for (const warning of reviewFlags) console.warn(`REVIEW review readiness: ${warning}`);
console.log(`Audited ${reviewFiles.length} indexable product reviews: ${errors.length} blocking errors, ${reviewFlags.length} editorial review flags.`);
if (errors.length) process.exitCode = 1;
