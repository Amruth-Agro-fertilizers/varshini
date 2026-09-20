/**
 * Generates WebP siblings for every source image in public/assets.
 *
 * Next's <Image> optimizer only covers DOM images; WebGL textures are fetched
 * raw, so the 2.4 MB source PNGs would be downloaded verbatim by three.js.
 * These WebP copies are what the R3F layer loads.
 *
 * Run: npm run assets:optimize
 */
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = path.resolve('public/assets');
const OUT = path.resolve('public/opt');
const SOURCE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);
/**
 * No downscale. The source photography is 1672px wide, so any cap would only
 * throw away detail we cannot get back. Raise this only if true 4K sources
 * (3840px) are supplied later.
 */
const MAX_WIDTH = 3840;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let converted = 0;
let bytesIn = 0;
let bytesOut = 0;

for await (const file of walk(SRC)) {
  const ext = path.extname(file).toLowerCase();
  if (!SOURCE_EXT.has(ext)) continue;

  const rel = path.relative(SRC, file);
  const dest = path.join(OUT, rel.replace(/\.[^.]+$/, '.webp'));
  await mkdir(path.dirname(dest), { recursive: true });

  await sharp(file)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 92, effort: 6 })
    .toFile(dest);

  bytesIn += (await stat(file)).size;
  bytesOut += (await stat(dest)).size;
  converted += 1;
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(
  `${converted} images: ${mb(bytesIn)} MB -> ${mb(bytesOut)} MB ` +
    `(${Math.round((1 - bytesOut / bytesIn) * 100)}% smaller)`,
);
