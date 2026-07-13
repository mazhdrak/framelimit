import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://framelimit.com/';

async function main() {
  const source = await fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8');
  if (!/^<\?xml version="1\.0" encoding="UTF-8"\?>/.test(source) || !/<urlset\b[^>]*>[\s\S]*<\/urlset>\s*$/.test(source)) {
    throw new Error('sitemap.xml does not have a complete XML declaration and urlset root.');
  }

  const blocks = Array.from(source.matchAll(/<url>([\s\S]*?)<\/url>/g), (match) => match[1]);
  const urls = new Map();
  const errors = [];
  for (const block of blocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (!loc || !loc.startsWith(ORIGIN)) {
      errors.push(`Invalid or non-canonical loc: ${loc || '(missing)'}`);
      continue;
    }
    if (urls.has(loc)) errors.push(`Duplicate loc: ${loc}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod || '') || Number.isNaN(Date.parse(lastmod))) {
      errors.push(`Invalid lastmod for ${loc}: ${lastmod || '(missing)'}`);
    }
    urls.set(loc, lastmod);
    const relative = loc.slice(ORIGIN.length) || 'index.html';
    try { await fs.access(path.join(ROOT, relative)); } catch { errors.push(`loc has no local file: ${loc}`); }
  }

  const files = await fs.readdir(ROOT);
  for (const file of files.filter((name) => /^(?:guide|review)-.*\.html$/i.test(name))) {
    const html = await fs.readFile(path.join(ROOT, file), 'utf8');
    const noindex = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
    if (!noindex && canonical === ORIGIN + file && !urls.has(canonical)) errors.push(`Indexable page missing from sitemap: ${file}`);
    if (noindex && urls.has(ORIGIN + file)) errors.push(`Noindex page must not be in sitemap: ${file}`);
  }

  errors.forEach((error) => console.error(`ERROR ${error}`));
  console.log(`Audited ${blocks.length} sitemap URLs: ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
