import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = [
  {
    file: 'guide-rtx-50-laptop-tgp-database.html',
    required: ['<table', 'Exact Configurations', 'Published power', 'id="same-gpu-tgp"', 'tgp-static-compare', 'power-envelope comparison'],
  },
  {
    file: 'guide-dlss-fsr-frame-generation-database.html',
    required: ['<table', '137', 'benchmark-data.js'],
  },
  {
    file: 'guide-gaming-laptop-display-database.html',
    required: ['<table', 'Published brightness', 'response time'],
  },
  {
    file: 'guide-gaming-laptop-price-report-july-2026.html',
    required: ['<table', 'Reference price', 'Monthly change'],
  },
];

async function main() {
  const errors = [];
  const sitemap = await fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const htmlFiles = (await fs.readdir(ROOT)).filter((file) => file.endsWith('.html'));
  const htmlSources = new Map(
    await Promise.all(htmlFiles.map(async (file) => [file, await fs.readFile(path.join(ROOT, file), 'utf8')])),
  );

  for (const asset of assets) {
    const source = htmlSources.get(asset.file);
    const slug = asset.file.replace(/\.html$/, '');
    const canonical = `https://framelimit.com/${slug}`;

    if (!source) {
      errors.push(`${asset.file}: file is missing`);
      continue;
    }
    if (!source.includes(`<link rel="canonical" href="${canonical}">`)) {
      errors.push(`${asset.file}: canonical URL is missing or incorrect`);
    }
    if (!/<meta name="description" content="[^"]{80,}">/i.test(source)) {
      errors.push(`${asset.file}: descriptive meta description is missing`);
    }
    if (!/<h1\b/i.test(source)) errors.push(`${asset.file}: H1 is missing`);
    for (const marker of asset.required) {
      if (!source.toLowerCase().includes(marker.toLowerCase())) {
        errors.push(`${asset.file}: required evidence marker "${marker}" is missing`);
      }
    }
    if (!sitemap.includes(`<loc>${canonical}</loc>`)) {
      errors.push(`${asset.file}: sitemap entry is missing`);
    }

    const inboundFiles = htmlFiles.filter(
      (file) => file !== asset.file && htmlSources.get(file).includes(`href="${slug}`),
    );
    if (inboundFiles.length < 2) {
      errors.push(`${asset.file}: needs at least two crawlable inbound HTML links; found ${inboundFiles.length}`);
    }
  }

  for (const error of errors) console.error(`ERROR ${error}`);
  console.log(`Audited ${assets.length} original linkable assets: ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
