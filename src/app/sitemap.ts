import type { MetadataRoute } from 'next';
import { absolute } from '@/lib/site';

/**
 * Карта сайта.
 *
 * Страниц пока две: сама визитка и политика конфиденциальности.
 * Разделы внутри одностраничника отдельными адресами не считаются —
 * поисковик и так видит их текст.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absolute('/'), changeFrequency: 'monthly', priority: 1 },
    { url: absolute('/privacy/'), changeFrequency: 'yearly', priority: 0.2 },
  ];
}

/*
 * Статический экспорт: файл собирается один раз при сборке.
 * Без этого Next считает маршрут динамическим и отказывается
 * выкладывать сайт как набор файлов.
 */
export const dynamic = 'force-static';
