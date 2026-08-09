/**
 * Склеивает статическую сборку в один HTML-файл.
 *
 * Нужно для превью по ссылке: площадка, где выкладывается демо, не
 * загружает внешние файлы — ни скрипты, ни шрифты, ни картинки. Поэтому
 * всё содержимое out/ вшивается прямо в разметку.
 *
 * На боевой хостинг едет обычная сборка из out/ — она грузится быстрее,
 * потому что браузер кэширует файлы по отдельности.
 *
 * Результат — два файла:
 *   preview/document.html  самодостаточный документ сайта
 *   preview/index.html     обёртка для публикации (см. ниже про iframe)
 *
 * Запуск: node scripts/build-single-file.mjs [out] [preview]
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = process.argv[2] ?? 'out';
const DIR = process.argv[3] ?? 'preview';

await mkdir(DIR, { recursive: true });

const html = await readFile(path.join(OUT, 'index.html'), 'utf8');

// --- 1. Шрифты и стили -----------------------------------------------------

async function dataUri(file, mime) {
  const buf = await readFile(file);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

const cssHref = html.match(/<link rel="stylesheet" href="([^"]+)"/)?.[1];
if (!cssHref) throw new Error('в index.html не найден файл стилей');

let css = await readFile(path.join(OUT, cssHref), 'utf8');

// Шрифты в CSS подключены ссылками — заменяем каждую на data-URI.
const fontRefs = [...new Set(css.match(/\/_next\/static\/media\/[\w.-]+\.woff2?/g) ?? [])];
for (const ref of fontRefs) {
  const mime = ref.endsWith('.woff2') ? 'font/woff2' : 'font/woff';
  css = css.replaceAll(ref, await dataUri(path.join(OUT, ref), mime));
}
console.log(`шрифтов вшито: ${fontRefs.length}`);

// --- 2. Картинки -----------------------------------------------------------

// Пути вида /images/vladivostok.webp лежат строками внутри бандла,
// поэтому подменяются простым текстовым поиском по всему коду.
const imageDir = path.join(OUT, 'images');
const imageMap = new Map();
for (const name of await readdir(imageDir)) {
  if (!/\.(webp|png|jpe?g|svg)$/i.test(name)) continue;
  const mime = name.endsWith('.webp')
    ? 'image/webp'
    : name.endsWith('.svg')
      ? 'image/svg+xml'
      : name.endsWith('.png')
        ? 'image/png'
        : 'image/jpeg';
  imageMap.set(`/images/${name}`, await dataUri(path.join(imageDir, name), mime));
}
console.log(`картинок вшито: ${imageMap.size}`);

function inlineImages(text) {
  let result = text;
  for (const [from, to] of imageMap) result = result.replaceAll(from, to);
  return result;
}

/*
 * В коде путь к каждому фото встречается по разу на язык — четыре копии.
 * Вшивать data-URI напрямую значит продублировать и сам файл: только
 * на снимках это лишние мегабайты.
 *
 * Поэтому в JS строковый литерал заменяется на имя переменной, а сами
 * данные объявляются один раз в прологе. Литерал стоит в позиции
 * значения, так что идентификатор там синтаксически допустим.
 */
const imageVars = new Map(
  [...imageMap.keys()].map((src, i) => [src, `__KIMG${i}`])
);

const imagePrelude = `<script>var ${[...imageMap]
  .map(([src, uri]) => `${imageVars.get(src)}=${JSON.stringify(uri)}`)
  .join(',')};</script>`;

/*
 * Маршрутизатор Next при запуске переписывает адрес страницы через
 * history.replaceState. В обычном окне это безобидно, но документ,
 * открытый внутри кадра (blob- или srcdoc-адрес), такого вызова не
 * допускает — браузер бросает ошибку, запуск обрывается, и страница
 * навсегда остаётся на прелоадере.
 *
 * Сайт одностраничный, история ему не нужна, поэтому в превью эти
 * вызовы оборачиваются и их отказ просто игнорируется. На боевой сборке
 * этого кода нет — там страница открывается по обычному адресу.
 */
const historyGuard = `<script>(function(){
  ['pushState','replaceState'].forEach(function(name){
    var original = history[name].bind(history);
    history[name] = function(){
      try { return original.apply(null, arguments); } catch (e) { /* кадр без своей истории */ }
    };
  });
})();</script>`;

function inlineImagesInCode(code) {
  let result = code;
  for (const [src, name] of imageVars) {
    result = result.replaceAll(`"${src}"`, name).replaceAll(`'${src}'`, name);
  }
  return result;
}

// --- 3. Скрипты ------------------------------------------------------------

const chunkDir = path.join(OUT, '_next/static/chunks');

async function collectChunks(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await collectChunks(full)));
    else if (entry.name.endsWith('.js')) found.push(full);
  }
  return found;
}

const allChunks = await collectChunks(chunkDir);
const referenced = new Set(
  [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => path.join(OUT, m[1]))
);

/**
 * Next всегда собирает и вторую точку входа — для Pages Router, даже если
 * проект её не использует. Этот файл выполняется сам и сразу лезет за
 * элементом __NEXT_DATA__, которого на странице App Router нет: падает
 * гидратация, а вместе с ней и вся сцена. К странице он отношения не
 * имеет, поэтому в одиночный документ не попадает.
 */
function isForeignEntry(file) {
  const name = path.basename(file);
  return (
    (name.startsWith('main-') && !name.startsWith('main-app-')) ||
    name.startsWith('framework-') ||
    name.startsWith('polyfills-') ||
    file.includes('/pages/') ||
    file.includes('_not-found')
  );
}

/**
 * Чанки, которые webpack догружает по требованию (у нас это сцена на
 * three.js). В разметке на них ссылок нет — их подтягивает рантайм.
 * Вшиваем их до рантайма: каждый чанк при загрузке сам регистрируется
 * как установленный, и до сетевого запроса дело не доходит.
 */
const lazyChunks = allChunks.filter(
  (file) => !referenced.has(file) && !isForeignEntry(file)
);
console.log(`отложенных чанков вшито: ${lazyChunks.length}`);

async function inlineScript(file) {
  const code = await readFile(file, 'utf8');
  return `<script>${
    inlineImagesInCode(code)
      // </script> внутри кода закрыл бы тег раньше времени.
      .replaceAll('</script', '<\\/script')
      // В библиотечном декодере UTF-8 символ «замены» стоит прямо в
      // строковом литерале. Сам по себе он корректен, но выглядит как
      // след порчи кодировки, и часть площадок такие файлы отклоняет.
      // Записываем его escape-последовательностью — для JS это то же самое.
      .replaceAll('�', '\\uFFFD')
  }</script>`;
}

const lazyBlock = (await Promise.all(lazyChunks.map(inlineScript))).join('\n');

// --- 4. Самодостаточный документ -------------------------------------------

let doc = html;

// Стили — внутрь, ссылку на файл убираем.
// Следом идёт пролог с данными фотографий: он должен выполниться
// раньше любого чанка, который на эти переменные ссылается.
doc = doc.replace(
  /<link rel="stylesheet"[^>]*>/,
  () => `<style>${css}</style>${historyGuard}${imagePrelude}`
);

// Предзагрузки указывают на файлы, которых в одиночном документе нет.
doc = doc.replace(/<link rel="preload"[^>]*>/g, '');

/*
 * React заново вставляет ссылки на стили и шрифты при гидратации — их
 * адреса лежат в служебной нагрузке страницы, а не только в разметке.
 * Файлов рядом нет, поэтому такие ссылки уводим в пустые data-URI:
 * стили уже вшиты выше, шрифты — внутрь стилей.
 */
doc = doc.replaceAll(cssHref, 'data:text/css,');
for (const ref of fontRefs) {
  doc = doc.replaceAll(ref, 'data:font/woff2;base64,');
}

// Иконку вшиваем как data-URI.
const iconMatch = doc.match(/<link rel="icon" href="([^"?]+)[^"]*"/);
if (iconMatch) {
  const iconUri = await dataUri(path.join(OUT, iconMatch[1]), 'image/svg+xml');
  doc = doc.replace(iconMatch[0], () => `<link rel="icon" href="${iconUri}"`);
}

/*
 * Порядок выполнения важнее места в разметке.
 *
 * В обычной сборке файлы бандла подключены как async: браузер выполняет
 * их после разбора страницы, когда встроенные скрипты уже записали в
 * self.__next_f данные для отрисовки. Встроенный скрипт так отложить
 * нельзя — он выполняется сразу на месте.
 *
 * Если оставить бандл там же, где стояли ссылки, приложение стартует
 * раньше своих данных, не найдёт их и не начнёт гидратацию: страница
 * останется на прелоадере навсегда. Поэтому ссылки убираются, а код
 * целиком переносится в конец body — после всех встроенных скриптов.
 */
const bundle = [];
for (const [tag, src] of [...doc.matchAll(/<script src="([^"]+)"[^>]*><\/script>/g)]) {
  const inlined = await inlineScript(path.join(OUT, src));
  // Отложенные чанки должны успеть зарегистрироваться до рантайма.
  bundle.push(src.includes('/webpack-') ? `${lazyBlock}\n${inlined}` : inlined);
  doc = doc.replace(tag, () => '');
}

// Замена обязательно функцией: в минифицированном коде попадаются
// сочетания $&, $` и $', и в строковой замене они трактуются как
// спецпоследовательности — код молча ломается.
const bundleBlock = bundle.join('\n');
doc = doc.replace('</body>', () => `${bundleBlock}</body>`);

// Во встроенной полезной нагрузке Next тоже встречаются пути к картинкам.
doc = inlineImages(doc);

await writeFile(path.join(DIR, 'document.html'), doc, 'utf8');
console.log(`документ: ${(Buffer.byteLength(doc) / 1024 / 1024).toFixed(2)} МБ`);

// --- 5. Файл для публикации ------------------------------------------------

/*
 * Площадка публикации сама оборачивает файл в <html>, <head> и <body>,
 * поэтому туда едет только внутренность body плюс стили.
 *
 * Пробовал отдавать документ целиком внутри iframe — не работает:
 * у кадра с srcdoc нет обычного адреса, маршрутизатор Next на этом молча
 * останавливается, и страница навсегда замирает на прелоадере. Через
 * blob-адрес обрывается на history.replaceState. Поэтому содержимое
 * встраивается напрямую.
 *
 * React при этом ругается на несовпадение разметки (ошибка 418): свой
 * <head> у площадки отличается от отрисованного на сборке. Предупреждение
 * восстановимое — React дорисовывает дерево заново, сцена и анимации
 * работают. На боевом хостинге этого нет: там страница отдаётся целиком.
 */
const headExtras = doc.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
const bodyInner = doc.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? '';

/*
 * Шрифты живут на теге <html>, а его площадка публикации не берёт.
 *
 * next/font не подставляет имя шрифта в правила напрямую: он объявляет
 * переменные (--font-display и остальные) в классе с рандомным именем и
 * вешает этот класс на <html>. Вся вёрстка обращается уже к переменным.
 *
 * В файле для публикации от документа остаётся только внутренность
 * body — тег <html> с классами теряется, переменные становятся пустыми,
 * и каждый заголовок молча уезжает в шрифт по умолчанию. Внешне это
 * выглядит как «сайт нарисован Times New Roman»: ошибок в консоли нет,
 * проверки проходят, а типографика — чужая.
 *
 * Поэтому объявления из этих классов переносятся в :root, где они
 * действуют независимо от того, во что обёрнут документ.
 */
const htmlClasses = (doc.match(/<html[^>]*\sclass="([^"]*)"/)?.[1] ?? '')
  .split(/\s+/)
  .filter(Boolean);

const rootDecls = htmlClasses
  .map((name) => {
    // Класс в CSS может стоять как один или в группе селекторов.
    const rule = css.match(
      new RegExp(`(?:^|[,}])[^{}]*\\.${name}\\b[^{}]*\\{([^{}]*)\\}`)
    );
    return rule?.[1]?.trim().replace(/;$/, '') ?? '';
  })
  .filter(Boolean)
  // Точка с запятой обязательна: в сжатом CSS последнее объявление в
  // правиле идёт без неё, и склеенные подряд они читаются браузером
  // как одно испорченное — переменные молча пропадают.
  .join(';');

if (htmlClasses.length && !rootDecls) {
  throw new Error(
    'классы <html> есть, но их объявления не нашлись в CSS — шрифты потеряются'
  );
}

/*
 * Заодно повторяем то, что на боевой сборке даёт класс на <body>:
 * фон, цвет текста и сглаживание. Оборачивать содержимое в <div>
 * с теми же классами нельзя — React восстанавливает разметку от
 * корня документа и лишний узел ему мешает.
 */
const rootStyle = rootDecls
  ? `<style>:root{${rootDecls}}
body{background:var(--void);color:var(--chalk);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}</style>`
  : '';

// Из head забираем только то, что влияет на отрисовку: стили и прологи.
const keptHead = [
  ...(headExtras.match(/<style>[\s\S]*?<\/style>/g) ?? []),
  ...(headExtras.match(/<script>[\s\S]*?<\/script>/g) ?? []),
].join('\n');

const title = doc.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'Евгений Куницкий';

const flat = `<title>${title}</title>
${keptHead}
${rootStyle}
${bodyInner}`;

await writeFile(path.join(DIR, 'index.html'), flat, 'utf8');
console.log(
  `для публикации: ${DIR}/index.html, ${(Buffer.byteLength(flat) / 1024 / 1024).toFixed(2)} МБ`
);
