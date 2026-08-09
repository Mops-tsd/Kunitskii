import type { MetadataRoute } from 'next';
import { absolute } from '@/lib/site';

/**
 * robots.txt.
 *
 * Пока сайт лежит на техническом адресе, закрывать его от поиска смысла
 * нет: он никому не мешает. Но ссылку на карту сайта поисковик должен
 * найти сразу, иначе единственную страницу он может и не заметить.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: absolute('/sitemap.xml'),
  };
}

/*
 * Статический экспорт: файл собирается один раз при сборке.
 * Без этого Next считает маршрут динамическим и отказывается
 * выкладывать сайт как набор файлов.
 */
export const dynamic = 'force-static';
