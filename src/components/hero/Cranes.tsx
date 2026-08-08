'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildCity, STOREY } from './cityLayout';
import { PHASE, heroState, span } from './heroState';
import { PALETTE } from '@/lib/palette';

/**
 * Башенные краны.
 *
 * Самая короткая дорога к тому, чтобы кадр читался как стройка, а не как
 * визуализация готового города: кран у растущего дома узнаётся мгновенно
 * и без подписи. Поэтому краны появляются вместе с каркасами и уходят,
 * когда корпуса достроены, — они отмечают именно фазу работ.
 *
 * Рисуются линиями: решётчатая мачта сплошными гранями превратилась бы
 * в столб, а вся её узнаваемость — как раз в решётке.
 */

/** Длина стрелы. */
const JIB = 26;
/** Длина противовесной консоли. */
const TAIL = 9;
/** Полусторона мачты. */
const MAST = 0.85;

/**
 * Отрезки одного крана в локальных координатах: мачта стоит в нуле,
 * стрела смотрит вдоль +X. Высота задаётся снаружи — кран всегда выше
 * дома, который строит.
 */
function craneSegments(height: number): Float32Array {
  const points: number[] = [];
  const line = (a: number[], b: number[]) => points.push(...a, ...b);

  const corners = [
    [-MAST, -MAST],
    [MAST, -MAST],
    [MAST, MAST],
    [-MAST, MAST],
  ];

  // Стойки мачты.
  for (const [x, z] of corners) line([x, 0, z], [x, height, z]);

  // Пояса и раскосы: шаг решётки примерно с этаж, чтобы мачта
  // соотносилась по масштабу с домом рядом.
  const step = STOREY;
  for (let y = 0; y <= height - step; y += step) {
    for (let i = 0; i < 4; i += 1) {
      const [x1, z1] = corners[i];
      const [x2, z2] = corners[(i + 1) % 4];
      line([x1, y, z1], [x2, y, z2]);
      // Раскосы разворачиваются на каждом ярусе — как в настоящей решётке.
      const flip = Math.floor(y / step) % 2 === 0;
      if (flip) line([x1, y, z1], [x2, y + step, z2]);
      else line([x2, y, z2], [x1, y + step, z1]);
    }
  }

  const top = height;
  const apex = height + 6;

  // Оголовок: пирамида над мачтой, к ней тянутся расчалки стрелы.
  for (const [x, z] of corners) line([x, top, z], [0, apex, 0]);

  // Стрела и противовесная консоль — нижний пояс.
  line([-TAIL, top, 0], [JIB, top, 0]);
  // Верхний пояс стрелы: от оголовка к концам, это и держит консоль.
  line([0, apex, 0], [JIB, top, 0]);
  line([0, apex, 0], [-TAIL, top, 0]);

  // Раскосы стрелы: от нижнего пояса к верхнему, который идёт
  // от оголовка к концу стрелы.
  const upperChordY = (x: number) => apex + (top - apex) * (x / JIB);
  for (let x = 3; x < JIB - 3; x += 4) {
    line([x, top, 0], [x + 4, upperChordY(x + 4), 0]);
  }

  // Противовес.
  line([-TAIL, top - 1.2, 0], [-TAIL + 2.4, top - 1.2, 0]);
  line([-TAIL, top - 1.2, 0], [-TAIL, top, 0]);
  line([-TAIL + 2.4, top - 1.2, 0], [-TAIL + 2.4, top, 0]);

  // Грузовая тележка с тросом — то, из-за чего кран выглядит работающим,
  // а не декорацией.
  const trolley = JIB * 0.62;
  line([trolley, top, 0], [trolley, top - height * 0.55, 0]);
  line([trolley - 0.8, top - height * 0.55, 0], [trolley + 0.8, top - height * 0.55, 0]);

  return new Float32Array(points);
}

interface Placement {
  x: number;
  z: number;
  height: number;
  /** Начальный разворот стрелы. */
  angle: number;
  /** Скорость поворота: краны не синхронны. */
  slew: number;
}

/**
 * Краны ставятся у самых высоких корпусов ближней застройки: у дальних
 * их не видно, а у низких они не нужны.
 */
function placeCranes(count: number): Placement[] {
  const city = buildCity(count);

  const candidates = city
    .map((b, i) => ({ b, i, radius: Math.hypot(b.x, b.z) }))
    .filter((c) => c.radius > 22 && c.radius < 95)
    .sort((a, b) => b.b.height - a.b.height);

  const chosen: Placement[] = [];
  for (const c of candidates) {
    if (chosen.length >= 5) break;
    // Краны не должны сбиваться в кучу у одной доминанты.
    if (chosen.some((p) => Math.hypot(p.x - c.b.x, p.z - c.b.z) < 34)) continue;

    chosen.push({
      // Кран стоит рядом с домом, а не внутри него.
      x: c.b.x + c.b.width * 0.5 + 5,
      z: c.b.z,
      height: c.b.height + 7,
      angle: c.i * 1.7,
      slew: 0.05 + (c.i % 5) * 0.012,
    });
  }
  return chosen;
}

export function Cranes({ count }: { count: number }) {
  const placements = useMemo(() => placeCranes(count), [count]);
  const groupRefs = useRef<Array<THREE.Object3D | null>>([]);

  const geometries = useMemo(
    () =>
      placements.map((p) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute(
          'position',
          new THREE.BufferAttribute(craneSegments(p.height), 3)
        );
        return geo;
      }),
    [placements]
  );

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(PALETTE.outline),
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    []
  );

  const time = useRef(0);

  useFrame((_, delta) => {
    const rise = span(heroState.progress, PHASE.build[0], PHASE.build[0] + 0.06);
    // Кран уходит вместе с окончанием работ: к финальному кадру над
    // готовым городом стрел уже нет.
    const done = span(heroState.progress, PHASE.build[1] - 0.18, PHASE.build[1]);
    material.opacity = rise * (1 - done) * 0.55;
    material.visible = material.opacity > 0.01;
    if (!material.visible) return;

    // Разворот идёт по времени, а не по прокрутке: кран, замирающий
    // вместе с пальцем на экране, сразу выдаёт, что это одна анимация.
    time.current += delta;
    placements.forEach((p, i) => {
      const node = groupRefs.current[i];
      if (node) node.rotation.y = p.angle + time.current * p.slew;
    });
  });

  return (
    <>
      {placements.map((p, i) => (
        <lineSegments
          key={`${p.x}-${p.z}`}
          ref={(node) => {
            groupRefs.current[i] = node;
          }}
          geometry={geometries[i]}
          material={material}
          position={[p.x, 0, p.z]}
          renderOrder={2}
          frustumCulled={false}
        />
      ))}
    </>
  );
}
