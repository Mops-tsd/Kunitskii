'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Подстройка качества под то, что реально тянет устройство.
 *
 * Бюджет сцены выбирался по признакам устройства — телефон, число ядер,
 * память. Признаки врут в обе стороны: ноутбук со встроенной графикой
 * выглядит как мощная машина, а свежий телефон — как слабая. Гадать
 * бессмысленно, поэтому смотрим на то, что важно на самом деле: сколько
 * миллисекунд занимает кадр.
 *
 * Снижается плотность пикселей — самый сильный рычаг в этой сцене:
 * она упирается в закраску, а не в количество объектов. Количество домов
 * трогать нельзя, оно вшито в геометрию при создании.
 *
 * Ступени только вниз и с паузой между ними: качество, скачущее туда-сюда,
 * заметнее низкой частоты кадров.
 */

/** Порог, после которого считаем, что устройство не справляется. */
const SLOW_FRAME_MS = 24;
/** Сколько подряд медленных кадров нужно, чтобы это не было случайностью. */
const PATIENCE = 45;

export function AdaptiveQuality({
  ceiling,
  onDowngrade,
}: {
  ceiling: number;
  onDowngrade?: (step: number) => void;
}) {
  const gl = useThree((state) => state.gl);
  const slow = useRef(0);
  const step = useRef(0);
  const warmup = useRef(0);

  useFrame((_, delta) => {
    // Первые секунды не считаем: там компиляция шейдеров и загрузка,
    // кадры заведомо длинные, и по ним нельзя судить об устройстве.
    if (warmup.current < 90) {
      warmup.current += 1;
      return;
    }
    if (step.current >= 2) return;

    const ms = delta * 1000;
    slow.current = ms > SLOW_FRAME_MS ? slow.current + 1 : Math.max(0, slow.current - 2);
    if (slow.current < PATIENCE) return;

    step.current += 1;
    slow.current = 0;

    // Две ступени вниз: сначала до примерно трёх четвертей, потом до одного.
    const ratio = step.current === 1 ? Math.min(ceiling, 1.2) : 1;
    gl.setPixelRatio(ratio);
    onDowngrade?.(step.current);
  });

  return null;
}
