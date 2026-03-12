/**
 * Downloads all images listed in content/image-manifest.json to public/images/.
 *
 * Usage:
 *   node scripts/download-images.mjs [options]
 *
 * Options:
 *   --force     Re-download even if file already exists
 *   --dry-run   Print what would be downloaded without fetching
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as https from 'node:https';
import * as http from 'node:http';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');

const MANIFEST_PATH = path.join(ROOT, 'content', 'image-manifest.json');
const OUT_DIR = path.join(ROOT, 'public', 'images');

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`Manifest not found: ${MANIFEST_PATH}`);
  console.error('Run  node scripts/convert-xml.mjs  first.');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const entries = Object.values(manifest);

console.log(`${entries.length} images in manifest → ${OUT_DIR}\n`);

// ─── Download ────────────────────────────────────────────────────────────────
function fetchToFile(url, dest, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { timeout: 30_000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirectsLeft === 0) return reject(new Error('Too many redirects'));
        res.resume();
        return fetchToFile(res.headers.location, dest, redirectsLeft - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const tmp = dest + '.part';
      const file = fs.createWriteStream(tmp);
      res.pipe(file);
      file.on('finish', () => file.close(() => { fs.renameSync(tmp, dest); resolve(); }));
      file.on('error', (err) => { fs.unlink(tmp, () => {}); reject(err); });
    }).on('error', reject).on('timeout', function () { this.destroy(); reject(new Error('Timeout')); });
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────
let ok = 0, skipped = 0;
const failures = [];

for (const [i, entry] of entries.entries()) {
  const dest = path.join(OUT_DIR, entry.filename);
  const label = `[${String(i + 1).padStart(3)}/${entries.length}] ${entry.filename}`;

  if (!FORCE && fs.existsSync(dest)) {
    console.log(`  skip  ${label}`);
    skipped++;
    continue;
  }

  if (DRY_RUN) {
    console.log(`  fetch ${label}`);
    ok++;
    continue;
  }

  process.stdout.write(`  fetch ${label} … `);
  try {
    await fetchToFile(entry.downloadUrl, dest);
    console.log('ok');
    ok++;
  } catch (err) {
    console.log(`FAILED (${err.message})`);
    failures.push({ filename: entry.filename, url: entry.downloadUrl, error: err.message });
  }
}

console.log(`\nDone: ${ok} fetched, ${skipped} skipped, ${failures.length} failed.`);

if (failures.length > 0) {
  const reportPath = path.join(ROOT, 'content', 'image-download-failures.json');
  fs.writeFileSync(reportPath, JSON.stringify(failures, null, 2), 'utf8');
  console.log(`Failures written to content/image-download-failures.json`);
  process.exit(1);
}
