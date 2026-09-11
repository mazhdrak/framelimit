# FrameLimit maintenance handoff

Last updated: 2026-09-10. This is a historical checkpoint, not proof of current prices, rankings, stock or deployment status. Recheck external state when continuing.

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

## Gigabyte evidence correction — September 8, 2026

This supersedes earlier references to a 32GB Clubic test unit, including the RTX 5060 guide text in 3031b1a. Re-reading Clubic's original review established a French 16GB DDR5-5200 test unit. PC Gamer's separate CVHI3US864SH review uses 32GB. Neither proves an exact CVHI3US894SH US retail match.

- Corrected benchmark configuration metadata and attribution; synchronized reviews hub, RTX 5060 guide, under-$1,500 guide and LOQ/Gigabyte comparison (including FAQ schema).
- Removed contradictory 8.1/7.8 ratings and subscores from the retail review, catalog and hub; exact US configuration is unranked. Product-with-rating schema became Article.
- Removed unsupported 83°C GPU / 85°C CPU / 45dB claims. Attributed Clubic's regional 50–51dB and 53°C keyboard-area observation explicitly, distinguishing surface from component temperature.
- Removed unverified sub-$1,400/best-price metadata. Expanded memory, total-offer comparison and return-period guidance without inventing benchmarks or current prices.
- Full audit suite: 24/25 pass; only unchanged reference-price freshness fails. Comparison audit now expects the corrected regional 16GB description.
- Sources: https://www.clubic.com/test-produit-579277-test-gigabyte-gaming-16-un-gamer-abordable-et-competent-sous-rtx-5060.html and https://www.pcgamer.com/hardware/gaming-laptops/gigabyte-gaming-a16-gaming-laptop-review/ . Continue checking remaining reviews; this does not certify all old ratings or measurements elsewhere.

## Katana follow-up — September 8, 2026

- Expanded Katana review with SSD/RAM planning, 8GB VRAM trade-offs and purchase comparisons. Explicitly identified the MSI specification as regional B14WGK-298NZ; its one-M.2-slot limit must not be assumed for an unverified suffix.
- Removed unsupported 84°C GPU, 91°C CPU and 47dB claims, fixed QHD/QHD+ wording, and removed the unverified $1,750 best-value assertion.
- Removed granular subscores from the review, catalog and hub. Existing overall 7.9 is explicitly historical editorial assessment, not a measured metric or current-price ranking; no fresh score was fabricated.
- Ranking consistency, review readiness, sitemap, evidence claims, Product schema and internal-link audits passed. Amazon eligibility remains an external blocker.
- Previous Gigabyte commit b5bb937 was verified live (review and benchmark metadata).

## Legion 5i follow-up — September 8, 2026

Expanded 83N20003BO review with SDR/HDR interpretation, glossy-screen considerations, dock/adapter selection and exact-listing comparisons. Rechecked Lenovo 15IAX10 PSREF. Preserved the distinction from related 15IRX10 tests and the unranked exact SKU. Removed stale Value Pick labeling and the misleading exact-evidence label on its Katana alternative. Replaced the unrefreshed Kingston maximum claim with Lenovo's documented 32GB offering. Updated editorial date, reading time and sitemap. Review-readiness, internal links, evidence-claims and sitemap checks passed. No prices or benchmark results were invented.

## Manual budget-offer check — September 8, 2026

User policy: do not publish individual current prices; keep valid Amazon purchase links. Still check actual offers privately to assign budget guides. Central price presentation now remains link-only even if the API later recovers. Historical price-report data is not refreshed by this work.

Checked 16 Amazon ASIN pages in the browser with US delivery ZIP 10001 and USD, plus the ASUS G14 where-to-buy page. Eligibility uses new-item price plus shipping before sales tax; no used/renewed offers, credit-card incentives or different variants substituted. This was a product-page check, not a completed checkout or market-wide search. Exact amounts and seller observations are private in audit-site-2026-09-08/budget-offers-private.json. Never rerun the non-idempotent local update-budget-guides.mjs.

- Under 1,000: none of the checked offers qualifies.
- Under 1,500: Gigabyte CVHI3US894SH then Nitro ANV16S-41-R2AJ, ordered by observed offer total. LOQ and TUF 64GB unavailable. Gigabyte required opening All Buying Options.
- Under 2,000: previously listed RTX 5070-class candidates did not qualify; show the cheaper verified RTX 5060 options and a separate watchlist. Katana new offer belongs in the under-2,500 comparison; its cheaper used offer is excluded. Legion 5i, TUF 32GB and Omen Slim unavailable.
- Under 2,500: Katana then Alienware 16X 32GB/2TB. Blade 14 exceeds the ceiling. G14 exact-SKU price not confirmed; family starting price was excluded.
- Under 3,000: Vector A2XWIG-058US qualifies; Legion Pro 7i exceeds ceiling.

Withheld four incorrect/conflicting ASINs across static pages and renderers: B0FWVFBB81 now shows ThinkPad E16; B0G5XC26P7 shows Neo 16 IPS instead of reviewed Neo 16S OLED; B0GCQCMGDC shows RTX 5060 instead of reviewed Transcend RTX 5070; B0F17BHVV1 has Omen Max title but unrelated 14-inch Ryzen bullets. Catalog records retain specifications with retailBlocked/retailIssue and empty purchase URLs. No replacement ASIN was guessed. Updater now manages 38 ASINs, excludes blocked records. Tests permit explicitly documented withheld links and verify safe rendering, no retired links, eligibility order and link-only output.

Budget pages, hub copy and sitemap updated. Editorial scores were not recalculated or treated as a current budget rank. Dated eligible offers come first; unavailable, over-budget and unverified references are separated. Do not promote them based on stale reference prices. Next: find and verify replacement exact-SKU Amazon listings for the four blocked products; periodically repeat offer checks and review remaining historical content. Amazon API eligibility is still unresolved.

Validation: 24/25 audits pass after date alignment; only the existing 27 stale July reference prices fail freshness. Both retail-price and budget-offer regression tests pass. Browser preview confirms hydrated guide content and purchase links with no individual price amounts. Local validation record: budget-validation.json.

## Replacement listing investigation — September 9, 2026

Rechecked the four blocked listings and searched alternatives. The retired ASINs remain excluded from purchase records. No individual prices published and no budget eligibility promoted.

- Legion 7i: B0G5Z8CJ54 explicitly identifies 83KY0003US, Ultra 9 275HX, RTX 5070, 32GB, 1TB and 240Hz OLED. Browser check on September 9 with US ZIP 10001 showed currently unavailable. Recorded the matching ASIN and unavailable status in the review; blocked purchase record remains until a usable offer is checked.
- Predator: B0G6CKXT1F is an unavailable 240Hz OLED/Windows Pro candidate, not a confirmed NH.QZQAA.001 replacement. Acer Canada specifies NH.QZQAA.001 at 165Hz OLED; Acer US specifies NH.U0KAA.001 at 240Hz OLED, both named PHN16S-71-98RF. Corrected catalog source to Canada and explained regional distinction in review. Do not transfer panel measurements between them.
- Transcend: B0HB3LP5JK matches major Ultra 9 285H/RTX 5070/32GB/1TB/OLED specifications, but the seller bundle does not identify 14-fb1053dx/D8KM4UA. Not accepted as an exact-SKU replacement. Earlier observed offer exceeded the under-2,500 ceiling; do not treat it as a newly refreshed September 9 price.
- Omen Max: focused Amazon search on September 9 did not identify a replacement 16-ah0097nr/B64BNUA. Results were different AMD/RTX 5070 configurations. Original conflicting ASIN remains withheld. HP exact-model datasheet: https://h20195.www2.hp.com/v2/getpdf.aspx/c09099360.pdf .

The four original page problems remain as recorded above. This investigation does not establish that no other matching offers exist.

## Additional budget alternatives — September 9, 2026

Added three separately identified, unranked configurations to central price records and guides after browser checks for US ZIP 10001. No product amounts or reference-price dates added to public code. Private amounts, sellers and condition evidence: audit-site-2026-09-08/additional-offers-2026-09-09.json.

- Under 1,000: HP Victus 15-fa1040nr, B0C6WJMFYH, i5-12500H/RTX 4050/16GB/512GB. All Offers explicitly confirmed New, SPTT LLC, free shipping. HP datasheet confirms model; guide explains older platform, 6GB VRAM, basic 250-nit/45% NTSC display and storage limits.
- Under 2,000: Gigabyte A16 CWHI3US864SH, B0FDM3M1WF, i7-13620H/RTX 5070/32GB/1TB, new offer from GS Electronics with free shipping. Exact listing specifications only; no performance results borrowed from CVHI3US894SH RTX 5060 review.
- Under 2,000: MSI Vector A2XWHG-212US, B0DTN2RZ1Q, Ultra 7 255HX/RTX 5070 Ti/16GB/512GB, new Amazon.com offer with free shipping. MSI confirms base 144Hz FHD+ 45% NTSC panel and two 8GB modules. No transfer of RTX 5080 A2XWIG-058US scores or benchmarks.

Existing September 8 offers retain their original dated observations. New eligible cards follow the older cheaper RTX 5060 records by observed total, with mixed check dates disclosed. Updated guide summaries, hub and sitemap. These are selected alternatives, not a complete market ranking. The guide audit now resolves all central price-record IDs instead of a hardcoded exception list. Managed ASIN count is 41.

## Nitro RTX 5070 budget follow-up — September 9, 2026

Added separate ANV16-72-72ZY / NH.U2FAA.002, ASIN B0FRNL6NQ7, to under-1,500 and under-2,000 guides, first by observed total. Browser confirmed new/in-stock offer, free US ZIP 10001 delivery, seller named Acer_Authorized; its authorization is not independently certified. Private amount in nitro-offer-2026-09-09.json. Acer exact model page confirms Core 7 240H, 16GB/512GB, WUXGA IPS 180Hz and maximum graphics power 85W; Amazon identifies RTX 5070. No benchmark transfer from Ryzen ANV16S-41-R2AJ or scores invented. Removed blanket cheaper-RTX-5060 wording now contradicted by this offer. Existing September 8 observations retain dates. No individual prices published. Managed ASINs: 42.

## Alienware 16 Aurora editorial follow-up — September 10, 2026

Expanded the short AC16250 RTX 5060 page into a specification-led buying review. Dell documentation now supports the display, memory, storage and port sections; the page explicitly states that FRAMELIMIT has not tested the exact unit and does not transfer Dell G16 benchmarks, thermals, noise or battery runtime.

- Rechecked Amazon ASIN B0FXX3QS1F with US ZIP 10001. Its visible major configuration matched Core 7 240H, RTX 5060, 32GB, 1TB and 2560x1600 120Hz, but the page was currently unavailable. Kept the tagged exact-product link without publishing a price or treating availability as a current value ranking.
- Corrected the identified retail configuration from 60Wh / 2.57kg to the listing's 96Wh / 5.68 lb (about 2.58kg) and 180W adapter. The AC16250 family has other battery options, so do not transfer this value to another suffix without checking it.
- Added Dell-documented 120Hz/30ms-typical display limits, two-slot 32GB memory context, two M.2 2230 storage slots and required SSD thermal hardware, full port limitations and buyer/skip guidance.
- Removed the unsupported 8.4 score and subscores from the Aurora catalog path. Removed the mismatched Aurora affiliate link from the hidden archived Dell G16 block and excluded that block from active review-card auditing. The unranked Aurora is no longer shown in the scored comparison table; its direct review card remains linked near the top of the hub.
- Updated article metadata and sitemap to September 10. Guide, ranking, retail-link, review-readiness, comparison, internal-link, sitemap, money-page, Product-schema, evidence-claim and SEO-query audits passed. Amazon audit reports 42 managed direct ASINs and 197 direct HTML links. Retail-price and budget-offer regression tests passed. The existing Amazon API eligibility blocker and stale July reference-price data are unchanged.

## MSI Raider 18 follow-up — September 10, 2026

Expanded the short RTX 5090 A2XWJG page into a specification-led review covering MSI's US configurations, display trade-offs, memory and storage paths, ports, power and portability. It explicitly separates manufacturer specifications from measurements and remains unranked.

- Rechecked B0FXHBZCK3 with Amazon US delivery ZIP 10001. It still advertised Core Ultra 9 285HX, RTX 5090, 64GB, 1TB and 4K Mini LED 120Hz, but was currently unavailable and exposed only the A2XWJG family code. MSI US factory examples do not show that exact 64GB/1TB/4K combination: do not call it an exact factory SKU or infer its upgrade history.
- B0F4PHGLW3 no longer matches the scored A2XWIG-418US RTX 5080 record. It now identifies EXCaliberPC A2XWIG-014US with 4K Mini LED 120Hz and 4TB, rather than 418US with QHD+ 240Hz and 2TB. Withheld it from the catalog, hub CTAs and score table. The exact observed amount is private in audit-site-2026-09-08/raider-retail-check-2026-09-10.json and is not published.
- Corrected the A2XWIG-418US catalog to MSI's official 64GB DDR5-5600, 2TB Gen4 and QHD+ 240Hz specification. Updated the TGP CSV/JSON to name the factory SKU and MSI US specification sheet instead of treating the changed Amazon ASIN as part of the model code.
- Updated the flagship, RTX 5090, all-laptops and AMD-vs-Intel guides so they no longer describe the Intel offer as directly buyable or exact. The comparison schema now discloses that the Intel listing was unavailable and lacks a suffix. Public pages retain Amazon links without individual prices.
- Full guide, ranking, retail-link, review-readiness, model-comparison, internal-link, sitemap, money-page, Product-schema, evidence-claim and SEO-query audits passed. Amazon audit now manages 41 ASINs and finds 195 direct HTML links; the drop is the intentionally withheld mismatched RTX 5080 listing. Retail-price and budget-offer tests passed. Amazon API eligibility remains blocked.

## ASUS ROG Strix G16 follow-up — September 10, 2026

Expanded the short G615LW RTX 5080 page into a specification-led review covering the official 175W platform, 240Hz IPS-level Nebula display, cooling design, upgrade paths, ports, battery and portability. The page explicitly distinguishes manufacturer specifications from measurements and remains unranked.

- Rechecked Amazon ASIN B0FLZC7J3B with US delivery ZIP 10001. It advertised Core Ultra 9 275HX, RTX 5080, 64GB, 1TB, the 2560x1600 240Hz display and a HyperX headset bundle, but exposed only model name G615_380W rather than a complete ASUS factory suffix. The offer was unavailable with no current seller or price. Keep the Amazon link, call it an identified retailer bundle and do not call it an exact ASUS factory SKU.
- Verified the G615LW platform against ASUS's US product, specification and support pages. Added the 150W plus 25W Dynamic Boost distinction, two DDR5-5600 SO-DIMM slots with 64GB platform maximum, two M.2 slots with the single-sided-SSD limitation, three USB-A 10Gbps ports, two Thunderbolt 5 ports and 2.5Gb Ethernet. These are official specifications, not results from a tested review unit.
- Preserved the July catalog amount strictly as a historical baseline because the price report must not be rewritten as a September observation; public buying copy no longer quotes it or uses it for current value. Removed the incorrect mini-led tag. Central model code now reads `G615_380W retailer bundle; factory suffix not exposed`; regenerated the TGP CSV/JSON and package metadata.
- Updated the RTX 5080 guide, Legion Pro 7i comparison, reviews hub and sitemap. Removed directly-buyable/exact-ASIN claims and the public historical Strix amount. The comparison now explains that the Strix was unavailable and that older figures are not live checkout prices.
- Private retail observation: audit-site-2026-09-08/strix-g16-retail-check-2026-09-10.json. Do not stage the audit directory.
- All content, link, schema, ranking, retail, price-report and dataset audits pass. The only known failure is the existing freshness audit for 27 stale July reference prices; the Strix date was not falsely refreshed. Amazon audit remains at 41 managed ASINs and 195 direct HTML Amazon links. Retail-price and budget-offer regression tests pass. Browser previews of the review and RTX 5080 guide render correctly.

## Public product-name cleanup and ASUS TUF Gaming A16 correction — September 10, 2026

User-facing editorial policy now uses normal laptop names in titles, headings, product cards, comparison labels, CTA labels and metadata. Do not expose Amazon ASINs or retailer/factory model identifiers in those presentation fields. Keep identifiers in Amazon hrefs, internal catalog records and private verification evidence where they are needed for link integrity and configuration control. Technical databases such as the RTX 50 Laptop TGP database may retain model identifiers because the identifier is part of the dataset.

- Reworked the ASUS TUF Gaming A16 review around the public product name. The page no longer displays its ASIN or retailer model code. The Amazon link remains tagged and points to the checked product page.
- The linked offer described Ryzen 9 270, RTX 5070, 64GB DDR5 and 1TB storage, with seller-installed memory that requires opening the original seal. It was unavailable during the September 10 US check, so no current price or seller is published.
- Removed the unsupported 8.4 score and legacy subscores from the TUF path. The review and hub now show N/R because there is no matching controlled test. The older RTX 5060 benchmark block is not evidence for this RTX 5070 configuration.
- Expanded the review with platform specifications, upgrade context, display and performance limits, buyer guidance and internal links. Updated the TUF A16 versus TUF F16 guide to use normal product names while preserving the configuration differences in the specification rows.
- Normalized prominent laptop names across the review and guide collection. Public ASIN wording was replaced with Amazon-link wording; exact product URLs were preserved. Added `scripts/audit-public-retail-identifiers.mjs` to prevent visible ASINs and model identifiers from returning in presentation fields.
- Corrected the reviews-hub score mismatch by marking the hidden legacy TUF card N/R instead of restoring an unsupported score. Ranked rows remain above unranked rows.
- Browser preview confirmed the TUF page renders with `ASUS TUF Gaming A16 Review`, a plain product-name row and a working Amazon CTA. All audits pass except `audit-price-freshness.mjs`, which correctly reports the unchanged 27 July reference prices as 57 days old. Retail-price and budget-offer regression tests pass.

## ASUS ROG Zephyrus G16 review, catalog consolidation and design pass — September 11, 2026

Expanded the short Zephyrus G16 page into a specification-led review and checked its desktop presentation in the Codex in-app browser. The page now leads with a normal public product name, a concise portability-versus-power summary and a six-item quick-spec grid. The key GPU/TGP, CPU, display, memory, storage, weight and battery details are visible before the product image. The content column, verdict, pros/cons, specification table and buying CTA were also visually checked. Responsive CSS was reviewed, but a separate mobile screenshot was not available; do not claim full mobile or WCAG certification. Private audit notes are in `audit-site-2026-09-08/ZEPHYRUS-G16-DESIGN-AUDIT-2026-09-11.md` and must not be staged.

- Verified the current 2025 GU605 family against ASUS US specifications: RTX 5080 up to 120W, Core Ultra 9 285H, 2560x1600 OLED 240Hz, DisplayHDR True Black 500, two M.2 slots, 90Wh battery, Thunderbolt 4, UHS-II SD and no built-in Ethernet. Removed the incorrect 1,100-nit, single-M.2, thermal, noise and battery-runtime claims. The page explicitly separates specifications from measurements and remains N/R.
- Rechecked the linked Amazon product page on September 11 with US ZIP 10001. It advertised a 32GB/2TB seller-configured Zephyrus G16 and was available through HIDevolution US. Keep the tagged Amazon link, publish no individual price, and tell readers to verify seller modifications, warranty, selected capacity and checkout terms. The separate 64GB listing was unavailable and is no longer the public purchase target.
- Removed the unsupported 9.2 G16 score and subscores from the hub/catalog path. Deleted the stale hidden benchmark fallback that mixed the Blade 14 with a different G16 generation. The public G16 card now shows N/R and the correct 120W/500-nit/two-M.2 facts.
- Removed the duplicate `asus-rog-zephyrus-g16-high` catalog record and retained `asus-rog-zephyrus-g16-2026` as the canonical RTX 5080 record. The separate RTX 5070 Ti catalog entry remains distinct. Homepage best picks now use a scored SCAR 16 instead of promoting an unranked G16. Regenerated the TGP CSV/JSON/Data Package exports and synchronized display/TGP/price-report counts.
- Normalized visible Amazon CTA labels across affected guides and reviews so they use ordinary product names instead of “exact” identifiers. `scripts/audit-public-retail-identifiers.mjs` now checks retailer CTA presentation text as well as titles, headings, cards and metadata. ASINs remain in hrefs and internal catalog fields for affiliate/link integrity; technical databases may retain exact identifiers.
- Validation: 25/26 audits pass. Only `audit-price-freshness.mjs` fails for the unchanged 24 dated July reference prices. Retail-price tests, budget-offer tests and the Amazon-link audit pass; 40 managed ASINs and 196 direct HTML Amazon links resolve without an unmanaged duplicate. Do not update the 24 dates without a real price check.
