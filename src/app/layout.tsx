import type { Metadata, Viewport } from 'next';
import {
  Inter,
  PT_Sans_Narrow,
  JetBrains_Mono,
  Noto_Sans_Arabic,
} from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import ru from '@/content/ru';
import { LINKS } from '@/content/links';
import { SITE_ORIGIN, absolute } from '@/lib/site';

/*
 * Шрифт крупных заголовков.
 *
 * Был Oswald — узкий и выразительный, но кириллица у него сделана
 * по остаточному принципу: кратка над «Й» стоит очень высоко и с
 * отрывом от буквы. На кегле в сто с лишним пунктов она повисала между
 * строк и читалась как случайная галочка рядом с фамилией.
 *
 * PT Sans Narrow нарисован под кириллицу с самого начала: диакритика
 * прижата к букве, «Й» и «Ё» выглядят так, как их привыкли видеть.
 * Он чуть спокойнее Oswald по характеру — для сайта, который будут
 * читать, это скорее плюс.
 */
const display = PT_Sans_Narrow({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const arabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: ru.meta.title,
  description: ru.meta.description,
  /*
   * Карточка превью для мессенджеров.
   *
   * Главное действие на сайте — написать в мессенджер, значит и ссылку
   * будут пересылать там же. Без картинки и описания в переписку падает
   * голая строка адреса: человек не понимает, что ему прислали, ещё до
   * того, как откроет. Картинка снимается с первого экрана —
   * scripts/make-og.mjs.
   */
  openGraph: {
    type: 'profile',
    locale: 'ru_RU',
    siteName: 'Евгений Куницкий',
    title: ru.meta.title,
    description: ru.meta.description,
    url: absolute('/'),
    images: [
      {
        url: absolute('/og.jpg'),
        width: 1200,
        height: 630,
        alt: 'Евгений Куницкий — управляющий ГК «ТрансСтрой Девелопмент»',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: ru.meta.title,
    description: ru.meta.description,
    images: [absolute('/og.jpg')],
  },
};

/**
 * Разметка для поисковиков.
 *
 * Описывает страницу не словами, а данными: кто это, кем работает, где
 * компания. От этого зависит, как ссылка выглядит в выдаче и попадёт ли
 * человек в справочные карточки — при поиске по имени это первое, что
 * увидят.
 */
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Куницкий Евгений Александрович',
  alternateName: 'Евгений Куницкий',
  jobTitle: 'Управляющий группой компаний «ТрансСтрой Девелопмент»',
  url: absolute('/'),
  image: absolute('/og.jpg'),
  description: ru.meta.description,
  worksFor: {
    '@type': 'Organization',
    name: 'ГК «ТрансСтрой Девелопмент»',
    alternateName: 'TSD Group',
    url: LINKS.companySite,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Владивосток',
      addressCountry: 'RU',
      streetAddress: 'ул. Днепровская, 107, офис 4',
    },
  },
  knowsAbout: [
    'Комплексное развитие территорий',
    'Жилищное строительство в Арктической зоне',
    'Девелопмент на Дальнем Востоке',
  ],
};

export const viewport: Viewport = {
  themeColor: '#050607',
  width: 'device-width',
  initialScale: 1,
  // Сцена реагирует на жесты, зум пальцами ломал бы её — но полностью
  // запрещать масштаб нельзя, это отрезает людей со слабым зрением.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      dir="ltr"
      className={`${display.variable} ${sans.variable} ${mono.variable} ${arabic.variable}`}
    >
      <body className="bg-void text-chalk antialiased">
        <script
          type="application/ld+json"
          // Данные свои, не пользовательские: подставляется объект выше,
          // а не что-то пришедшее со стороны.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
