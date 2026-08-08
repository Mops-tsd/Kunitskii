/**
 * Снимает экраны сайта на разных этапах прокрутки.
 *
 * Нужно, чтобы глазами проверять анимацию: 3D-сцена не покрывается
 * юнит-тестами, а «поехавшую» камеру или невидимый текст видно только
 * на картинке.
 *
 * Запуск: node scripts/shoot.mjs [url] [outDir]
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL = process.argv[2] ?? 'http://localhost:4173/';
const OUT = process.argv[3] ?? '/tmp/shots';

const VIEWPORTS = [
  { name: 'desktop', width: 1600, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
];

// Доли прокрутки героя, на которых делаем кадр.
const HERO_STOPS = [0, 0.25, 0.5, 0.75, 1];

await mkdir(OUT, { recursive: true });

// В этом окружении браузер уже установлен, но его сборка не совпадает
// с той, что ждёт свежий playwright, — поэтому путь задаётся явно.
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    hasTouch: Boolean(vp.isMobile),
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`[${vp.name}] console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => console.log(`[${vp.name}] pageerror: ${err.message}`));

  await page.goto(URL, { waitUntil: 'networkidle' });

  // Прелоадер + вступительная анимация.
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/${vp.name}-00-intro.png` });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${OUT}/${vp.name}-01-hero.png` });

  // Прокрутка внутри «липкого» героя.
  const heroHeight = await page.evaluate(
    () => document.querySelector('main > div')?.scrollHeight ?? window.innerHeight * 4
  );

  for (const stop of HERO_STOPS) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), heroHeight * stop);
    await page.waitForTimeout(1400);
    await page.screenshot({
      path: `${OUT}/${vp.name}-hero-${String(Math.round(stop * 100)).padStart(3, '0')}.png`,
    });
  }

  // Секции контента.
  const sections = ['about', 'scale', 'recognition', 'geography', 'projects', 'press', 'contact'];
  for (const id of sections) {
    await page.evaluate((sel) => {
      document.getElementById(sel)?.scrollIntoView();
    }, id);
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${OUT}/${vp.name}-${id}.png` });
  }

  await context.close();
  console.log(`${vp.name}: готово`);
}

await browser.close();
