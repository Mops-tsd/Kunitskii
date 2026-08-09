/**
 * Делает картинку для превью ссылки в мессенджерах.
 *
 * Главное действие на сайте — написать в мессенджер, значит и саму
 * ссылку будут пересылать там же. Без этой картинки в Telegram или
 * WhatsApp приходит голая строка адреса, и человек не понимает, что ему
 * прислали, ещё до того, как откроет.
 *
 * Картинка не рисуется отдельно, а снимается с готового первого экрана:
 * так она гарантированно совпадает с сайтом по шрифтам, цвету и сцене,
 * и не разъедется с ним при следующей правке.
 *
 * Запуск: node scripts/make-og.mjs [адрес] (по умолчанию локальная сборка)
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const OUT = 'out';
const TARGET = path.join('public', 'og.jpg');

/** Рекомендованный размер карточки: её обрезают до 1.91:1. */
const WIDTH = 1200;
const HEIGHT = 630;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const server = createServer(async (req, res) => {
  try {
    let file = path.join(OUT, decodeURIComponent(req.url.split('?')[0]));
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end('нет такого файла');
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = process.argv[2] ?? `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  // Снимаем в двойной плотности: карточку показывают и на экранах,
  // где иначе видно пиксели.
  deviceScaleFactor: 2,
});

await page.goto(origin, { waitUntil: 'domcontentloaded' });
// Ждём прелоадер, вступление и компиляцию шейдеров с запасом.
await page.waitForTimeout(11000);

// Русская версия: адрес будут пересылать прежде всего внутри страны.
await page.getByRole('button', { name: 'RU', exact: true }).first().click();
await page.waitForTimeout(2000);

// Подсказка о прокрутке в статичной картинке смотрится странно.
await page.evaluate(() => {
  document.querySelector('.hero-hint')?.remove();
});
await page.waitForTimeout(200);

await page.screenshot({ path: TARGET, type: 'jpeg', quality: 86 });
await browser.close();
server.close();

const { size } = await stat(TARGET);
console.log(`${TARGET}: ${WIDTH}×${HEIGHT}, ${(size / 1024).toFixed(0)} КБ`);
