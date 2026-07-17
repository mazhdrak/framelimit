import fs from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const options = { minImpressions: 20, minPosition: 8, maxPosition: 20, maxCtr: 3, limit: 25, output: null, selfTest: false };
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--self-test') options.selfTest = true;
    else if (value === '--min-impressions') options.minImpressions = Number(argv[++index]);
    else if (value === '--min-position') options.minPosition = Number(argv[++index]);
    else if (value === '--max-position') options.maxPosition = Number(argv[++index]);
    else if (value === '--max-ctr') options.maxCtr = Number(argv[++index]);
    else if (value === '--limit') options.limit = Number(argv[++index]);
    else if (value === '--output') options.output = argv[++index];
    else positional.push(value);
  }
  return { input: positional[0], options };
}

function detectDelimiter(header) {
  const candidates = [',', '\t', ';'];
  return candidates.sort((a, b) => header.split(b).length - header.split(a).length)[0];
}

function parseDelimited(source) {
  const clean = source.replace(/^\uFEFF/, '');
  const delimiter = detectDelimiter(clean.split(/\r?\n/, 1)[0]);
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < clean.length; index += 1) {
    const char = clean[index];
    if (quoted && char === '"' && clean[index + 1] === '"') { field += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (!quoted && char === delimiter) { row.push(field); field = ''; }
    else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && clean[index + 1] === '\n') index += 1;
      row.push(field); field = '';
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
    } else field += char;
  }
  if (field || row.length) { row.push(field); if (row.some((value) => value.trim())) rows.push(row); }
  return rows;
}

function normalizedHeader(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function numberValue(value) {
  const clean = String(value || '').trim().replace(/,/g, '').replace(/%$/, '');
  return Number(clean);
}

function analyze(source, options) {
  const rows = parseDelimited(source);
  if (rows.length < 2) throw new Error('The Search Console export has no data rows.');
  const headers = rows[0].map(normalizedHeader);
  const find = (...aliases) => headers.findIndex((header) => aliases.includes(header));
  const dimensionIndex = find('top queries', 'query', 'queries', 'top pages', 'page', 'pages');
  const clicksIndex = find('clicks');
  const impressionsIndex = find('impressions');
  const ctrIndex = find('ctr');
  const positionIndex = find('position', 'average position');
  if ([dimensionIndex, clicksIndex, impressionsIndex, ctrIndex, positionIndex].some((index) => index < 0)) {
    throw new Error(`Required columns not found. Expected query/page, clicks, impressions, CTR and position; found: ${rows[0].join(', ')}`);
  }
  const ctrHadPercent = rows.slice(1).some((row) => String(row[ctrIndex] || '').includes('%'));
  return rows.slice(1).map((row) => {
    const rawCtr = numberValue(row[ctrIndex]);
    const ctr = !ctrHadPercent && rawCtr <= 1 ? rawCtr * 100 : rawCtr;
    return {
      dimension: String(row[dimensionIndex] || '').trim(),
      clicks: numberValue(row[clicksIndex]),
      impressions: numberValue(row[impressionsIndex]),
      ctr,
      position: numberValue(row[positionIndex])
    };
  }).filter((row) => row.dimension && Number.isFinite(row.impressions) && Number.isFinite(row.ctr) && Number.isFinite(row.position))
    .filter((row) => row.impressions >= options.minImpressions && row.position >= options.minPosition && row.position <= options.maxPosition && row.ctr <= options.maxCtr)
    .sort((a, b) => (b.impressions - a.impressions) || (a.position - b.position) || (a.ctr - b.ctr))
    .slice(0, options.limit);
}

function actionFor(row) {
  if (row.position <= 10 && row.ctr < 1) return 'Test title/meta for stronger intent match';
  if (row.position <= 12) return 'Improve snippet and add relevant internal links';
  return 'Expand exact-intent coverage and strengthen internal links';
}

function markdownReport(rows, input, options) {
  const lines = [
    '# Search Console Opportunity Report',
    '',
    `Source: ${path.basename(input || 'self-test.csv')} · Filter: ≥${options.minImpressions} impressions, position ${options.minPosition}–${options.maxPosition}, CTR ≤${options.maxCtr}%`,
    '',
    '| Query or page | Clicks | Impressions | CTR | Position | Recommended next action |',
    '|---|---:|---:|---:|---:|---|'
  ];
  for (const row of rows) {
    const label = row.dimension.replace(/\|/g, '\\|');
    lines.push(`| ${label} | ${row.clicks} | ${row.impressions} | ${row.ctr.toFixed(2)}% | ${row.position.toFixed(1)} | ${actionFor(row)} |`);
  }
  if (!rows.length) lines.push('| No matching opportunities | — | — | — | — | Export a wider date range or lower the impression threshold |');
  lines.push('', 'Record the current title, description, clicks, impressions, CTR and position before editing; compare the same date window after Google recrawls the page.', '');
  return lines.join('\n');
}

const { input, options } = parseArgs(process.argv.slice(2));
if (options.selfTest) {
  const sample = 'Top queries,Clicks,Impressions,CTR,Position\n"best rtx 5060 laptop",4,240,1.67%,11.2\nalready ranking,50,300,16.67%,4.1\n';
  const rows = analyze(sample, options);
  if (rows.length !== 1 || rows[0].dimension !== 'best rtx 5060 laptop') throw new Error('Self-test failed.');
  console.log('Search Console analyzer self-test passed.');
} else {
  if (!input) throw new Error('Usage: node scripts/analyze-search-console.mjs <export.csv> [--min-impressions 20] [--max-ctr 3] [--output report.md]');
  const source = await fs.readFile(input, 'utf8');
  const rows = analyze(source, options);
  const report = markdownReport(rows, input, options);
  if (options.output) {
    await fs.writeFile(options.output, report, 'utf8');
    console.log(`Wrote ${rows.length} opportunities to ${options.output}.`);
  } else console.log(report);
}
