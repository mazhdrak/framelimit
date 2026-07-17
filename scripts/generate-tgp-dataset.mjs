import fs from 'node:fs/promises';
import path from 'node:path';
import {
  CSV_EXPORT,
  JSON_EXPORT,
  ROOT,
  createCsv,
  createDatasetRows,
  createJsonDataset,
  loadLaptops
} from './tgp-dataset-lib.mjs';

async function main() {
  const rows = createDatasetRows(await loadLaptops());
  await fs.mkdir(path.join(ROOT, 'data'), { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(ROOT, JSON_EXPORT), `${JSON.stringify(createJsonDataset(rows), null, 2)}\n`, 'utf8'),
    fs.writeFile(path.join(ROOT, CSV_EXPORT), createCsv(rows), 'utf8')
  ]);
  console.log(`Generated RTX 50 TGP dataset: ${rows.length} rows in JSON and CSV.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
