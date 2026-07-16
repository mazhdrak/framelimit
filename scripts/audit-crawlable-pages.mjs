import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://framelimit.com';

function normalizeTarget(rawTarget) {
  const target = rawTarget.trim();
  if (!target || target.startsWith('#') || /^(?:mailto:|tel:|javascript:)/i.test(target)) return null;

  let pathname;
  try {
    const url = new URL(target, `${ORIGIN}/`);
    if (url.origin !== ORIGIN) return null;
    pathname = url.pathname;
  } catch {
    return null;
  }

  const clean = pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/i, '');
  return clean || '/';
}

function sourceSlug(file) {
  return file === 'index.html' ? '/' : file.replace(/\.html$/i, '');
}

async function main() {
  const entries = await fs.readdir(ROOT);
  const htmlFiles = entries.filter((file) => file.endsWith('.html'));
  const sitemap = await fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const sitemapSlugs = Array.from(sitemap.matchAll(/<loc>https:\/\/framelimit\.com\/?([^<]*)<\/loc>/gi), (match) => {
    const clean = match[1].replace(/^\/+|\/+$/g, '').replace(/\.html$/i, '');
    return clean || '/';
  });
  const sitemapSet = new Set(sitemapSlugs);
  const inbound = new Map(sitemapSlugs.map((slug) => [slug, new Set()]));
  const errors = [];

  for (const file of htmlFiles) {
    const source = await fs.readFile(path.join(ROOT, file), 'utf8');
    const from = sourceSlug(file);
    for (const match of source.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
      const target = normalizeTarget(match[1]);
      if (!target || target === from || !sitemapSet.has(target)) continue;
      inbound.get(target).add(from);
    }
  }

  for (const slug of sitemapSlugs) {
    if (slug === '/') continue;
    if (!inbound.get(slug)?.size) errors.push(`${ORIGIN}/${slug} has no crawlable internal HTML backlink`);
  }

  for (const error of errors) console.error(`ERROR ${error}`);
  const linkedPages = sitemapSlugs.filter((slug) => slug === '/' || inbound.get(slug)?.size).length;
  console.log(`Audited ${sitemapSlugs.length} sitemap URLs: ${linkedPages} have crawlable discovery paths, ${errors.length} orphaned.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
