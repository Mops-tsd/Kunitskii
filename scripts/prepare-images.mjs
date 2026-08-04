/**
 * Приводит исходные фотографии к единому формату для сайта.
 *
 * Исходники (крупные JPEG из открытых источников) лежат в public/images,
 * скрипт ужимает их до 1600px по ширине и сохраняет в WebP —
 * иначе на мобильном интернете галерея грузится десятки секунд.
 *
 * Запуск: node scripts/prepare-images.mjs
 */
import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.join(process.cwd(), 'public', 'images');
const WIDTH = 1600;

const files = (await readdir(DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));

for (const file of files) {
  const src = path.join(DIR, file);
  const out = path.join(DIR, file.replace(/\.(jpe?g|png)$/i, '.webp'));

  const before = (await stat(src)).size;
  await sharp(src)
    .rotate()
    .resize({ width: WIDTH, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(out);
  const after = (await stat(out)).size;

  await unlink(src);
  console.log(
    `${file} → ${path.basename(out)}  ${(before / 1024 / 1024).toFixed(1)}MB → ${(after / 1024).toFixed(0)}KB`
  );
}
