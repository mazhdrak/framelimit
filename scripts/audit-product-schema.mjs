import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIX = process.argv.includes('--fix');
const JSON_LD = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
const ELIGIBILITY_FIELDS = ['offers', 'review', 'aggregateRating'];

function isType(node, type) {
  const value = node?.['@type'];
  return value === type || (Array.isArray(value) && value.includes(type));
}

function hasProductEligibilityField(product) {
  return ELIGIBILITY_FIELDS.some((field) => product?.[field]);
}

function transformReview(review) {
  const product = review.itemReviewed;
  const nestedReview = {
    '@type': 'Review',
    ...(review.headline ? { headline: review.headline } : {}),
    ...(review.reviewRating ? { reviewRating: review.reviewRating } : {}),
    ...(review.author ? { author: review.author } : {}),
    ...(review.publisher ? { publisher: review.publisher } : {}),
    ...(review.datePublished ? { datePublished: review.datePublished } : {}),
    dateModified: new Date().toISOString().slice(0, 10),
  };

  return {
    '@context': review['@context'] || 'https://schema.org',
    '@type': 'Product',
    ...Object.fromEntries(Object.entries(product).filter(([key]) => key !== '@type')),
    ...(review.image ? { image: review.image } : {}),
    ...(review.description ? { description: review.description } : {}),
    ...(review.url ? { url: review.url } : {}),
    ...(review.mainEntityOfPage ? { mainEntityOfPage: review.mainEntityOfPage } : {}),
    review: nestedReview,
  };
}

function collectProducts(node, products = []) {
  if (!node || typeof node !== 'object') return products;
  if (isType(node, 'Product')) products.push(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((item) => collectProducts(item, products));
    else if (value && typeof value === 'object') collectProducts(value, products);
  }
  return products;
}

const files = (await fs.readdir(ROOT)).filter((file) => file.endsWith('.html')).sort();
const errors = [];
let fixed = 0;

for (const file of files) {
  const filePath = path.join(ROOT, file);
  const source = await fs.readFile(filePath, 'utf8');
  let changed = false;

  const output = source.replace(JSON_LD, (block, payload) => {
    let data;
    try {
      data = JSON.parse(payload);
    } catch {
      return block;
    }

    if (
      FIX
      && isType(data, 'Review')
      && isType(data.itemReviewed, 'Product')
      && !hasProductEligibilityField(data.itemReviewed)
    ) {
      data = transformReview(data);
      changed = true;
      fixed += 1;
    }

    for (const product of collectProducts(data)) {
      if (!hasProductEligibilityField(product)) {
        errors.push(`${file}: Product "${product.name || 'unnamed'}" needs offers, review, or aggregateRating`);
      }
    }

    return changed ? `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>` : block;
  });

  if (changed) await fs.writeFile(filePath, output, 'utf8');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Audited ${files.length} HTML files: 0 invalid Product nodes.${FIX ? ` Rewrote ${fixed} review schemas.` : ''}`);
}
