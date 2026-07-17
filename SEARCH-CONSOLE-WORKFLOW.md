# Search Console weekly workflow

1. Open **Performance → Search results** in Google Search Console.
2. Set the date to **Last 28 days** and export the Queries table as CSV.
3. Run:

   `node scripts/analyze-search-console.mjs path/to/Queries.csv --output search-opportunities.md`

4. Review queries with at least 20 impressions, average position 8–20 and CTR at or below 3%.
5. Map each selected query to the single canonical target in `seo-query-map.json` before editing content.
6. Record the current title, description, clicks, impressions, CTR and position.
7. Improve the intent match, snippet and internal links without creating a competing page for the same query.
8. Compare the same 28-day window after Google has recrawled the edited URL.

The script accepts Google CSV exports with Query/Top queries or Page/Top pages plus Clicks, Impressions, CTR and Position columns. Thresholds can be changed with `--min-impressions`, `--min-position`, `--max-position`, `--max-ctr` and `--limit`.
