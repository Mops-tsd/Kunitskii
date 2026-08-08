'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { heroState } from './heroState';

/**
 * Движение камеры по сцене.
 *
 * Маршрут задан ключевыми кадрами, а не готовой кривой: так его проще
 * править по одной точке, не пересчитывая всю траекторию.
 *
 * Логика проходa:
 *   стоим у самой земли на уровне свай → поднимаемся вместе с каркасами
 *   → отъезжаем и открываем силуэт целиком.
 */

interface Keyframe {
  at: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
}

/*
 * Камера идёт по осевой улице: кварталы расставлены со сдвигом на полшага,
 * поэтому x = 0 — это проезд, и с земли взгляд уходит вдоль него вглубь
 * застройки. Числа привязаны к размеру квартала из cityLayout — если
 * менять шаг сетки, маршрут придётся пересчитать.
 */
const PATH: Keyframe[] = [
  // Стоим на осевой улице в человеческий рост.
  { at: 0.0, pos: [0, 1.7, 64], look: [0, 7, 0], fov: 62 },
  // Приседаем к земле, пока идут сваи: их видно только снизу.
  { at: 0.22, pos: [1.5, 1.1, 46], look: [0, -3, 6], fov: 68 },
  // Поднимаемся вместе с каркасами.
  { at: 0.45, pos: [-9, 24, 74], look: [0, 26, 0], fov: 58 },
  { at: 0.7, pos: [-30, 62, 120], look: [0, 30, -10], fov: 52 },
  // Отлёт: с этой высоты читается уличная сеть целиком.
  { at: 1.0, pos: [-66, 130, 224], look: [0, 16, -24], fov: 44 },
];

function sample(t: number, key: 'pos' | 'look', out: THREE.Vector3) {
  let i = 0;
  while (i < PATH.length - 2 && t > PATH[i + 1].at) i += 1;

  const a = PATH[i];
  const b = PATH[i + 1];
  const local = THREE.MathUtils.clamp((t - a.at) / (b.at - a.at), 0, 1);
  const eased = local * local * (3 - 2 * local);

  out.set(
    THREE.MathUtils.lerp(a[key][0], b[key][0], eased),
    THREE.MathUtils.lerp(a[key][1], b[key][1], eased),
    THREE.MathUtils.lerp(a[key][2], b[key][2], eased)
  );
  return THREE.MathUtils.lerp(a.fov, b.fov, eased);
}

export function CameraRig({ parallax }: { parallax: boolean }) {
  const { camera } = useThree();
  const position = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    // Сглаживаем прогресс: скролл приходит рывками, камера должна плыть.
    const k = 1 - Math.pow(0.0015, delta);
    heroState.eased += (heroState.progress - heroState.eased) * k;
    const t = heroState.eased;

    const fov = sample(t, 'pos', position.current);
    sample(t, 'look', target.current);

    if (parallax) {
      // Лёгкий отклик на мышь — сцена перестаёт быть «видео».
      position.current.x += heroState.pointerX * 3.2;
      position.current.y += heroState.pointerY * 1.8;
    }

    camera.position.copy(position.current);
    camera.lookAt(target.current);

    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
