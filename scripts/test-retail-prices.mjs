import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { amazonProduct, officialRetailUrls } from './retail-links.mjs';

assert.equal(amazonProduct('https://amazon.com.evil.example/dp/B0DTN19VXZ'), null);
assert.equal(amazonProduct('https://www.amazon.com/s?k=B0DTN19VXZ'), null);
assert.equal(amazonProduct('https://rog.asus.com/us/laptops/'), null);
assert.deepEqual(amazonProduct('https://www.amazon.com/dp/B0DTN19VXZ/?tag=framelimit20-20'), {asin:'B0DTN19VXZ',tag:'framelimit20-20'});
assert.ok((await officialRetailUrls()).has('https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g14-2025/wtb/'));

const now=Date.parse('2026-09-08T12:00:00Z');
class Clock extends Date { static now(){return now;} }
const catalogSource=await fs.readFile(new URL('../laptops.js',import.meta.url),'utf8');
const priceSource=await fs.readFile(new URL('../price-data.js',import.meta.url),'utf8');
function context(offer){
 const sandbox={window:{FL_PRICE_SNAPSHOT:{offers:offer?{'msi-vector-16-hx-ai':offer}:{}}},Date:Clock,Intl,document:{readyState:'loading',addEventListener(){}}};
 vm.runInNewContext(catalogSource,sandbox);vm.runInNewContext(priceSource,sandbox);return sandbox.window;
}
const w=context();
assert.equal(w.flIsReferencePriceFresh({price:1000,priceCheckedAt:'2026-09-08'},now),true,'same-day prices must be usable');
assert.equal(w.flIsReferencePriceFresh({price:1000,priceCheckedAt:'2026-09-09'},now),false,'future dates must not be used');
assert.equal(w.flIsReferencePriceFresh({price:1000,priceCheckedAt:'2026-07-15'},now),false,'expired references must not be used');
assert.equal(w.flGetPriceDisplay('msi-vector-16-hx-ai').kind,'unavailable');
const offer={asin:'B0DTN19VXZ',price:2500,currency:'USD',availability:'IN_STOCK',checkedAt:'2026-09-08T10:00:00Z'};
assert.equal(context(offer).flGetPriceDisplay('msi-vector-16-hx-ai').kind,'amazon');
for(const bad of [{asin:'B0F195W823'},{currency:'EUR'},{price:0},{checkedAt:'2026-09-06T10:00:00Z'},{checkedAt:'2026-09-09T10:00:00Z'},{availability:'OUT_OF_STOCK'}]){
 assert.equal(context({...offer,...bad}).flGetPriceDisplay('msi-vector-16-hx-ai').kind,'unavailable',JSON.stringify(bad));
}
console.log('Retail host/ASIN validation, official retailer mapping, same-day references, expiry, future dates, currency and unavailable-offer tests passed.');
