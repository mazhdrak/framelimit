import fs from 'node:fs';
import vm from 'node:vm';

const catalogContext = { window: {} };
vm.runInNewContext(fs.readFileSync('laptops.js', 'utf8'), catalogContext);
const laptopAsins = new Set(catalogContext.window.LAPTOPS.map(laptop => laptop.amazonAsin).filter(Boolean));
// Stealth is a maintained review-only product, also managed by the retail updater.
laptopAsins.add('B0DYSHDBPN');

const errors = [];
let count = 0;
for (const file of fs.readdirSync('.').filter(file => /^review-.*\.html$/.test(file))) {
  const html = fs.readFileSync(file, 'utf8');
  if (file === 'review-notes-2026.html' || /name="robots"[^>]*content="[^"]*noindex/.test(html)) continue;
  count++;
  const fail = message => errors.push(`${file}: ${message}`);
  for (const className of ['review-conversion', 'review-overview', 'review-jumps', 'review-purchase']) {
    if (!html.includes(className)) fail(`Missing ${className}`);
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  for (const id of new Set(ids.filter((id, index) => ids.indexOf(id) !== index))) fail(`Duplicate id ${id}`);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.includes(match[1])) fail(`Missing anchor ${match[1]}`);
  }
  if ((html.match(/class="review-glance-item"/g) || []).length !== 6) fail('Expected six quick specifications');
  const overview = html.match(/<section class="review-overview"[\s\S]*?<\/section>/)?.[0] || '';
  const image = overview.match(/<img[^>]+src="([^"]+)"/);
  if (!image || !fs.existsSync(image[1])) fail('Missing overview image');
  if (!/href="https:\/\/(?:www\.amazon\.com\/dp\/|rog\.asus\.com\/)|href="#retail-status"/.test(overview)) fail('Missing retailer action or documented withheld link');
  const purchaseAsin = overview.match(/amazon\.com\/dp\/([A-Z0-9]{10})/)?.[1];
  if (purchaseAsin && !laptopAsins.has(purchaseAsin)) fail(`Overview purchase target ${purchaseAsin} is not a catalog laptop`);
  if (html.includes('Published synthetic scores') && (!html.includes('Related test configuration:') || !html.includes('jarrods.tech/best-gaming-laptop-3dmark-results/'))) fail('Synthetic score lacks configuration/source');
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Review layout: ${count} canonical reviews; six specifications, images, retailer actions, anchors and evidence attribution pass.`);
