import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://framelimit.com/';

function publicUrl(file) {
  return file === 'index.html' ? ORIGIN : ORIGIN + file.replace(/\.html$/i, '');
}

function localFile(target) {
  const clean = target.split(/[?#]/, 1)[0].replace(/^\//, '');
  if (!clean) return 'index.html';
  return path.extname(clean) ? clean : `${clean}.html`;
}

const files = (await fs.readdir(ROOT)).filter((file) => file.endsWith('.html')).sort();
const errors = [];

for (const file of files) {
  const source = await fs.readFile(path.join(ROOT, file), 'utf8');
  const noindex = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(source);
  const canonical = source.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  if (!canonical) errors.push(`${file}: missing canonical`);
  if (!noindex && canonical !== publicUrl(file)) errors.push(`${file}: canonical must be ${publicUrl(file)}`);
  if (canonical && /\.html(?:$|[?#])/.test(canonical)) errors.push(`${file}: canonical must be extensionless`);

  if (/https:\/\/framelimit\.com\/[a-z0-9-]+\.html(?:[?#"'<]|$)/i.test(source)) {
    errors.push(`${file}: contains an absolute .html public URL`);
  }

  for (const match of source.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) {
    const target = match[1];
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target) || target.includes('${')) continue;
    if (/\.html(?:$|[?#])/.test(target)) errors.push(`${file}: internal link must be extensionless: ${target}`);
    try { await fs.access(path.join(ROOT, localFile(target))); } catch { errors.push(`${file}: broken internal link: ${target}`); }
  }
}

for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Audited public URLs across ${files.length} HTML files: ${errors.length} errors.`);
if (errors.length) process.exitCode = 1;
