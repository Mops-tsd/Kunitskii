/**
 * Расстановка кварталов в сцене.
 *
 * Планировка детерминированная: один и тот же seed даёт одинаковый город
 * при каждой загрузке. Случайный город каждый раз выглядел бы неряшливо,
 * а так композицию можно выверить и не бояться, что она «поедет».
 */

export interface Building {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  /** Сдвиг начала роста, 0..1 — чтобы дома поднимались волной, а не разом. */
  delay: number;
  /** Глубина сваи под этим домом. */
  pileDepth: number;
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

/**
 * Город строится кольцами вокруг центра: в середине высотная доминанта,
 * к краям застройка мельчает и разрежается — как реальный силуэт города,
 * а не равномерная сетка коробок.
 */
export function buildCity(count: number, seed = 20220630): Building[] {
  const random = makeRandom(seed);
  const buildings: Building[] = [];

  // Свободный «двор» прямо перед камерой, чтобы взгляд уходил вглубь.
  const CLEARING = 9;
  const SPREAD = 62;

  let guard = 0;
  while (buildings.length < count && guard < count * 40) {
    guard += 1;

    // Полярная раскладка даёт естественное сгущение к центру.
    const angle = random() * Math.PI * 2;
    const radial = Math.pow(random(), 0.65) * SPREAD;

    const x = Math.cos(angle) * radial;
    const z = Math.sin(angle) * radial * 0.85;

    // Не ставим дома в проходе перед камерой.
    if (Math.abs(x) < CLEARING && z > -14 && z < 26) continue;

    // Чем ближе к центру — тем выше, с заметным разбросом.
    const centrality = 1 - Math.min(radial / SPREAD, 1);
    const base = 3 + centrality * centrality * 34;
    const height = base * (0.55 + random() * 0.9);

    // Прижимаем к сетке 2 м — застройка выглядит спроектированной.
    const snap = (v: number) => Math.round(v / 2) * 2;

    buildings.push({
      x: snap(x),
      z: snap(z),
      width: 2.4 + random() * 3.6,
      depth: 2.4 + random() * 3.6,
      height,
      // Волна роста расходится от центра наружу.
      delay: Math.min(radial / SPREAD, 1) * 0.55 + random() * 0.2,
      pileDepth: 3 + centrality * 7 + random() * 2,
    });
  }

  return buildings;
}
