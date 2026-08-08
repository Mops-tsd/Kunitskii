/**
 * Путь к файлу из public/ с учётом того, где лежит сайт.
 *
 * Пути к фотографиям хранятся в текстах (src/content) обычными строками
 * вида /images/murmansk.webp. Next префиксует за нас только то, что идёт
 * через next/image и статические импорты, — а здесь обычный <img>,
 * поэтому в подпапке (превью на GitHub Pages) картинки просто не
 * находились бы.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function asset(path: string): string {
  if (!path) return path;
  // Data-URI и внешние ссылки трогать нельзя.
  if (!path.startsWith('/')) return path;
  return `${BASE}${path}`;
}
