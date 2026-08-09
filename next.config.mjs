/**
 * Настройки сборки.
 *
 * BASE_PATH нужен, когда сайт лежит не в корне домена, а в подпапке —
 * так его отдаёт GitHub Pages, где адрес выглядит как
 * example.github.io/Kunitskii/. Без префикса браузер ушёл бы за
 * скриптами и стилями в корень домена и не нашёл бы ничего.
 *
 * На боевом хостинге переменная не задаётся, и сайт собирается для корня.
 */
const basePath = process.env.BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Статический экспорт — сайт кладётся на любой хостинг как набор файлов,
  // Node.js на сервере не нужен.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    // Пути к фотографиям лежат строками в текстах, а не проходят через
    // next/image, поэтому Next их сам не префиксует — подставляем вручную
    // там, где они попадают в разметку (см. src/lib/asset.ts).
    NEXT_PUBLIC_BASE_PATH: basePath,
    // Полный адрес нужен карточке превью, robots.txt и карте сайта.
    NEXT_PUBLIC_SITE_URL: process.env.SITE_URL ?? '',
  },
};

export default nextConfig;
