import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * Страница «адрес не найден».
 *
 * Нужна не для красоты: ссылки на сайт будут пересылать в мессенджерах,
 * а там адрес легко ломается — обрезается при переносе, склеивается с
 * соседним словом. Без этой страницы человек упирается в стандартную
 * ошибку хостинга и уходит. Здесь он видит, куда попал, и одной кнопкой
 * оказывается на сайте.
 */
export const metadata: Metadata = {
  title: 'Страница не найдена — Евгений Куницкий',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-void">
      <div className="shell">
        <div className="font-mono text-xs uppercase tracking-[0.24em] text-signal">
          404
        </div>

        <h1 className="h-display mt-6 max-w-3xl text-[12vw] text-chalk md:text-[6vw]">
          Такой страницы нет
        </h1>

        <p className="mt-6 max-w-xl leading-relaxed text-concrete">
          Возможно, адрес набран с ошибкой или ссылка обрезалась при
          пересылке. Всё содержимое сайта — на главной странице.
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-3 border border-signal/60 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal hover:text-void"
        >
          На главную
        </Link>
      </div>
    </main>
  );
}
