import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PARTNER_TAG = 'framelimit20-20';
const expectedOrigin = 'https://framelimit.com/';
const retiredGuideAsins = new Map([
  ['B0FMFZHNYP', 'retired TUF A16 RTX 5060 offer'],
]);

function publicUrl(file) {
  return expectedOrigin + file.replace(/\.html$/i, '');
}

function localFile(target) {
  const clean = target.split(/[?#]/, 1)[0].replace(/^\//, '');
  if (!clean) return 'index.html';
  return path.extname(clean) ? clean : `${clean}.html`;
}

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

function auditLaptopData(laptops, results) {
  const ids = new Set();
  const requiredText = ['id', 'name', 'cpu', 'gpu', 'gpuVram', 'ram', 'storage'];
  for (const laptop of laptops) {
    for (const field of requiredText) {
      if (typeof laptop[field] !== 'string' || !laptop[field].trim()) {
        add(results, 'laptops.js', 'error', `${laptop.id || 'unknown record'} is missing ${field}`);
      }
    }
    if (ids.has(laptop.id)) add(results, 'laptops.js', 'error', `duplicate laptop id: ${laptop.id}`);
    ids.add(laptop.id);
    if (laptop.tgp !== null && (!Number.isFinite(laptop.tgp) || laptop.tgp <= 0)) {
      add(results, 'laptops.js', 'error', `${laptop.id} has an invalid TGP`);
    }
    if (!laptop.display || !Number.isFinite(laptop.display.size) || !laptop.display.res || !Number.isFinite(laptop.display.hz) || !laptop.display.panel) {
      add(results, 'laptops.js', 'error', `${laptop.id} has an incomplete display specification`);
    }
    if (laptop.weight !== null && (!Number.isFinite(laptop.weight) || laptop.weight <= 0)) {
      add(results, 'laptops.js', 'error', `${laptop.id} has an invalid weight`);
    }
    if (laptop.battery !== null && (!Number.isFinite(laptop.battery) || laptop.battery <= 0)) {
      add(results, 'laptops.js', 'error', `${laptop.id} has an invalid battery capacity`);
    }
    if (!laptop.modelCode || !/^https:\/\//.test(laptop.specSource || '') || !/^\d{4}-\d{2}-\d{2}$/.test(laptop.specCheckedAt || '')) {
      add(results, 'laptops.js', 'error', `${laptop.id} has incomplete spec-source metadata`);
    }
  }
}

async function auditGuide(file, laptopIds, allowedRetailAsins, results) {
  const source = await fs.readFile(path.join(ROOT, file), 'utf8');
  const canonical = source.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  const expectedCanonical = publicUrl(file);
  if (canonical !== expectedCanonical) add(results, file, 'error', `canonical must be ${expectedCanonical}`);
  if (!/<title>[^<]{20,}<\/title>/i.test(source)) add(results, file, 'error', 'missing or unusually short title');
  if (!/<meta\s+name=["']description["']\s+content=["'][^"']{70,}["']/i.test(source)) {
    add(results, file, 'error', 'missing or unusually short meta description');
  }

  for (const match of matches(source, /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { add(results, file, 'error', `invalid JSON-LD: ${error.message}`); }
  }
  if (!/<script\s+type=["']application\/ld\+json["']/i.test(source)) add(results, file, 'error', 'missing JSON-LD');

  for (const match of matches(source, /href=["']([^"'#?]+)(?:[?#][^"']*)?["']/gi)) {
    const target = match[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    try { await fs.access(path.join(ROOT, localFile(target))); } catch { add(results, file, 'error', `broken internal link: ${target}`); }
  }

  for (const match of matches(source, /<a\b[^>]*class=["'][^"']*benchmark-evidence[^"']*["'][^>]*href=["']([^"'#]+)#([^"']+)["'][^>]*>/gi)) {
    const [, target, fragment] = match;
    try {
      const targetSource = await fs.readFile(path.join(ROOT, localFile(target)), 'utf8');
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
    const directAsin = url.match(/amazon\.com\/dp\/([A-Z0-9]{10})/i)?.[1]?.toUpperCase();
    if (directAsin && !allowedRetailAsins.has(directAsin)) {
      add(results, file, 'error', `direct ASIN is not in laptops.js or price-data.js: ${directAsin}`);
    }
    for (const [asin, reason] of retiredGuideAsins) {
      if (url.includes(`/dp/${asin}`)) add(results, file, 'error', `uses ${reason}: ${asin}`);
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
  const allowedRetailAsins = new Set(laptops.map((laptop) => laptop.amazonAsin));
  const priceDataSource = await fs.readFile(path.join(ROOT, 'price-data.js'), 'utf8');
  for (const match of priceDataSource.matchAll(/amazon\.com\/dp\/([A-Z0-9]{10})/gi)) {
    allowedRetailAsins.add(match[1].toUpperCase());
  }
  const results = [];
  auditLaptopData(laptops, results);
  for (const guide of guides) await auditGuide(guide, laptopIds, allowedRetailAsins, results);

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
