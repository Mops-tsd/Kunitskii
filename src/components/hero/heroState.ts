/**
 * Общее состояние вступительной анимации.
 *
 * GSAP пишет сюда progress, а рендер-цикл three.js читает его в useFrame.
 * Через React-состояние это гонять нельзя: ререндер на каждый кадр съест
 * весь бюджет производительности, особенно на телефоне.
 */
export const heroState = {
  /**
   * 0 → 1, единая шкала всей сцены:
   *   0.00–0.12  пустота, проступает сетка чертежа
   *   0.12–0.30  сваи уходят в грунт
   *   0.30–0.55  поднимаются каркасы
   *   0.55–0.78  объёмы заполняются, зажигаются окна
   *   0.78–1.00  камера отъезжает, усиливается снег
   */
  progress: 0,
  /** Плавно сглаженное значение progress — им двигается камера. */
  eased: 0,
  /** Параллакс от мыши/гироскопа, диапазон примерно -1..1. */
  pointerX: 0,
  pointerY: 0,
};

/** Границы фаз — чтобы не рассыпать магические числа по компонентам. */
export const PHASE = {
  gridIn: [0.0, 0.14] as const,
  piles: [0.1, 0.32] as const,
  frames: [0.28, 0.58] as const,
  fill: [0.52, 0.8] as const,
  pullback: [0.72, 1.0] as const,
};

/** Линейная нормализация с обрезкой по краям. */
export function span(value: number, from: number, to: number): number {
  if (to === from) return value >= to ? 1 : 0;
  const t = (value - from) / (to - from);
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

export function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}
