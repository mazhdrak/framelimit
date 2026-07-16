import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT_PATH = path.join(ROOT, 'price-snapshot.js');
const PARTNER_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'framelimit20-20';
const MARKETPLACE = process.env.AMAZON_CREATORS_MARKETPLACE || 'www.amazon.com';
const CURRENCY = process.env.AMAZON_CREATORS_CURRENCY || 'USD';
const VERSION = process.env.AMAZON_CREATORS_CREDENTIAL_VERSION || '';
const CLIENT_ID = process.env.AMAZON_CREATORS_CLIENT_ID || '';
const CLIENT_SECRET = process.env.AMAZON_CREATORS_CLIENT_SECRET || '';
const API_URL = 'https://creatorsapi.amazon/catalog/v1/getItems';

const TOKEN_ENDPOINTS = {
  '2.1': 'https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token',
  '2.2': 'https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token',
  '2.3': 'https://creatorsapi.auth.us-west-2.amazoncognito.com/oauth2/token',
  '3.1': 'https://api.amazon.com/auth/o2/token',
  '3.2': 'https://api.amazon.co.uk/auth/o2/token',
  '3.3': 'https://api.amazon.co.jp/auth/o2/token'
};

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function loadLaptops() {
  const source = await fs.readFile(path.join(ROOT, 'laptops.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'laptops.js' });
  return sandbox.window.LAPTOPS;
}

function directAsin(laptop) {
  const match = String(laptop.amazonUrl || '').match(/amazon\.com\/dp\/([A-Z0-9]{10})/i);
  return laptop.amazonAsin || (match && match[1].toUpperCase()) || null;
}

function auditCatalog(laptops) {
  const errors = [];
  const direct = [];
  const search = [];
  const ownersByAsin = new Map();

  laptops.forEach((laptop) => {
    const url = String(laptop.amazonUrl || '');
    if (!url.includes(`tag=${PARTNER_TAG}`)) {
      errors.push(`${laptop.id}: missing affiliate tag ${PARTNER_TAG}`);
    }
    const asin = directAsin(laptop);
    if (asin) {
      direct.push({ laptop, asin });
      const owners = ownersByAsin.get(asin) || [];
      owners.push(laptop.id);
      ownersByAsin.set(asin, owners);
    }
    else search.push(laptop);
  });

  ownersByAsin.forEach((owners, asin) => {
    if (owners.length > 1) {
      errors.push(`${asin}: duplicate catalog ASIN used by ${owners.join(', ')}`);
    }
  });

  return { errors, direct, search };
}

async function loadManagedAsins(catalogAudit) {
  const managed = new Set(catalogAudit.direct.map(({ asin }) => asin));
  const priceData = await fs.readFile(path.join(ROOT, 'price-data.js'), 'utf8');
  for (const match of priceData.matchAll(/amazon\.com\/dp\/([A-Z0-9]{10})/gi)) {
    managed.add(match[1].toUpperCase());
  }
  return managed;
}

async function auditSiteAmazonLinks(managedAsins) {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name)
    .sort();
  const errors = [];
  let directCount = 0;

  for (const file of files) {
    const source = await fs.readFile(path.join(ROOT, file), 'utf8');
    const anchors = Array.from(source.matchAll(/<a\b([^>]*)>/gi));
    anchors.forEach((match) => {
      const attributes = match[1];
      const href = /\bhref=["']([^"']+)["']/i.exec(attributes);
      if (!href) return;
      const url = href[1].replaceAll('&amp;', '&');
      let parsed;
      try {
        parsed = new URL(url);
      } catch {
        return;
      }
      const isAmazonLink = /(^|\.)amazon\./i.test(parsed.hostname) || parsed.hostname === 'amzn.to';
      if (!isAmazonLink) return;
      if (parsed.hostname !== 'www.amazon.com') {
        errors.push(`${file}: Amazon affiliate links must use https://www.amazon.com: ${url}`);
        return;
      }
      const asinMatch = /^\/dp\/([A-Z0-9]{10})(?:[/?#]|$)/i.exec(parsed.pathname);
      if (!asinMatch) {
        errors.push(`${file}: non-direct Amazon product link: ${url}`);
        return;
      }
      directCount += 1;
      const asin = asinMatch[1].toUpperCase();
      if (!managedAsins.has(asin)) {
        errors.push(`${file}: unmanaged direct ASIN ${asin}`);
      }
      if (parsed.searchParams.get('tag') !== PARTNER_TAG) {
        errors.push(`${file}: Amazon product link is missing affiliate tag ${PARTNER_TAG}: ${url}`);
      }
      const rel = /\brel=["']([^"']+)["']/i.exec(attributes);
      const relTokens = new Set((rel?.[1] || '').toLowerCase().split(/\s+/).filter(Boolean));
      if (!relTokens.has('nofollow') || !relTokens.has('sponsored')) {
        errors.push(`${file}: Amazon product link must use rel="nofollow sponsored": ${url}`);
      }
    });
  }

  return { errors, directCount, fileCount: files.length };
}

async function fetchToken() {
  if (!TOKEN_ENDPOINTS[VERSION]) {
    throw new Error('AMAZON_CREATORS_CREDENTIAL_VERSION must be one of 2.1, 2.2, 2.3, 3.1, 3.2 or 3.3.');
  }
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('AMAZON_CREATORS_CLIENT_ID and AMAZON_CREATORS_CLIENT_SECRET are required.');
  }

  const isV2 = VERSION.startsWith('2.');
  const headers = { 'Content-Type': isV2 ? 'application/x-www-form-urlencoded' : 'application/json' };
  const body = isV2
    ? new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'creatorsapi/default'
      })
    : JSON.stringify({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'creatorsapi::default'
      });

  const response = await fetch(TOKEN_ENDPOINTS[VERSION], { method: 'POST', headers, body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    throw new Error(`Creators API token request failed (${response.status}): ${payload.error_description || payload.error || 'unknown error'}`);
  }
  return payload.access_token;
}

async function fetchItems(token, itemIds) {
  const authorization = VERSION.startsWith('2.')
    ? `Bearer ${token}, Version ${VERSION}`
    : `Bearer ${token}`;
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
      'x-marketplace': MARKETPLACE
    },
    body: JSON.stringify({
      itemIds,
      itemIdType: 'ASIN',
      condition: 'New',
      currencyOfPreference: CURRENCY,
      languagesOfPreference: ['en_US'],
      marketplace: MARKETPLACE,
      partnerTag: PARTNER_TAG,
      resources: [
        'itemInfo.title',
        'offersV2.listings.availability',
        'offersV2.listings.condition',
        'offersV2.listings.isBuyBoxWinner',
        'offersV2.listings.merchantInfo',
        'offersV2.listings.price'
      ]
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Creators API GetItems failed (${response.status}): ${JSON.stringify(payload.errors || payload)}`);
  }
  return payload;
}

function pickListing(item) {
  const listings = item.offersV2 && Array.isArray(item.offersV2.listings)
    ? item.offersV2.listings
    : [];
  return listings.find((listing) => listing.isBuyBoxWinner) || listings[0] || null;
}

function normalizeResponses(responses, asinToLaptopId, checkedAt) {
  const offers = {};
  responses.forEach((payload) => {
    const container = payload.itemResults || payload.itemsResult || {};
    (container.items || []).forEach((item) => {
      const laptopId = asinToLaptopId.get(String(item.asin || '').toUpperCase());
      if (!laptopId) return;
      const listing = pickListing(item);
      const money = listing && listing.price && listing.price.money;
      offers[laptopId] = {
        asin: item.asin,
        price: Number.isFinite(money && money.amount) ? money.amount : null,
        displayPrice: money && money.displayAmount ? money.displayAmount : null,
        currency: money && money.currency ? money.currency : CURRENCY,
        availability: listing && listing.availability ? listing.availability.type : 'UNAVAILABLE',
        merchant: listing && listing.merchantInfo ? listing.merchantInfo.name : null,
        detailPageUrl: item.detailPageURL || null,
        checkedAt,
        source: 'amazon-creators-api'
      };
    });
  });
  return offers;
}

async function writeSnapshot(offers, generatedAt) {
  const snapshot = {
    generatedAt,
    marketplace: MARKETPLACE,
    partnerTag: PARTNER_TAG,
    source: 'amazon-creators-api',
    offers
  };
  const output = `/* Generated by scripts/update-amazon-prices.mjs. Do not add credentials here. */\nwindow.FL_PRICE_SNAPSHOT = ${JSON.stringify(snapshot, null, 2)};\n`;
  await fs.writeFile(SNAPSHOT_PATH, output, 'utf8');
}

function isAssociateNotEligible(error) {
  const message = String(error && error.message ? error.message : error);
  return message.includes('AssociateNotEligible') ||
    message.includes('does not currently meet the eligibility requirements');
}

async function main() {
  const laptops = await loadLaptops();
  const audit = auditCatalog(laptops);
  const managedAsins = await loadManagedAsins(audit);
  const siteAudit = await auditSiteAmazonLinks(managedAsins);
  console.log(`Amazon links: ${audit.direct.length} direct ASIN, ${audit.search.length} search fallback.`);
  console.log(`Site HTML: ${siteAudit.directCount} direct Amazon links across ${siteAudit.fileCount} files; ${managedAsins.size} managed ASINs.`);
  if (audit.errors.length) {
    throw new Error(`Affiliate audit failed:\n- ${audit.errors.join('\n- ')}`);
  }
  if (siteAudit.errors.length) {
    throw new Error(`Site affiliate audit failed:\n- ${siteAudit.errors.join('\n- ')}`);
  }

  if (process.argv.includes('--audit')) return;

  const inputPath = getArgument('--input');
  const asinToLaptopId = new Map(audit.direct.map(({ laptop, asin }) => [asin, laptop.id]));
  const checkedAt = new Date().toISOString();
  let responses;

  if (inputPath) {
    const fixture = JSON.parse(await fs.readFile(path.resolve(inputPath), 'utf8'));
    responses = Array.isArray(fixture) ? fixture : [fixture];
  } else {
    const token = await fetchToken();
    responses = [];
    for (let index = 0; index < audit.direct.length; index += 10) {
      const batch = audit.direct.slice(index, index + 10).map(({ asin }) => asin);
      responses.push(await fetchItems(token, batch));
    }
  }

  const offers = normalizeResponses(responses, asinToLaptopId, checkedAt);
  await writeSnapshot(offers, checkedAt);
  console.log(`Updated ${Object.keys(offers).length} Amazon offers in price-snapshot.js.`);
}

main().catch((error) => {
  if (isAssociateNotEligible(error)) {
    console.warn('::warning title=Amazon Creators API not yet eligible::Keeping the reference-price fallback. Run this workflow again after the Associates account meets Amazon eligibility requirements.');
    return;
  }
  console.error(error.message);
  process.exitCode = 1;
});
