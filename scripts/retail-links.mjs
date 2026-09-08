import fs from 'node:fs/promises';
import vm from 'node:vm';

export function amazonProduct(url) {
  try {
    const parsed = new URL(url);
    const match = /^\/dp\/([A-Z0-9]{10})\/?$/i.exec(parsed.pathname);
    return parsed.protocol === 'https:' && parsed.hostname === 'www.amazon.com' && match
      ? { asin: match[1].toUpperCase(), tag: parsed.searchParams.get('tag') } : null;
  } catch { return null; }
}

export async function officialRetailUrls() {
  const sandbox = { window: {} };
  vm.runInNewContext(await fs.readFile(new URL('../laptops.js', import.meta.url), 'utf8'), sandbox);
  return new Set(sandbox.window.LAPTOPS.filter(item => item.retailerName && !amazonProduct(item.amazonUrl))
    .map(item => item.amazonUrl));
}
