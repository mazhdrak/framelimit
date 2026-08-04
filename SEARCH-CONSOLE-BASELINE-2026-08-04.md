# Search Console Baseline — 4 August 2026

Source: Google Search Console Performance export downloaded 4 August 2026.
Filter: Web search, last 28 days. The daily chart covers 6 July through
2 August 2026 because of Search Console reporting lag.

## Site baseline

- Clicks: 6
- Impressions: 912
- CTR: 0.66%
- First 14 days: 104 impressions, 4 clicks
- Last 14 days: 808 impressions, 2 clicks

The Queries export exposes 171 impressions and 2 clicks. The difference from
the site totals is privacy-filtered query data and must not be interpreted as
missing traffic.

## First optimization target

Canonical URL: `https://framelimit.com/review-msi-vector-16-hx-ai`

Page baseline:

- Clicks: 0
- Impressions: 206
- CTR: 0%
- Average position: 14.42

Primary visible query baseline:

- Query: `msi vector 16 hx ai rtx 5080 () reviews`
- Clicks: 0
- Impressions: 20
- CTR: 0%
- Average position: 9.75

Related visible queries also appeared around positions 8.5–9.5, but each had
only 2–4 impressions. The page and natural-language query intent are mapped in
`seo-query-map.json`; the empty parentheses from the Search Console export are
not copied into page text.

## Change set

- Align title, H1, description and social metadata with the RTX 5080 review
  intent and exact A2XWIG-058US configuration.
- Add a concise buyer-intent answer without claiming FRAMELIMIT hands-on data.
- Strengthen three relevant inbound anchor texts.
- Update structured-data and sitemap modification dates.

## Measurement plan

Request indexing for the canonical URL after deployment. Do not make another
snippet change to this page for 14–21 days. Export the same Web / Last 28 days
Query and Page reports after recrawl, then compare clicks, impressions, CTR and
position while accounting for the rolling date window.
