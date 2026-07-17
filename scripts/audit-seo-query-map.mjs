import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://framelimit.com/';

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function textContent(value) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

const [mapSource, sitemap, rootFiles] = await Promise.all([
  fs.readFile(path.join(ROOT, 'seo-query-map.json'), 'utf8'),
  fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8'),
  fs.readdir(ROOT)
]);
const entries = JSON.parse(mapSource);
const htmlFiles = rootFiles.filter((file) => file.endsWith('.html'));
const html = new Map(await Promise.all(htmlFiles.map(async (file) => [file, await fs.readFile(path.join(ROOT, file), 'utf8')])));
const errors = [];
const seenQueries = new Set();

for (const entry of entries) {
  const queryKey = normalize(entry.query);
  if (!queryKey) errors.push('query map contains an empty query');
  if (seenQueries.has(queryKey)) errors.push(`duplicate query intent: ${entry.query}`);
  seenQueries.add(queryKey);

  if (!/^[a-z0-9-]+$/.test(entry.target || '')) {
    errors.push(`${entry.query}: invalid extensionless target ${entry.target || '(missing)'}`);
    continue;
  }
  const file = `${entry.target}.html`;
  const source = html.get(file);
  if (!source) {
    errors.push(`${entry.query}: target file is missing: ${file}`);
    continue;
  }
  const expectedCanonical = `${ORIGIN}${entry.target}`;
  const canonical = source.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  if (canonical !== expectedCanonical) errors.push(`${entry.query}: canonical must be ${expectedCanonical}`);
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(source)) errors.push(`${entry.query}: target is noindex`);
  if (!sitemap.includes(`<loc>${expectedCanonical}</loc>`)) errors.push(`${entry.query}: target is missing from sitemap.xml`);
  if (!/<title>[^<]{20,}<\/title>/i.test(source) || !/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(source)) {
    errors.push(`${entry.query}: target needs a descriptive title and H1`);
  }
  const visibleText = normalize(textContent(source));
  for (const term of entry.requiredTerms || []) {
    if (!visibleText.includes(normalize(term))) errors.push(`${entry.query}: target is missing required term: ${term}`);
  }

  const inbound = htmlFiles.filter((candidate) => candidate !== file && new RegExp(`href=["'](?:/)?${entry.target}(?:[?#][^"']*)?["']`, 'i').test(html.get(candidate)));
  if (inbound.length < 2) errors.push(`${entry.query}: target has only ${inbound.length} crawlable inbound link(s)`);
}

for (const error of errors) console.error(`ERROR seo-query-map.json: ${error}`);
console.log(`Audited ${entries.length} long-tail query intents: ${new Set(entries.map((entry) => entry.target)).size} canonical targets, ${errors.length} errors.`);
if (errors.length) process.exitCode = 1;
