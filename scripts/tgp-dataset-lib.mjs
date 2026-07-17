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
export const DATA_PACKAGE_EXPORT = 'datapackage.json';
export const CITATION_EXPORT = 'CITATION.cff';

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

export function createDataPackage() {
  return {
    profile: 'tabular-data-package',
    name: 'framelimit-rtx-50-laptop-tgp-database',
    title: 'FRAMELIMIT RTX 50 Laptop TGP Database',
    description: 'Exact-model RTX 50 laptop configurations with OEM maximum GPU power, NVIDIA subsystem-power reference ranges, evidence status, source URLs, and verification dates.',
    version: DATASET_VERSION,
    created: DATASET_RELEASE_DATE,
    homepage: DATASET_PAGE_URL,
    licenses: [{ path: DATASET_LICENSE_URL, title: 'FRAMELIMIT Data License 1.0' }],
    contributors: [{ title: 'Rumen Mazhdrakov', role: 'author' }],
    sources: [
      { title: 'FRAMELIMIT canonical laptop catalog', path: 'laptops.js' },
      { title: 'NVIDIA RTX 50 Series laptop specifications', path: 'https://www.nvidia.com/en-us/geforce/laptops/50-series/' }
    ],
    resources: [
      {
        name: 'rtx-50-laptop-tgp-csv',
        title: 'RTX 50 laptop TGP records (CSV)',
        path: CSV_EXPORT,
        format: 'csv',
        mediatype: 'text/csv',
        schema: {
          fields: [
            { name: 'datasetVersion', type: 'string' },
            { name: 'releaseDate', type: 'date' },
            { name: 'id', type: 'string' },
            { name: 'manufacturer', type: 'string' },
            { name: 'model', type: 'string' },
            { name: 'exactModelSku', type: 'string' },
            { name: 'gpu', type: 'string' },
            { name: 'gpuVram', type: 'string' },
            { name: 'oemMaximumGpuPowerWatts', type: 'integer' },
            { name: 'nvidiaGpuSubsystemPowerRangeWatts', type: 'string' },
            { name: 'evidenceStatus', type: 'string' },
            { name: 'sourceUrl', type: 'string', format: 'uri' },
            { name: 'lastVerified', type: 'date' }
          ],
          missingValues: ['']
        }
      },
      {
        name: 'rtx-50-laptop-tgp-json',
        title: 'RTX 50 laptop TGP records and metadata (JSON)',
        path: JSON_EXPORT,
        format: 'json',
        mediatype: 'application/json'
      }
    ]
  };
}

export function createCitationCff() {
  return `cff-version: 1.2.0
message: "If you use this dataset, cite FRAMELIMIT and the linked OEM source for each specification."
type: dataset
title: "FRAMELIMIT RTX 50 Laptop TGP Database"
authors:
  - family-names: "Mazhdrakov"
    given-names: "Rumen"
version: ${DATASET_VERSION}
date-released: ${DATASET_RELEASE_DATE}
url: "${DATASET_PAGE_URL}"
repository-code: "https://github.com/mazhdrak/framelimit"
abstract: "Exact-model RTX 50 laptop configurations with sourced OEM maximum GPU power, evidence status, source URLs, and verification dates."
keywords:
  - RTX 50 laptop
  - laptop TGP
  - gaming laptop
  - GPU power
`;
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
