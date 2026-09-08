import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const sandbox = {window: {}, document: {addEventListener() {}, readyState: 'loading'}, Date, Intl};
for (const file of ['laptops.js', 'price-data.js', 'laptop-cards.js']) vm.runInNewContext(read(file), sandbox);
const blocked = ['acer-predator-helios-neo-16-2025', 'hp-omen-max-16-2026', 'lenovo-legion-7i-gen10', 'hp-omen-transcend-14'];
for (const id of blocked) {
  const record = sandbox.window.flGetPriceRecord(id);
  assert.ok(record.retailBlocked && record.retailIssue, id);
  assert.equal(record.amazonUrl, '', id);
  assert.equal(sandbox.window.flGetFreshOffer(id), null);
  if (sandbox.window.LAPTOPS.includes(record)) {
    const card = sandbox.window.flRenderCard(record);
    assert.ok(card.includes('Exact Amazon listing under review'));
    assert.ok(!/href="(?:undefined|null|)"/.test(card));
  }
}
for (const file of fs.readdirSync(new URL('..', import.meta.url)).filter(f => /\.(?:html|js)$/.test(f))) {
  assert.ok(!/amazon\.com\/dp\/(?:B0G5XC26P7|B0F17BHVV1|B0FWVFBB81|B0GCQCMGDC)/.test(read(file)), file);
}
const expected = {1000: [], 1500: ['gigabyte-gaming-a16-rtx5060', 'acer-nitro-v-16'], 2000: ['gigabyte-gaming-a16-rtx5060', 'acer-nitro-v-16'], 2500: ['msi-katana-15-hx', 'dell-alienware-16x-aurora'], 3000: ['msi-vector-16-hx-ai']};
for (const [budget, ids] of Object.entries(expected)) {
  const html = read(`guide-best-gaming-laptop-under-${budget}.html`);
  const eligible = html.split('<h2>Offers Within Budget at the Check</h2>')[1].split('<h2>Watchlist')[0];
  assert.deepEqual([...eligible.matchAll(/class="pick-name" data-fl-laptop="([^"]+)"/g)].map(m => m[1]), ids);
  assert.ok(!/\$(?:1,299\.97|1,449\.99|2,272\.69|2,399|2,759|3,589|3,699\.95)/.test(html), budget);
}
console.log('Blocked retail links, renderer fallbacks, budget membership/order and link-only presentation passed.');
