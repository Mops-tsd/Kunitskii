/**
 * Планировка квартала в сцене.
 *
 * Раскладка детерминированная: один и тот же seed даёт одинаковый город
 * при каждой загрузке. Случайный город каждый раз выглядел бы неряшливо,
 * а так композицию можно выверить и не бояться, что она «поедет».
 *
 * Дома ставятся не россыпью, а по уличной сетке: кварталы одинакового
 * шага, между ними проезды, внутри квартала — секции одной высоты.
 * Россыпь читается как абстракция, сетка — как город, который кто-то
 * спроектировал. Это и есть предмет работы, поэтому планировка здесь
 * важнее любых эффектов.
 */

/** Высота этажа. Из неё считается всё: и объём дома, и сетка окон. */
export const STOREY = 3.1;

export interface Building {
  x: number;
  z: number;
  width: number;
  depth: number;
  /** Кратна высоте этажа — иначе верхний ряд окон обрежется наполовину. */
  height: number;
  storeys: number;
  /** Сдвиг начала роста, 0..1 — чтобы дома поднимались волной, а не разом. */
  delay: number;
  /** Глубина сваи под этим домом. */
  pileDepth: number;
  /** Личное зерно для раскладки окон. */
  seed: number;
}

/** Генератор псевдослучайных чисел (mulberry32) — быстрый и воспроизводимый. */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Сторона квартала. */
const BLOCK = 26;
/** Ширина проезда между кварталами. */
export const STREET = 11;
/** Шаг уличной сетки. */
export const PITCH = BLOCK + STREET;
/** Сколько кварталов в каждую сторону от центра. */
const REACH = 5;
/** Разрыв между секциями внутри квартала. */
const GAP = 4;
/**
 * Насколько центральная улица шире рядовой — по половине с каждой стороны.
 *
 * Камера идёт по этой оси. На рядовом проезде в одиннадцать метров она
 * оказывалась в колодце между двумя стенами: масштаб застройки при этом
 * не читался вообще, а именно он здесь и нужен показать.
 */
export const AVENUE = 16;

/**
 * Кварталы стоят со сдвигом на полшага, поэтому оси x = 0 и z = 0 —
 * это улицы, а не застройка. Камера стартует на осевом проспекте и
 * смотрит вдоль него: взгляд уходит вглубь сам, без искусственной
 * прогалины в застройке.
 */
function blockCenters(): Array<{ x: number; z: number; i: number; j: number }> {
  const centers = [];
  for (let i = -REACH; i < REACH; i += 1) {
    for (let j = -REACH; j < REACH; j += 1) {
      // Сдвиг наружу одинаков для всех колонок, поэтому расширяется
      // только центральная улица — шаг остальных остаётся прежним.
      const raw = (i + 0.5) * PITCH;
      centers.push({ x: raw + Math.sign(raw) * AVENUE, z: (j + 0.5) * PITCH, i, j });
    }
  }
  // Ближние кварталы застраиваются первыми: если домов на всё не хватит,
  // дырки окажутся у горизонта, где их прячет туман.
  centers.sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z));
  return centers;
}

const MAX_RADIUS = REACH * PITCH + AVENUE;

export function buildCity(count: number, seed = 20220630): Building[] {
  const random = makeRandom(seed);
  const buildings: Building[] = [];

  for (const block of blockCenters()) {
    if (buildings.length >= count) break;

    const radius = Math.hypot(block.x, block.z);
    const centrality = 1 - Math.min(radius / MAX_RADIUS, 1);

    /*
     * Этажность падает от центра к окраине — обычный профиль города.
     * Считаем именно этажи, а не метры: высота получается кратной этажу,
     * и верхний ряд окон не обрезается посередине.
     */
    const blockStoreys = Math.round(
      4 + Math.pow(centrality, 1.7) * 19 + random() * 4
    );

    // Длинная сторона квартала чередуется — застройка выглядит разбитой
    // на кварталы, а не одинаковыми рядами до горизонта.
    const alongX = (block.i + block.j) % 2 === 0;

    // Высокие секции шире и их меньше: башня шириной в три метра —
    // первое, по чему видно, что город ненастоящий.
    const sections = blockStoreys > 16 ? 1 : blockStoreys > 9 ? 2 : 2 + Math.round(random());
    const runLength = (BLOCK - GAP * (sections - 1)) / sections;

    // Глубина корпуса жилого дома — 13–17 м, дальше не пробивается свет.
    const depth = 13 + random() * 4;
    // Поперечный сдвиг всей секции внутри квартала: фронт улицы
    // получается неровным, как в реальной застройке разных лет.
    const shift = (random() - 0.5) * (BLOCK - depth);

    for (let k = 0; k < sections && buildings.length < count; k += 1) {
      const offset = -BLOCK / 2 + runLength / 2 + k * (runLength + GAP);
      const length = runLength * (0.86 + random() * 0.14);

      // Секции одного квартала различаются на этаж-другой, а не вдвое:
      // так это читается как один комплекс, а не случайные соседи.
      const storeys = Math.max(3, blockStoreys + Math.round((random() - 0.5) * 3));

      buildings.push({
        x: block.x + (alongX ? offset : shift),
        z: block.z + (alongX ? shift : offset),
        width: alongX ? length : depth,
        depth: alongX ? depth : length,
        storeys,
        height: storeys * STOREY,
        // Волна роста расходится от центра наружу.
        delay: Math.min(radius / MAX_RADIUS, 1) * 0.55 + random() * 0.18,
        pileDepth: 5 + centrality * 8 + random() * 3,
        seed: (buildings.length * 0.6180339887) % 1,
      });
    }
  }

  return buildings;
}
