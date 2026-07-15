import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const claimPatterns = [
  { label: 'unsupported fully-tested claim', pattern: /\bfully tested\b/i },
  { label: 'unsupported first-person test claim', pattern: /\b(?:we|framelimit)\s+(?:tested|measured|recorded|observed|benchmarked)\b/i },
  { label: 'unsupported in-house test claim', pattern: /\bin our testing\b|\bour (?:tests?|testing|measurements?|benchmarks?)\b/i },
  { label: 'ambiguous tested-configuration claim', pattern: /\bthe tested (?:retail )?configuration\b/i },
  { label: 'unsupported sustained-load claim', pattern: /\b\d+-minute (?:combined |sustained |stress )?(?:load|session|test)\b/i },
  { label: 'unsupported precise thermal claim', pattern: /\b(?:gpu|cpu)\s+(?:stabilizes|peaked|stays)\s+at\s+\d/i },
  { label: 'unsupported throttling claim', pattern: /\b(?:no measurable|never|does not)\s+throttl/i },
  { label: 'unsupported hands-on build claim', pattern: /\b(?:no (?:lid|display|deck) flex|minimal (?:keyboard )?deck flex|solid and creak-free|hinge is (?:firm|smooth|precise)|most satisfying keyboard feel|satisfying tactile feedback)\b/i },
];

const safeContext = /\b(?:not|no) (?:an? )?(?:framelimit )?(?:measurement|test)|\bhas not (?:completed|run|tested|measured)|\bdoes not claim|\bnot tested by framelimit|\bthird-party|\bpublished (?:test|testing|measurement|evidence|result)|\bsourced (?:test|testing|measurement|evidence|result)/i;

function stripComments(source) {
  return source.replace(/<!--[\s\S]*?-->/g, '');
}

function visibleText(source) {
  return stripComments(source)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function snippets(text, pattern) {
  const matches = [];
  const globalPattern = new RegExp(pattern.source, `${pattern.flags.replace('g', '')}g`);
  for (const match of text.matchAll(globalPattern)) {
    const start = Math.max(0, match.index - 120);
    const end = Math.min(text.length, match.index + match[0].length + 120);
    matches.push(text.slice(start, end));
  }
  return matches;
}

async function main() {
  const entries = await fs.readdir(ROOT);
  const files = entries
    .filter((file) => /^(?:review-|guide-).*\.html$/i.test(file) || file === 'methodology.html')
    .sort();
  const results = [];
  let skipped = 0;

  for (const file of files) {
    const source = await fs.readFile(path.join(ROOT, file), 'utf8');
    if (/<meta\s+name=["']robots["']\s+content=["'][^"']*\bnoindex\b/i.test(source)) {
      skipped += 1;
      continue;
    }

    if (/How FRAMELIMIT Tests Gaming Laptops/i.test(stripComments(source))) {
      results.push({ file, label: 'outdated methodology metadata claim', snippet: 'How FRAMELIMIT Tests Gaming Laptops' });
    }

    const text = visibleText(source);
    for (const { label, pattern } of claimPatterns) {
      for (const snippet of snippets(text, pattern)) {
        if (!safeContext.test(snippet)) results.push({ file, label, snippet });
      }
    }
  }

  for (const { file, label, snippet } of results) {
    console.log(`ERROR ${file}: ${label}: ${snippet}`);
  }
  console.log(`Audited ${files.length - skipped} indexable editorial pages (${skipped} noindex skipped): ${results.length} errors.`);
  if (results.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
