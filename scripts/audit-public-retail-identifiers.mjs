import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const entries = await fs.readdir(root, { withFileTypes: true });
const htmlFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.html'));
const failures = [];
const laptopIdentifierPattern = /\b(?:A2XW(?:IG|HG|JG)(?:-[A-Z0-9]+)?|A9WJG(?:-[A-Z0-9]+)?|GZ302EA(?:-[A-Z0-9]+)?|GU605(?:CW|CR)(?:-[A-Z0-9.]+)?|GA403UP-CS96|G615(?:_380W|LW)|G835LX-XS97|G635LW-XS97|RZ09-[A-Z0-9-]+|B64BNUA(?:#ABA)?|83[A-Z0-9]{6,}|15AHP10|16IAX10H|PHN16S-[A-Z0-9-]+|NH\.[A-Z0-9.]+|ANV16S?-[A-Z0-9-]+|FA60[A-Z0-9.-]+|FA617XT|FX507[A-Z0-9.-]*|CVHI3US894SH|CWHI3US864SH|AC1625[01]|AA18250)\b/i;

const protectedPages = new Map([
  ['review-asus-tuf-gaming-a16-2026.html', /\b(?:FA608UP-A16\.R95070|FA608UP|FA608UM|FA608)\b/i],
  ['guide-asus-tuf-a16-vs-tuf-f16-rtx-5070.html', /\b(?:FA608UP-A16\.R95070|FA608UP|FA608UM|FA608|FX507)\b/i],
  ['review-asus-rog-strix-g16-2026.html', /\b(?:G615_380W|G615LW)\b/i],
  ['guide-legion-pro-7i-vs-rog-strix-g16-rtx-5080.html', /\b(?:G615_380W|G615LW|83F50053US)\b/i],
  ['review-msi-raider-18-hx-ai.html', /\bA2XWJG(?:-[A-Z0-9]+)?\b/i],
  ['guide-msi-raider-a18-hx-vs-raider-18-hx-ai.html', /\b(?:A2XWJG|A9WJG)(?:-[A-Z0-9]+)?\b/i],
  ['review-alienware-16-aurora.html', /\bAC16250\b/i],
  ['review-asus-rog-flow-z13-radeon-8060s.html', /\bGZ302EA(?:-[A-Z0-9]+)?\b/i],
  ['review-asus-rog-zephyrus-g16-2026.html', /\bGU605(?:CW|CR)(?:-[A-Z0-9.]+)?\b/i],
  ['review-hp-omen-max-16-2026.html', /\bB64BNUA(?:#ABA)?\b/i],
  ['review-lenovo-legion-5-gen10-amd.html', /\b15AHP10\b/i],
  ['review-lenovo-legion-7i-gen10.html', /\b83KY0003US\b/i],
  ['review-msi-raider-a18-hx-amd.html', /\bA9WJG(?:-[A-Z0-9]+)?\b/i],
  ['review-razer-blade-14-2026.html', /\bRZ09-[A-Z0-9-]+\b/i]
]);

function publicCopy(source) {
  const withoutExecutable = source
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  const attributes = [...withoutExecutable.matchAll(/\b(?:content|alt|title|aria-label)=(['"])([\s\S]*?)\1/gi)]
    .map((match) => match[2])
    .join(' ');
  const text = withoutExecutable.replace(/<[^>]+>/g, ' ');
  return `${attributes} ${text}`.replace(/\s+/g, ' ');
}

function presentationCopy(source) {
  const withoutExecutable = source
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  const headings = [...withoutExecutable.matchAll(/<(title|h[1-4])\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((match) => match[2]);
  const namedCards = [...withoutExecutable.matchAll(/<[^>]+class=(['"])[^'"]*\b(?:pick-name|rc-name|laptop-name|latest-review-tag|latest-review-title|cmp-sku)\b[^'"]*\1[^>]*>([\s\S]*?)<\/[^>]+>/gi)]
    .map((match) => match[2]);
  const attributes = [...withoutExecutable.matchAll(/\b(?:content|alt|title|aria-label)=(['"])([\s\S]*?)\1/gi)]
    .map((match) => match[2]);
  return [...headings, ...namedCards, ...attributes]
    .join(' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

for (const entry of htmlFiles) {
  const source = await fs.readFile(path.join(root, entry.name), 'utf8');
  const copy = publicCopy(source);
  if (/\bASINs?\b|\bB0[A-Z0-9]{8}\b/i.test(copy)) {
    failures.push(`${entry.name}: exposes an Amazon identifier in public copy`);
  }
  if (/Amazon Amazon|Amazon product page for Amazon product page/i.test(copy)) {
    failures.push(`${entry.name}: contains duplicated Amazon wording`);
  }
  const protectedPattern = protectedPages.get(entry.name);
  if (protectedPattern?.test(copy)) {
    failures.push(`${entry.name}: exposes an internal retailer/model identifier`);
  }
  if (/^(?:review|guide)-/i.test(entry.name) && laptopIdentifierPattern.test(presentationCopy(source))) {
    failures.push(`${entry.name}: exposes a retailer/model identifier in a public title, heading, card name or metadata`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Public retail identifiers: PASS (${htmlFiles.length} HTML files; Amazon URLs remain available in markup).`);
