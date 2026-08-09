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
  title: ru.meta.title,
  description: ru.meta.description,
  openGraph: {
    title: ru.meta.title,
    description: ru.meta.description,
    type: 'profile',
  },
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
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
