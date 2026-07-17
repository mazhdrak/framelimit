# FRAMELIMIT RTX 50 Laptop TGP Dataset

Version 1.0.0, released 2026-07-17.

This directory contains downloadable CSV and JSON exports for the
[FRAMELIMIT RTX 50 Laptop TGP Database](https://framelimit.com/guide-rtx-50-laptop-tgp-database).
The exports are generated from the repository's canonical `laptops.js` catalog.

## Files

- `rtx-50-laptop-tgp-database.csv` - flat tabular records for analysis and import.
- `rtx-50-laptop-tgp-database.json` - dataset metadata, field notes, and records.
- `../datapackage.json` - Frictionless Tabular Data Package descriptor and CSV schema.
- `../CITATION.cff` - GitHub-compatible dataset citation metadata.

## Evidence boundary

`oemMaximumGpuPowerWatts` records the maximum GPU power published by the OEM
for the exact configuration, including Dynamic Boost when the OEM includes it.
It is not a measured benchmark result. A blank CSV field or JSON `null` means
the exact source does not publish a reliable value.

`nvidiaGpuSubsystemPowerRangeWatts` is NVIDIA's reference range for the GPU
tier. It is not a measurement of the listed laptop and should not be silently
substituted for the OEM maximum value.

## Citation and license

Suggested citation:

> FRAMELIMIT. "RTX 50 Laptop TGP Database." Version 1.0.0, 2026-07-17. https://framelimit.com/guide-rtx-50-laptop-tgp-database.

Use is governed by the
[FRAMELIMIT Data License 1.0](https://framelimit.com/methodology#data-license-v1-0).
Individual facts remain attributed to the OEM source URL in each row.

## Regeneration

```bash
node scripts/generate-tgp-dataset.mjs
node scripts/audit-tgp-database.mjs
```

Do not edit the generated CSV, JSON, `datapackage.json`, or `CITATION.cff`
manually. Update `laptops.js` or the version metadata in
`scripts/tgp-dataset-lib.mjs`, regenerate, and run the audit.
