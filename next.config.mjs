/** @type {import('next').NextConfig} */
const nextConfig = {
  // Статический экспорт — сайт кладётся на любой хостинг как набор файлов,
  // Node.js на сервере не нужен.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
