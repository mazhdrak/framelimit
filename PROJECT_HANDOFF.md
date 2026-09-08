# FrameLimit maintenance handoff

Last updated: 2026-09-08. This is a historical checkpoint, not proof of current prices, rankings, stock or deployment status. Recheck external state when continuing.

## Published work

- `a25c987` — crawl fixes, retail price updater fixes and priority review accuracy.
- `3031b1a` — expanded G14 review, Omen/Vector comparison and RTX 5060 guide.
- Both commits were pushed to `main`; Cloudflare Pages served the changed pages successfully.

### Crawl and indexing

- Added `404.html` with noindex and recovery links. Verified an unknown production URL returns HTTP 404, rather than the homepage with 200.
- Added redirects for `/gaming-laptop-buying-guide-2026` and its `.html` variant to `/guide-gaming-laptop-buying-guide-2026`. Verified the extensionless historical URL returns 301.
- Updated sitemap modification dates for edited pages only. There are 79 sitemap URLs at this checkpoint.

### Content

- Expanded reviews: MSI Vector 16 HX AI, Lenovo LOQ 15 Gen 10, Legion 5 Gen 10 AMD, HP Omen Max 16, ASUS TUF F16 RTX 5070, and ASUS G14 GA403UP-CS96.
- Corrected Vector ports (Thunderbolt 5, two USB-A, SD reader), keyboard, Windows edition and factory SSD claims. Distinguished editorial analysis from exact-unit measurements.
- Corrected Stealth A3XWHG-079US to 32GB LPDDR5X, 2TB SSD and 99.9Wh. Its benchmark evidence uses a related 64GB configuration. Removed unsupported scores/measurements and synchronized the review hub, including its unranked comparison-table row. The manufacturer listing has conflicting weight figures; the review discloses approximately 2.0–2.1kg.
- Removed hardcoded stale price presentation in Stealth, Legion 7i and Omen Transcend 14 reviews in favor of shared price handling.
- Expanded under-$1,000 and under-$1,500 guides with total-cost and offer-selection considerations. Removed unconditional budget claims without verified offers.
- Corrected Titan weight and Blade configuration context in the video-editing guide; adjusted hub copy.
- Expanded G14 with resolution, onboard memory and portability trade-offs. It remains specifications-only and unranked; GU405AR benchmark results must not be applied to GA403UP-CS96.
- Expanded Omen B64BNUA#ABA versus Vector A2XWIG-058US with upgrade/accessory cost, ports and matched-test criteria. No universal performance winner asserted.
- Expanded RTX 5060 guide with workload selection, power-limit interpretation and rendering-mode comparisons. No new live price or stock claims.

### Retail links and prices

- `scripts/retail-links.mjs` validates Amazon product hosts, direct ASIN paths and tags; official ASUS retail links are supported separately.
- The updater now includes 42 direct ASINs: the core catalog, three extra review products and six upgrade products.
- Two explicitly labeled Crucial part-number searches for `CT2K32G64C52CS5` remain discovery links, not confirmed product offers.
- Live price display requires matching ASIN, positive USD price, valid timestamp and availability checks. API prices expire after 24 hours; reference prices after 30 days. Missing freshness helpers fail closed. Same-day reference dates are handled correctly.
- Workflow runs daily, on manual dispatch and on main-branch changes to the price workflow, updater, retail helper, catalog or price presentation code. Snapshot-only changes do not retrigger it.
- Missing credentials, Amazon eligibility rejection and empty managed-offer responses no longer masquerade as a successful refresh.

## Confirmed outstanding blocker

Run https://github.com/mazhdrak/framelimit/actions/runs/34198205088 passed the affiliate audit, then failed because Amazon rejected Associates eligibility. The three credential secrets were present (masked); this was not a missing-key failure. The previous snapshot was preserved and no current prices were refreshed.

At this checkpoint `price-snapshot.js` is empty and 27 catalog reference prices are dated July 15, 2026. Do not change those dates just to pass freshness checks. Resolve eligibility in the Amazon account, then rerun and inspect the actual result before claiming price recovery. Do not request secrets in chat or commit them.

## Validation evidence

- First package: 24/25 audit scripts passed. Only `audit-price-freshness.mjs` failed, correctly identifying 27 stale reference prices (55 days old on September 8).
- `node scripts/test-retail-prices.mjs` passed host/ASIN, official retailer, date, expiry, currency and unavailable-offer tests.
- `node scripts/update-amazon-prices.mjs --audit` passed: 42 managed ASINs, 213 direct HTML Amazon links, zero unresolved Amazon links. Structural validation does not establish seller stock or exact product-page contents.
- Second package: G14 cluster, comparisons, guides, sitemap, internal links, Product schema, evidence claims, SEO query map and ranking consistency checks passed.
- Production checks confirmed the new 404, historical 301, and updated Vector, Stealth, G14, Omen/Vector and RTX 5060 pages returning their expected content/status.

## Next work

1. Resolve Amazon eligibility externally, verify a real snapshot, then reassess budget shortlists using current exact-SKU offers and seller/condition/checkout terms.
2. Continue targeted editorial review of remaining short pages, especially Gigabyte A16 and other pages with Search Console impressions. Audit unsupported scores, thermal figures and exact-retail versus related-test configuration claims before adding text.
3. Recheck indexing after recrawl and compare equivalent Search Console periods. Do not claim immediate ranking improvement from publication, or use word count as a quality target.
4. Improve workload comparisons using traceable evidence; do not invent measurements to fill missing tests.

## Local audit material

`audit-site-2026-09-08/` contains REPORT.md (original audit snapshot), IMPLEMENTED.md (implementation log), CONTENT-PAGES.md, inventories and check outputs, including private Search Console context. It is intentionally untracked. `audit-homepage/` also predates these commits and remains untracked. Preserve both; do not bulk-stage them or treat the original report as the current implementation state.

The public repository intentionally excludes Search Console traffic/ranking details and raw account evidence. Read local IMPLEMENTED.md when available, then verify live state. Audit helper scripts may be non-idempotent; do not blindly rerun the content insertion scripts.
