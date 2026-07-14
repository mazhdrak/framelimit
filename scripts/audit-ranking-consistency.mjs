import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadLaptops() {
  const source = await fs.readFile(path.join(ROOT, 'laptops.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'laptops.js' });
  return sandbox.window.LAPTOPS || [];
}

function textContent(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function scoreFromMarkup(value) {
  const text = value.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim().replace(/^NR$/i, 'N/R');
  if (/^(?:N\/R|—|-)$/.test(text)) return null;
  const score = Number.parseFloat(text);
  return Number.isFinite(score) ? score : undefined;
}

function add(results, file, message) {
  results.push({ file, message });
}

function extractPickCards(source) {
  const starts = Array.from(source.matchAll(/<div\s+class=["']pick-card["'][^>]*>/gi));
  return starts.map((match, index) => source.slice(match.index, starts[index + 1]?.index ?? source.length));
}

async function auditPriceGuides(laptopsById, results) {
  const entries = await fs.readdir(ROOT);
  const guides = entries.filter((file) => /^guide-best-gaming-laptop-under-\d+\.html$/i.test(file)).sort();

  for (const file of guides) {
    const source = await fs.readFile(path.join(ROOT, file), 'utf8');
    const rankedCards = [];
    let foundUnranked = false;
    let previousScore = Number.POSITIVE_INFINITY;

    for (const card of extractPickCards(source)) {
      const scoreMarkup = card.match(/<div\s+class=["']pick-score["'][^>]*>([\s\S]*?)<\/div>/i)?.[1];
      if (scoreMarkup === undefined) continue;
      const score = scoreFromMarkup(scoreMarkup);
      const badge = textContent(card.match(/<div\s+class=["']pick-rank-badge["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] || '');
      const explicitlyUnranked = /\b(?:unranked|not ranked|rank pending)\b/i.test(badge);
      const laptopId = card.match(/<div\s+class=["']pick-name["'][^>]*data-fl-laptop=["']([^"']+)["']/i)?.[1];

      if (score === null || explicitlyUnranked) {
        foundUnranked = true;
        if (score !== null && laptopId) {
          const laptop = laptopsById.get(laptopId);
          if (laptop && laptop.score !== score) {
            add(results, file, `${laptopId} shows editorial score ${score.toFixed(1)}, but laptops.js publishes ${laptop.score ?? 'N/R'}`);
          }
        }
        continue;
      }
      if (score === undefined) {
        add(results, file, `unrecognized pick score: ${textContent(scoreMarkup)}`);
        continue;
      }
      if (foundUnranked) add(results, file, `ranked score ${score.toFixed(1)} appears after an unranked card`);
      if (score > previousScore) add(results, file, `ranked scores are not descending: ${score.toFixed(1)} follows ${previousScore.toFixed(1)}`);
      previousScore = score;
      if (!laptopId) {
        add(results, file, `ranked score ${score.toFixed(1)} has no data-fl-laptop id`);
        continue;
      }
      const laptop = laptopsById.get(laptopId);
      if (!laptop) {
        add(results, file, `ranked card uses unknown laptop id: ${laptopId}`);
        continue;
      }
      if (laptop.score !== score) {
        add(results, file, `${laptopId} shows ${score.toFixed(1)}, but laptops.js publishes ${laptop.score ?? 'N/R'}`);
      }
      rankedCards.push(laptopId);
    }

    const quickRanks = Array.from(source.matchAll(/<li\b[^>]*data-fl-price-id=["']([^"']+)["'][^>]*>[\s\S]*?<span\s+class=["']qp-rank["'][^>]*>(\d+)<\/span>[\s\S]*?<\/li>/gi))
      .map((match) => ({ id: match[1], rank: Number.parseInt(match[2], 10) }))
      .sort((a, b) => a.rank - b.rank);
    const quickIds = quickRanks.map(({ id }) => id);
    if (quickIds.join('|') !== rankedCards.join('|')) {
      add(results, file, `numeric Quick Picks (${quickIds.join(', ') || 'none'}) do not match ranked cards (${rankedCards.join(', ') || 'none'})`);
    }
  }
}

async function auditCentralReviews(laptopsById, results) {
  const file = 'reviews.html';
  const source = await fs.readFile(path.join(ROOT, file), 'utf8');
  const cards = Array.from(source.matchAll(/<article\s+class=["'][^"']*review-card[^"']*["']([^>]*)>([\s\S]*?)<\/article>/gi));
  const cardScores = [];

  for (const card of cards) {
    const attributes = card[1];
    const body = card[2];
    const laptopId = attributes.match(/\bdata-laptop-id=["']([^"']+)["']/i)?.[1];
    const scoreMarkup = body.match(/<div\s+class=["']rc-score-big["'][^>]*>([\s\S]*?)<\/div>/i)?.[1];
    const score = scoreMarkup === undefined ? undefined : scoreFromMarkup(scoreMarkup);
    if (score === undefined) {
      add(results, file, `review card has an unrecognized or missing score${laptopId ? `: ${laptopId}` : ''}`);
      continue;
    }
    cardScores.push(score);
    if (!laptopId) continue;
    const laptop = laptopsById.get(laptopId);
    if (!laptop) {
      add(results, file, `review card uses unknown laptop id: ${laptopId}`);
      continue;
    }
    if (laptop.score !== score) {
      add(results, file, `${laptopId} card shows ${score?.toFixed(1) ?? 'N/R'}, but laptops.js publishes ${laptop.score ?? 'N/R'}`);
    }
  }

  const table = source.match(/<!-- COMPARISON TABLE -->([\s\S]*?)<\/table>/i)?.[1] || '';
  const rows = Array.from(table.matchAll(/<tr[^>]*><td><span\s+class=["']laptop-name["'][^>]*>[^<]+<\/span>[\s\S]*?<span\s+class=["'][^"']*\bcs\b[^"']*["'][^>]*>([^<]+)<\/span>[\s\S]*?<\/tr>/gi));
  const rowScores = rows.map((row) => scoreFromMarkup(row[1]));
  if (rows.length !== cards.length) add(results, file, `comparison table has ${rows.length} rows for ${cards.length} review cards`);
  if (rowScores.some((score) => score === undefined)) add(results, file, 'comparison table contains an unrecognized score');

  let foundUnranked = false;
  let previousScore = Number.POSITIVE_INFINITY;
  for (const score of rowScores) {
    if (score === null) {
      foundUnranked = true;
      continue;
    }
    if (score === undefined) continue;
    if (foundUnranked) add(results, file, `ranked table score ${score.toFixed(1)} appears after N/R`);
    if (score > previousScore) add(results, file, `comparison scores are not descending: ${score.toFixed(1)} follows ${previousScore.toFixed(1)}`);
    previousScore = score;
  }

  const normalize = (scores) => scores.map((score) => score === null ? 'N/R' : score?.toFixed(1)).sort().join('|');
  if (normalize(cardScores) !== normalize(rowScores)) {
    add(results, file, 'comparison-table scores do not match the review-card score set');
  }
}

async function main() {
  const laptops = await loadLaptops();
  const laptopsById = new Map(laptops.map((laptop) => [laptop.id, laptop]));
  const results = [];
  await auditCentralReviews(laptopsById, results);
  await auditPriceGuides(laptopsById, results);
  results.forEach(({ file, message }) => console.log(`ERROR ${file}: ${message}`));
  console.log(`Audited central reviews and price-guide rankings: ${results.length} errors.`);
  if (results.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
