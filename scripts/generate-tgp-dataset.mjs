import fs from 'node:fs/promises';
import path from 'node:path';
import {
  CSV_EXPORT,
  CITATION_EXPORT,
  DATA_PACKAGE_EXPORT,
  JSON_EXPORT,
  ROOT,
  createCsv,
  createCitationCff,
  createDataPackage,
  createDatasetRows,
  createJsonDataset,
  loadLaptops
} from './tgp-dataset-lib.mjs';

async function main() {
  const rows = createDatasetRows(await loadLaptops());
  await fs.mkdir(path.join(ROOT, 'data'), { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(ROOT, JSON_EXPORT), `${JSON.stringify(createJsonDataset(rows), null, 2)}\n`, 'utf8'),
    fs.writeFile(path.join(ROOT, CSV_EXPORT), createCsv(rows), 'utf8'),
    fs.writeFile(path.join(ROOT, DATA_PACKAGE_EXPORT), `${JSON.stringify(createDataPackage(), null, 2)}\n`, 'utf8'),
    fs.writeFile(path.join(ROOT, CITATION_EXPORT), createCitationCff(), 'utf8')
  ]);
  console.log(`Generated RTX 50 TGP dataset: ${rows.length} rows, CSV/JSON exports, Data Package metadata, and CITATION.cff.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
