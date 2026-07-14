import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PARTNER_TAG = 'framelimit20-20';
const expectedOrigin = 'https://framelimit.com/';

async function loadLaptops() {
  const source = await fs.readFile(path.join(ROOT, 'laptops.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'laptops.js' });
  return sandbox.window.LAPTOPS || [];
}

function matches(source, pattern) {
  return Array.from(source.matchAll(pattern));
}

function textContent(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function add(results, file, severity, message) {
  results.push({ file, severity, message });
}

async function auditGuide(file, laptopIds, results) {
  const source = await fs.readFile(path.join(ROOT, file), 'utf8');
  const canonical = source.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  const expectedCanonical = expectedOrigin + file;
  if (canonical !== expectedCanonical) add(results, file, 'error', `canonical must be ${expectedCanonical}`);
  if (!/<title>[^<]{20,}<\/title>/i.test(source)) add(results, file, 'error', 'missing or unusually short title');
  if (!/<meta\s+name=["']description["']\s+content=["'][^"']{70,}["']/i.test(source)) {
    add(results, file, 'error', 'missing or unusually short meta description');
  }

  for (const match of matches(source, /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { add(results, file, 'error', `invalid JSON-LD: ${error.message}`); }
  }
  if (!/<script\s+type=["']application\/ld\+json["']/i.test(source)) add(results, file, 'error', 'missing JSON-LD');

  for (const match of matches(source, /href=["']([^"'#?]+\.html)(?:[?#][^"']*)?["']/gi)) {
    const target = match[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    try { await fs.access(path.join(ROOT, target)); } catch { add(results, file, 'error', `broken internal link: ${target}`); }
  }

  for (const match of matches(source, /<a\b[^>]*class=["'][^"']*benchmark-evidence[^"']*["'][^>]*href=["']([^"'#]+\.html)#([^"']+)["'][^>]*>/gi)) {
    const [, target, fragment] = match;
    try {
      const targetSource = await fs.readFile(path.join(ROOT, target), 'utf8');
      const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`\\bid=["']${escaped}["']`, 'i').test(targetSource)) {
        add(results, file, 'error', `benchmark evidence target is missing #${fragment}: ${target}`);
      }
    } catch {
      add(results, file, 'error', `benchmark evidence target is missing: ${target}`);
    }
  }

  for (const match of matches(source, /<a\b([^>]*href=["'][^"']*amazon\.com[^"']*["'][^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attributes = match[1];
    const label = textContent(match[2]).toLowerCase();
    const url = attributes.match(/href=["']([^"']+)["']/i)?.[1] || '';
    const rel = attributes.match(/rel=["']([^"']+)["']/i)?.[1] || '';
    if (!url.includes(`tag=${PARTNER_TAG}`)) add(results, file, 'error', `Amazon link is missing tag=${PARTNER_TAG}`);
    if (!/\bnofollow\b/i.test(rel) || !/\bsponsored\b/i.test(rel)) add(results, file, 'error', 'Amazon link must use rel="nofollow sponsored"');
    if (/amazon\.com\/s\?/i.test(url) && !label.includes('search amazon')) {
      add(results, file, 'error', 'Amazon search fallback is labeled like a direct offer');
    }
    if (/amazon\.com\/dp\//i.test(url) && label.includes('search amazon')) {
      add(results, file, 'error', 'direct ASIN link is labeled as a search fallback');
    }
  }

  for (const match of matches(source, /data-fl-(?:laptop|price-id)=["']([^"']+)["']/gi)) {
    if (!laptopIds.has(match[1]) && match[1] !== 'lenovo-legion-7i-gen10') {
      add(results, file, 'error', `unknown central laptop id: ${match[1]}`);
    }
  }

  if (/data-price-guide/i.test(source)) {
    for (const requiredScript of ['price-snapshot.js', 'laptops.js', 'price-data.js']) {
      if (!source.includes(requiredScript)) add(results, file, 'error', `price guide is missing ${requiredScript}`);
    }
  }

  if (/\b(?:fully tested|we tested|our tests|our testing)\b/i.test(textContent(source))) {
    add(results, file, 'warning', 'contains a first-party testing claim that needs editorial evidence');
  }
  for (const table of matches(source, /<table\b[\s\S]*?<\/table>/gi)) {
    const tableText = textContent(table[0]);
    if (/\b(?:Avg(?:erage)?\s+(?:\d{3,4}p\s+)?FPS|Game FPS|FPS Drop|Minecraft FPS|Fortnite FPS)\b/i.test(tableText) || /\b\d+\s*fps\b/i.test(tableText)) {
      add(results, file, 'warning', 'contains a table with summary FPS that must identify exact settings and evidence');
    }
  }
}

async function main() {
  const entries = await fs.readdir(ROOT);
  const guides = entries.filter((file) => /^guide-.*\.html$/i.test(file)).sort();
  const laptops = await loadLaptops();
  const laptopIds = new Set(laptops.map((laptop) => laptop.id));
  const results = [];
  for (const guide of guides) await auditGuide(guide, laptopIds, results);

  results.forEach(({ file, severity, message }) => console.log(`${severity.toUpperCase()} ${file}: ${message}`));
  const errors = results.filter((result) => result.severity === 'error').length;
  const warnings = results.filter((result) => result.severity === 'warning').length;
  console.log(`Audited ${guides.length} guides: ${errors} errors, ${warnings} warnings.`);
  if (errors) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
