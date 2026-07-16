import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clusters = [
  {
    name: 'Best RTX 5060 gaming laptops',
    guide: 'guide-best-rtx-5060-gaming-laptop-2026.html',
    technologyGuides: [
      'guide-rtx-50-laptop-tgp-database.html',
      'guide-dlss-fsr-frame-generation-database.html',
    ],
    reviews: [
      'review-lenovo-loq-15-gen10.html',
      'review-acer-nitro-v-16-2026.html',
      'review-gigabyte-gaming-a16.html',
    ],
  },
  {
    name: 'RTX 5060 under $1,500',
    guide: 'guide-best-gaming-laptop-under-1500.html',
    reviews: [
      'review-lenovo-loq-15-gen10.html',
      'review-acer-nitro-v-16-2026.html',
      'review-gigabyte-gaming-a16.html',
    ],
  },
  {
    name: 'RTX 5070 class under $2,000',
    guide: 'guide-best-gaming-laptop-under-2000.html',
    technologyGuides: [
      'guide-rtx-50-laptop-tgp-database.html',
      'guide-dlss-fsr-frame-generation-database.html',
    ],
    reviews: [
      'review-acer-predator-helios-neo-16.html',
      'review-msi-katana-15-hx.html',
      'review-lenovo-legion-5i-gen10.html',
      'review-asus-tuf-gaming-f16-rtx5070.html',
    ],
  },
  {
    name: 'Gaming laptops under $3,000',
    guide: 'guide-best-gaming-laptop-under-3000.html',
    reviews: [
      'review-lenovo-legion-pro-7i-gen10.html',
      'review-hp-omen-max-16-2026.html',
      'review-msi-vector-16-hx-ai.html',
    ],
  },
  {
    name: 'Premium RTX 5070 class under $2,500',
    guide: 'guide-best-gaming-laptop-under-2500.html',
    technologyGuides: [
      'guide-rtx-50-laptop-tgp-database.html',
      'guide-dlss-fsr-frame-generation-database.html',
    ],
    reviews: [
      'review-asus-rog-zephyrus-g14-2026.html',
      'review-alienware-16x-aurora.html',
      'review-razer-blade-14-2026.html',
      'review-lenovo-legion-7i-gen10.html',
      'review-hp-omen-transcend-14.html',
    ],
  },
  {
    name: 'AMD Radeon gaming laptops',
    guide: 'guide-best-amd-gaming-laptop-2026.html',
    technologyGuides: [
      'guide-rtx-vs-amd-2026.html',
      'guide-dlss-fsr-frame-generation-database.html',
    ],
    reviews: [
      'review-asus-rog-flow-z13-radeon-8060s.html',
      'review-asus-tuf-a16-radeon-rx7700s.html',
    ],
  },
  {
    name: 'Best gaming laptops overall',
    guide: 'guide-best-gaming-laptops-2026.html',
    reviews: [
      'review-lenovo-legion-pro-7i-gen10.html',
      'review-razer-blade-16-2026.html',
      'review-msi-vector-16-hx-ai.html',
      'review-hp-omen-max-16-2026.html',
      'review-lenovo-legion-5i-gen10.html',
      'review-asus-tuf-gaming-a16-2026.html',
    ],
  },
  {
    name: 'RTX 5080 laptops',
    guide: 'guide-best-rtx-5080-gaming-laptop-2026.html',
    technologyGuides: [
      'guide-rtx-50-laptop-tgp-database.html',
      'guide-dlss-fsr-frame-generation-database.html',
    ],
    reviews: [
      'review-lenovo-legion-pro-7i-gen10.html',
      'review-msi-vector-16-hx-ai.html',
      'review-hp-omen-max-16-2026.html',
      'review-asus-rog-zephyrus-g16-2026.html',
      'review-asus-rog-strix-g16-2026.html',
    ],
  },
  {
    name: 'RTX 5090 laptops',
    guide: 'guide-best-rtx-5090-gaming-laptop-2026.html',
    technologyGuides: [
      'guide-rtx-50-laptop-tgp-database.html',
      'guide-dlss-fsr-frame-generation-database.html',
    ],
    reviews: [
      'review-asus-rog-strix-scar-18-2026.html',
      'review-alienware-18-area-51.html',
      'review-razer-blade-16-2026.html',
      'review-msi-raider-18-hx-ai.html',
    ],
  },
  {
    name: '14-inch gaming laptops',
    guide: 'guide-best-14-inch-gaming-laptop-2026.html',
    reviews: [
      'review-asus-rog-zephyrus-g14-2026.html',
      'review-razer-blade-14-2026.html',
    ],
  },
  {
    name: 'Thin-and-light gaming laptops',
    guide: 'guide-best-thin-light-gaming-laptop-2026.html',
    reviews: [
      'review-asus-rog-zephyrus-g14-2026.html',
      'review-razer-blade-14-2026.html',
      'review-lenovo-legion-5-gen10-amd.html',
      'review-asus-rog-zephyrus-g16-2026.html',
    ],
  },
];

function textContent(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function linksFrom(source) {
  return Array.from(source.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi), (match) => ({
    target: localFile(match[1]),
    label: textContent(match[2]),
  }));
}

function localFile(target) {
  const clean = target.split(/[?#]/, 1)[0].replace(/^\//, '');
  if (!clean) return 'index.html';
  return path.extname(clean) ? clean : `${clean}.html`;
}

async function read(file) {
  return fs.readFile(path.join(ROOT, file), 'utf8');
}

async function main() {
  const errors = [];
  const sources = new Map();
  const files = new Set(clusters.flatMap(({ guide, reviews }) => [guide, ...reviews]));
  for (const file of files) sources.set(file, await read(file));

  const allGuideFiles = (await fs.readdir(ROOT)).filter((file) => /^guide-.*\.html$/i.test(file));
  for (const guide of allGuideFiles) {
    const links = linksFrom(await read(guide));
    for (const link of links.filter(({ target }) => /^review-.*\.html$/i.test(target))) {
      if (/^(?:full review|read full review|read more|read review|learn more)\s*(?:â†’|→)?$/i.test(link.label)) {
        errors.push(`${guide} uses generic review anchor "${link.label}" for ${link.target}`);
      }
    }
  }

  for (const { name, guide, reviews, technologyGuides = [] } of clusters) {
    const guideLinks = linksFrom(sources.get(guide));
    for (const review of reviews) {
      const links = guideLinks.filter((link) => link.target === review);
      if (!links.length) errors.push(`${name}: ${guide} must link to ${review}`);
      if (links.some((link) => /^(?:full review|read full review|read more|read review)\s*(?:→|&rarr;)?$/i.test(link.label))) {
        errors.push(`${name}: ${guide} uses a generic anchor for ${review}`);
      }
    }

    for (const review of reviews) {
      const links = linksFrom(sources.get(review));
      if (!links.some((link) => link.target === guide)) {
        errors.push(`${name}: ${review} must link back to ${guide}`);
      }
      if (!links.some((link) => reviews.includes(link.target) && link.target !== review)) {
        errors.push(`${name}: ${review} must link to at least one related cluster review`);
      }
      for (const technologyGuide of technologyGuides) {
        if (!links.some((link) => link.target === technologyGuide)) {
          errors.push(`${name}: ${review} must link to ${technologyGuide}`);
        }
      }
    }
  }

  const allReviewFiles = (await fs.readdir(ROOT)).filter((file) => /^review-.*\.html$/i.test(file));
  for (const review of allReviewFiles) {
    const links = linksFrom(await read(review));
    if (!links.some((link) => /^review-.*\.html$/i.test(link.target) && link.target !== review)) {
      errors.push(`${review} must link to at least one related review`);
    }
  }

  for (const error of errors) console.error(`ERROR ${error}`);
  console.log(`Audited ${clusters.length} internal-link clusters, ${allGuideFiles.length} guides, ${files.size} cluster files, and ${allReviewFiles.length} related-review pages: ${errors.length} errors.`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
