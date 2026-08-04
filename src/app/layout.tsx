import type { Metadata, Viewport } from 'next';
import { Inter, Oswald, JetBrains_Mono, Noto_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import ru from '@/content/ru';

// Oswald — узкий гротеск, держит крупный заголовок и не разваливается
// на кириллице. Inter — рабочий текст. Моноширинный — для служебных меток.
const display = Oswald({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '700'],
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
