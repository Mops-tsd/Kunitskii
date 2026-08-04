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

const PATH: Keyframe[] = [
  { at: 0.0, pos: [0, 1.6, 26], look: [0, 0.5, 0], fov: 62 },
  { at: 0.22, pos: [3.5, 2.2, 20], look: [0, -2.5, -4], fov: 66 },
  { at: 0.45, pos: [-6, 9, 30], look: [0, 12, -6], fov: 58 },
  { at: 0.7, pos: [-14, 26, 48], look: [0, 14, -8], fov: 52 },
  { at: 1.0, pos: [-26, 44, 96], look: [0, 10, -10], fov: 44 },
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
