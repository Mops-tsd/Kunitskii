/**
 * Проверяет одиночный HTML из preview/ так же, как его увидит площадка.
 *
 * Сцену на three.js модульными тестами не покроешь: важно не «какие
 * функции вызвались», а поднялся ли контекст WebGL, доехал ли прелоадер
 * до конца и не полез ли документ в сеть. Поэтому проверка — браузерная.
 *
 * Файл из preview/index.html — это внутренность body: площадка сама
 * оборачивает его в <html>/<head>/<body>. Здесь делается ровно та же
 * обёртка, иначе проверялось бы не то, что публикуется.
 *
 * Запуск: node scripts/verify-preview.mjs [--shots <каталог>]
 */
import { chromium } from 'playwright';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import os from 'node:os';

const shotsFlag = process.argv.indexOf('--shots');
const SHOTS = shotsFlag === -1 ? null : process.argv[shotsFlag + 1];
if (SHOTS) await mkdir(SHOTS, { recursive: true });

const inner = await readFile('preview/index.html', 'utf8');
const page = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head><body>${inner}</body></html>`;

/*
 * Отдаём по http, а не через file:// или srcdoc.
 * Маршрутизатор Next при запуске зовёт history.replaceState; у документа
 * без обычного адреса этот вызов запрещён, приложение молча не стартует,
 * и проверка ловила бы ограничение схемы, а не ошибку в сборке.
 */
const server = createServer((_, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(page);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  // В окружении лежит одна конкретная сборка Chromium, playwright по
  // умолчанию ищет другую версию и падает ещё до запуска.
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  // На сервере нет видеокарты: без программного растеризатора WebGL
  // не поднимется и проверка провалится на пустом месте.
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

let failures = 0;
function check(condition, message) {
  console.log(`${condition ? 'ок  ' : 'ОШИБКА'} ${message}`);
  if (!condition) failures += 1;
}

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  // Телефон — основной сценарий просмотра, поэтому он не «дополнительно»,
  // а такая же обязательная проверка.
  { name: 'mobile', width: 390, height: 844, hasTouch: true },
];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    hasTouch: Boolean(vp.hasTouch),
  });
  const p = await context.newPage();

  // Ни одного запроса наружу быть не должно: площадка их не пропустит,
  // и вместо шрифта или фото пользователь увидит пустое место.
  const external = [];
  p.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith('data:') && !u.startsWith(origin)) external.push(u.slice(0, 90));
  });

  /*
   * Ошибку компиляции шейдера на снимке не видно: объект просто пропадает
   * из кадра, а всё остальное продолжает работать. Один раз это стоило
   * долгих поисков — теперь ловится проверкой.
   */
  const shaderErrors = [];
  p.on('console', (m) => {
    if (m.text().includes('Shader Error')) shaderErrors.push(m.text().slice(0, 200));
  });

  await p.goto(origin, { waitUntil: 'domcontentloaded' });
  // Прелоадер идёт около трёх секунд; ждём с запасом на компиляцию шейдеров.
  await p.waitForTimeout(9000);

  const state = await p.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return {
      canvas: Boolean(canvas),
      size: canvas ? [canvas.width, canvas.height] : null,
      // Прелоадер держит прокрутку заблокированной, пока не доиграет.
      // Значение false означает, что запуск дошёл до конца.
      locked: document.body.dataset.locked,
      accent: getComputedStyle(document.documentElement)
        .getPropertyValue('--signal')
        .trim(),
      // Смотрим на атрибут, а не на currentSrc: фото ниже экрана стоят
      // с loading="lazy" и на момент проверки ещё не загружены, у них
      // currentSrc пустой — по нему вшитая картинка выглядела бы внешней.
      images: [...document.images].filter(
        (i) => !(i.getAttribute('src') ?? '').startsWith('data:')
      ).length,
      /*
       * Шрифт заголовков.
       *
       * Имя шрифта нигде не написано словами: вёрстка обращается к
       * переменной, а переменную объявляет класс на теге <html>. Стоит
       * этому классу потеряться при сборке — и весь сайт спокойно
       * рисуется шрифтом по умолчанию: ни ошибок, ни пустых мест,
       * просто чужая типографика. Один раз так и уехало в публикацию.
       */
      headingFont: (() => {
        const h = document.querySelector('.h-display');
        return h ? getComputedStyle(h).fontFamily : '';
      })(),
    };
  });

  console.log(`\n[${vp.name}] ${JSON.stringify(state)}`);
  check(state.canvas, 'сцена WebGL смонтирована');
  check(state.locked === 'false', 'прелоадер отработал и разблокировал прокрутку');
  check(state.images === 0, 'все фото вшиты как data-URI');
  check(external.length === 0, `внешних запросов нет (${external.slice(0, 3).join(', ')})`);
  check(shaderErrors.length === 0, `шейдеры собрались (${shaderErrors[0] ?? ''})`);
  check(
    /PT[_ ]?Sans[_ ]?Narrow/i.test(state.headingFont),
    `заголовки набраны своим шрифтом (${state.headingFont || 'не определён'})`
  );

  if (SHOTS) {
    await p.screenshot({ path: path.join(SHOTS, `${vp.name}-hero.png`) });
    for (const id of ['about', 'scale', 'recognition', 'geography', 'projects', 'contact']) {
      await p.evaluate((sel) => document.getElementById(sel)?.scrollIntoView(), id);
      await p.waitForTimeout(1600);
      await p.screenshot({ path: path.join(SHOTS, `${vp.name}-${id}.png`) });
    }
  }

  // Арабский — самый рискованный режим: вся раскладка переворачивается.
  if (vp.name === 'desktop') {
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(600);
    await p.getByRole('button', { name: 'العربية', exact: true }).first().click();
    await p.waitForTimeout(1500);
    const dir = await p.evaluate(() => document.documentElement.dir);
    check(dir === 'rtl', `арабский включает зеркальную раскладку (dir=${dir})`);
    if (SHOTS) {
      await p.evaluate(() => document.getElementById('about')?.scrollIntoView());
      await p.waitForTimeout(1600);
      await p.screenshot({ path: path.join(SHOTS, 'arabic.png') });
    }
  }

  await context.close();
}

await browser.close();
server.close();

if (SHOTS) console.log(`\nснимки: ${SHOTS}`);
console.log(failures === 0 ? '\nвсё в порядке' : `\nпровалено проверок: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
