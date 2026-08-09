/**
 * Адрес сайта.
 *
 * Нужен там, где относительной ссылки недостаточно: карточка превью для
 * мессенджеров, robots.txt и карта сайта — во всех трёх адрес должен
 * быть полным, иначе он просто не сработает.
 *
 * Здесь только origin, без пути. Подпапку, если сайт лежит не в корне,
 * добавляет absolute() — она берётся из той же переменной, что и
 * префикс путей во всей сборке.
 *
 * Домен пока не куплен, поэтому по умолчанию стоит адрес превью.
 * Как появится настоящий — задать при сборке:
 *
 *   SITE_URL=https://kunitskiy.ru npm run build
 */
export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://mops-tsd.github.io'
).replace(/\/$/, '');

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Полный адрес страницы или файла сайта. */
export function absolute(path: string): string {
  return `${SITE_ORIGIN}${BASE}${path}`;
}
