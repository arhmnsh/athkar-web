import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { audioDownloadEntriesForItem } from '../src/data/audioManifest.js';
import { athkarData } from '../src/data/athkarData.js';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = join(scriptDir, '..');
const publicDir = join(projectDir, 'public');

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function download(entry) {
  const localPath = join(publicDir, entry.local.replace(/^\//, ''));
  if (await exists(localPath)) {
    return { status: 'cached', path: entry.local };
  }

  let response = null;
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      response = await fetch(entry.remote, { signal: AbortSignal.timeout(45_000) });
      if (response.ok) break;
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }

  if (!response?.ok) {
    throw lastError || new Error('Request failed');
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await mkdir(dirname(localPath), { recursive: true });
  await writeFile(localPath, bytes);
  return { status: 'downloaded', path: entry.local, bytes: bytes.length };
}

const entries = athkarData.flatMap((item) => audioDownloadEntriesForItem(item));
let downloaded = 0;
let cached = 0;

for (const entry of entries) {
  try {
    const result = await download(entry);
    if (result.status === 'cached') {
      cached += 1;
      console.log(`cached    ${result.path}`);
    } else {
      downloaded += 1;
      console.log(`download  ${result.path}`);
    }
  } catch (error) {
    console.error(`failed    ${entry.remote}`);
    console.error(`          ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

console.log(`Audio sync complete: ${downloaded} downloaded, ${cached} already present, ${entries.length} expected.`);
