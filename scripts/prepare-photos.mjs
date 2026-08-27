/**
 * Готовит присланные фотографии к публикации.
 *
 * Исходники приходят с телефона: по 2–3 мегапикселя и по полмегабайта
 * каждый. Класть их на сайт как есть нельзя — на мобильном интернете
 * страница будет грузиться минуту. Здесь они кадрируются под нужную
 * пропорцию, ужимаются в WebP и получают осмысленные имена.
 *
 * Исходники после обработки удаляются из public/: в сборку должно
 * попадать только то, что реально показывается.
 *
 * Запуск: node scripts/prepare-photos.mjs
 */
import sharp from 'sharp';
import { rm, readdir } from 'node:fs/promises';
import path from 'node:path';

const DIR = 'public/images';

/*
 * Что во что превращается.
 *
 * crop — область исходника в его собственных пикселях. Кадрирую руками,
 * а не по «умному» алгоритму: автокадрирование режет по контрасту и
 * регулярно отрезает макушку.
 */
const JOBS = [
  {
    from: 'photo_2026-08-08 13.36.06.jpeg',
    to: 'kunitskiy-portrait.webp',
    crop: { left: 320, top: 940, width: 720, height: 900 },
    width: 1200,
    quality: 86,
  },
  {
    from: 'photo_2026-08-08 13.35.47.jpeg',
    to: 'vef-2025-rbc.webp',
    width: 1400,
  },
  {
    from: 'photo_2026-08-08 13.35.57.jpeg',
    to: 'vef-2025-rg.webp',
    width: 1400,
  },
  {
    from: 'photo_2026-08-08 13.36.00.jpeg',
    to: 'sber-agreement.webp',
    width: 1600,
  },
  {
    from: 'photo_2026-08-08 13.36.09.jpeg',
    to: 'sber-signing.webp',
    width: 1600,
  },
  {
    from: 'photo_2026-08-08 13.35.50.jpeg',
    to: 'spief-2024.webp',
    width: 1600,
  },
  {
    from: 'photo_2026-08-08 13.35.55.jpeg',
    to: 'spief-2024-press.webp',
    width: 1400,
  },
  {
    from: 'photo_2026-08-08 13.36.16.jpeg',
    to: 'murmansk-agreement.webp',
    width: 1600,
  },
  {
    from: 'photo_2026-08-08 13.36.21.jpeg',
    to: 'krdv-award.webp',
    width: 1400,
  },
  {
    from: 'photo_2026-08-08 13.36.02.jpeg',
    to: 'vef-2025-khabarovsk.webp',
    width: 1600,
  },
];

let saved = 0;
for (const job of JOBS) {
  const src = path.join(DIR, job.from);
  let pipeline = sharp(src).rotate();
  if (job.crop) pipeline = pipeline.extract(job.crop);

  const info = await pipeline
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: job.quality ?? 82 })
    .toFile(path.join(DIR, job.to));

  console.log(
    `${job.to} — ${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)} КБ`
  );
  saved += info.size;
}

// Исходники в сборке не нужны: они тяжелее готовых в разы.
for (const name of await readdir(DIR)) {
  if (name.startsWith('photo_')) await rm(path.join(DIR, name));
}

console.log(`\nготово, ${JOBS.length} файлов, ${(saved / 1024 / 1024).toFixed(2)} МБ`);
