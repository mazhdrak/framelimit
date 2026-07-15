import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMPARISONS = [
  {
    page: 'guide-legion-pro-7i-vs-rog-strix-g16-rtx-5080.html',
    ids: ['lenovo-legion-pro-7i-gen10', 'asus-rog-strix-g16-2026'],
    required: ['No Defensible Universal Winner', 'not a live checkout price'],
    backlinks: ['guides.html', 'compare.html', 'guide-best-rtx-5080-gaming-laptop-2026.html', 'review-lenovo-legion-pro-7i-gen10.html', 'review-asus-rog-strix-g16-2026.html']
  },
  {
    page: 'guide-rog-flow-z13-vs-zephyrus-g14-2025.html',
    ids: ['asus-rog-flow-z13-radeon-8060s', 'asus-rog-zephyrus-g14-2026'],
    requireDisplayDetails: true,
    required: ['No Defensible Universal Winner', 'not a live checkout price', 'GU405AR', 'configuration error'],
    backlinks: ['guides.html', 'compare.html', 'guide-best-amd-gaming-laptop-2026.html', 'guide-best-14-inch-gaming-laptop-2026.html', 'review-asus-rog-flow-z13-radeon-8060s.html', 'review-asus-rog-zephyrus-g14-2026.html']
  }
];

async function loadLaptops() {
  const source = await fs.readFile(path.join(ROOT, 'laptops.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'laptops.js' });
  return sandbox.window.LAPTOPS || [];
}

function requireAny(errors, source, values, label) {
  if (!values.some((value) => source.includes(String(value)))) errors.push(`missing ${label}: ${values[0]}`);
}

async function auditComparison(definition, laptops, sitemap) {
  const slug = definition.page.replace(/\.html$/, '');
  const page = await fs.readFile(path.join(ROOT, definition.page), 'utf8');
  const items = definition.ids.map((id) => laptops.find((laptop) => laptop.id === id));
  const errors = [];

  items.forEach((item, index) => {
    if (!item) {
      errors.push(`central catalog is missing ${definition.ids[index]}`);
      return;
    }
    const resolution = item.display.res;
    const exactValues = [
      [[item.modelCode], `${item.id} model code`],
      [[item.gpu], `${item.id} GPU`],
      [[item.gpuVram], `${item.id} VRAM`],
      [[item.cpu, item.cpu.replace(/^Intel /, '')], `${item.id} CPU`],
      [[item.ram], `${item.id} memory`],
      [[item.storage], `${item.id} storage`],
      [[resolution, resolution.replace('×', '&times;')], `${item.id} display resolution`],
      [[`${item.display.hz}Hz`], `${item.id} refresh rate`],
      [[`${item.battery}Wh`], `${item.id} battery`],
      [[`${item.weight}kg`, String(item.weight)], `${item.id} weight`],
      [[item.amazonAsin], `${item.id} ASIN`]
    ];
    if (item.tgp != null) exactValues.push([[`${item.tgp}W`], `${item.id} TGP`]);
    if (definition.requireDisplayDetails && Number.isFinite(item.display.nits)) exactValues.push([[`${item.display.nits} nits`], `${item.id} published brightness`]);
    if (definition.requireDisplayDetails && item.display.hdr) exactValues.push([[item.display.hdr], `${item.id} HDR label`]);
    exactValues.forEach(([values, label]) => requireAny(errors, page, values, label));
    requireAny(errors, page, [`amazon.com/dp/${item.amazonAsin}?tag=framelimit20-20`], `${item.id} direct affiliate URL`);
  });

  requireAny(errors, page, ['"@type":"Article"', '"@type": "Article"'], 'Article JSON-LD');
  requireAny(errors, page, ['"@type":"FAQPage"', '"@type": "FAQPage"'], 'FAQPage JSON-LD');
  requireAny(errors, page, [`rel="canonical" href="https://framelimit.com/${slug}"`], 'canonical URL');
  definition.required.forEach((value) => requireAny(errors, page, [value], `evidence disclosure`));
  requireAny(errors, sitemap, [`https://framelimit.com/${slug}`], 'sitemap URL');

  for (const file of definition.backlinks) {
    const source = await fs.readFile(path.join(ROOT, file), 'utf8');
    if (!source.includes(`href="${slug}`)) errors.push(`${file} does not link to ${slug}`);
  }

  errors.forEach((message) => console.log(`ERROR ${definition.page}: ${message}`));
  console.log(`Audited ${slug}: ${items.filter(Boolean).length} exact configurations, ${definition.backlinks.length} backlinks, ${errors.length} errors.`);
  return errors.length;
}

async function main() {
  const [laptops, sitemap] = await Promise.all([loadLaptops(), fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8')]);
  let totalErrors = 0;
  for (const definition of COMPARISONS) totalErrors += await auditComparison(definition, laptops, sitemap);
  console.log(`Audited ${COMPARISONS.length} model comparison pages: ${totalErrors} total errors.`);
  if (totalErrors) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
