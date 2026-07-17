import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATASET_VERSION = '1.0.0';
export const DATASET_RELEASE_DATE = '2026-07-17';
export const DATASET_PAGE_URL = 'https://framelimit.com/guide-rtx-50-laptop-tgp-database';
export const DATASET_LICENSE_URL = 'https://framelimit.com/methodology#data-license-v1-0';
export const JSON_EXPORT = 'data/rtx-50-laptop-tgp-database.json';
export const CSV_EXPORT = 'data/rtx-50-laptop-tgp-database.csv';

const NVIDIA_POWER_RANGES = {
  'RTX 5090': '95-150',
  'RTX 5080': '80-150',
  'RTX 5070 Ti': '60-115',
  'RTX 5070': '50-100',
  'RTX 5060': '45-100'
};

export const CSV_COLUMNS = [
  'datasetVersion',
  'releaseDate',
  'id',
  'manufacturer',
  'model',
  'exactModelSku',
  'gpu',
  'gpuVram',
  'oemMaximumGpuPowerWatts',
  'nvidiaGpuSubsystemPowerRangeWatts',
  'evidenceStatus',
  'sourceUrl',
  'lastVerified'
];

export async function loadLaptops() {
  const source = await fs.readFile(path.join(ROOT, 'laptops.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'laptops.js' });
  return sandbox.window.LAPTOPS || [];
}

export function selectTgpLaptops(laptops) {
  return laptops
    .filter((laptop) => /^RTX 50/.test(laptop.gpu) && laptop.modelCode && laptop.specSource && laptop.specCheckedAt)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function evidenceStatus(laptop) {
  return laptop.tgp == null ? 'official-source-tgp-not-published' : 'official-oem-specification';
}

export function createDatasetRows(laptops) {
  return selectTgpLaptops(laptops).map((laptop) => ({
    datasetVersion: DATASET_VERSION,
    releaseDate: DATASET_RELEASE_DATE,
    id: laptop.id,
    manufacturer: laptop.brand,
    model: laptop.shortName,
    exactModelSku: laptop.modelCode,
    gpu: laptop.gpu,
    gpuVram: laptop.gpuVram,
    oemMaximumGpuPowerWatts: laptop.tgp ?? null,
    nvidiaGpuSubsystemPowerRangeWatts: NVIDIA_POWER_RANGES[laptop.gpu],
    evidenceStatus: evidenceStatus(laptop),
    sourceUrl: laptop.specSource,
    lastVerified: laptop.specCheckedAt
  }));
}

export function createJsonDataset(rows) {
  return {
    name: 'FRAMELIMIT RTX 50 Laptop TGP Database',
    version: DATASET_VERSION,
    released: DATASET_RELEASE_DATE,
    pageUrl: DATASET_PAGE_URL,
    licenseUrl: DATASET_LICENSE_URL,
    description: 'Exact-model RTX 50 laptop configurations with OEM maximum GPU power, NVIDIA subsystem-power reference ranges, evidence status, source URLs, and verification dates.',
    fieldNotes: {
      oemMaximumGpuPowerWatts: 'OEM-published maximum GPU power for the exact configuration, including Dynamic Boost when the OEM includes it. Null means the exact source does not publish a reliable value.',
      nvidiaGpuSubsystemPowerRangeWatts: 'NVIDIA reference range for the GPU tier; it is not a measurement of the laptop configuration.',
      evidenceStatus: 'official-oem-specification means the exact source publishes the power value; official-source-tgp-not-published means the configuration is sourced but its power value remains unavailable.'
    },
    records: rows
  };
}

function csvCell(value) {
  if (value == null) return '';
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function createCsv(rows) {
  const lines = [CSV_COLUMNS.join(',')];
  for (const row of rows) lines.push(CSV_COLUMNS.map((column) => csvCell(row[column])).join(','));
  return `${lines.join('\n')}\n`;
}
