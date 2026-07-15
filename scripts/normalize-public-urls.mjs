import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entries = await fs.readdir(ROOT, { withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile() && /\.(?:html|js)$/.test(entry.name))
  .map((entry) => entry.name)
  .concat(['sitemap.xml']);

function normalize(source) {
  return source
    .replace(/https:\/\/framelimit\.com\/index\.html(?=([?#][^\s"'<]*)?[\s"'<])/g, 'https://framelimit.com/')
    .replace(/https:\/\/framelimit\.com\/([a-z0-9-]+)\.html(?=([?#][^\s"'<]*)?[\s"'<])/gi, 'https://framelimit.com/$1')
    .replace(/(["'])index\.html((?:[?#][^"']*)?)\1/g, '$1/$2$1')
    .replace(/(["'])(\/?[a-z0-9-]+)\.html((?:[?#][^"']*)?)\1/gi, '$1$2$3$1')
    .replace(/url=index\.html(?=([?#;"']|$))/gi, 'url=/')
    .replace(/url=([a-z0-9-]+)\.html(?=([?#;"']|$))/gi, 'url=$1');
}

let changed = 0;
for (const file of files) {
  const target = path.join(ROOT, file);
  const source = await fs.readFile(target, 'utf8');
  const output = normalize(source);
  if (output !== source) {
    await fs.writeFile(target, output);
    changed += 1;
  }
}

console.log(`Normalized public URLs in ${changed} files.`);
