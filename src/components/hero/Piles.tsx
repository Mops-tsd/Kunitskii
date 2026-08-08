'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildCity } from './cityLayout';
import { PHASE, heroState, span } from './heroState';
import { PALETTE } from '@/lib/palette';

/**
 * Свайное поле.
 *
 * Это подпись группы: в вечной мерзлоте дом начинается не с этажей,
 * а с того, что уходит вниз. Поэтому сваи забиваются на экране раньше,
 * чем появляется хоть один каркас.
 *
 * Свая сначала стоит во весь рост над площадкой и уходит в грунт
 * ударами — с паузами между ними. Пока она просто вырастала вниз,
 * смотреть было не на что: всё происходило под землёй, а после заливки
 * плиты фаза пропадала из кадра целиком.
 *
 * Подземная часть остаётся видна вполсилы. Это условность разреза, но
 * именно она показывает главное — на какую глубину уходит основание.
 */

const pileVertex = /* glsl */ `
  attribute float aDepth;
  attribute float aDelay;

  uniform float uProgress;

  varying float vDrive;   // насколько эта свая уже забита
  varying float vWorldY;  // высота точки над площадкой, в метрах

  void main() {
    float drive = clamp((uProgress - aDelay * 0.55) / 0.45, 0.0, 1.0);

    /*
     * Погружение идёт ударами: копёр бьёт, свая уходит на захватку,
     * пауза. Плавное скольжение вниз читалось как «деталь въезжает
     * в сцену», а не как работа.
     */
    float blows = 7.0;
    float step = drive * blows;
    drive = (floor(step) + smoothstep(0.0, 0.45, fract(step))) / blows;

    // Свая целиком стоит над площадкой и опускается, пока сверху
    // не останется торчать только оголовок.
    float head = 0.35;
    vec3 p = position;
    p.y = p.y * aDepth - (aDepth - head) * drive;

    vDrive = drive;

    vec4 world = instanceMatrix * vec4(p, 1.0);
    vWorldY = world.y;
    gl_Position = projectionMatrix * modelViewMatrix * world;
  }
`;

const pileFragment = /* glsl */ `
  precision mediump float;

  uniform vec3 uColor;
  uniform float uDepthFade;   // глубина, на которой свая полностью гаснет

  varying float vDrive;
  varying float vWorldY;

  void main() {
    // Ниже нуля — грунт: там свая видна вполсилы и гаснет с глубиной.
    float underground = 1.0 - smoothstep(0.0, -uDepthFade, vWorldY);
    float alpha = mix(0.22 * underground, 0.7, step(0.0, vWorldY));

    // Пока свая не тронулась, её ещё не привезли.
    alpha *= smoothstep(0.0, 0.05, vDrive);

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function Piles({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const city = useMemo(() => buildCity(count), [count]);

  /**
   * По четыре сваи на корпус, по углам его пятна застройки. Одна свая
   * на дом читалась как метка на плане, а не как свайное поле.
   */
  const piles = useMemo(
    () =>
      city.flatMap((b) => {
        const dx = b.width * 0.32;
        const dz = b.depth * 0.32;
        return [
          [-dx, -dz],
          [dx, -dz],
          [dx, dz],
          [-dx, dz],
        ].map(([ox, oz], k) => ({
          x: b.x + ox,
          z: b.z + oz,
          depth: b.pileDepth,
          // Сваи одного корпуса забиваются не разом, а по очереди.
          delay: Math.min(b.delay + k * 0.03, 1),
        }));
      }),
    [city]
  );

  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.17, 0.1, 1, 6, 1, true);
    // Низ сваи в нуле: длина задаётся масштабом, а положение — сдвигом.
    geo.translate(0, 0.5, 0);

    const depth = new Float32Array(piles.length);
    const delay = new Float32Array(piles.length);
    piles.forEach((p, i) => {
      depth[i] = p.depth;
      delay[i] = p.delay;
    });

    geo.setAttribute('aDepth', new THREE.InstancedBufferAttribute(depth, 1));
    geo.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delay, 1));
    return geo;
  }, [piles]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: pileVertex,
        fragmentShader: pileFragment,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uProgress: { value: 0 },
          uDepthFade: { value: 14 },
          uColor: { value: new THREE.Color(PALETTE.pile) },
        },
      }),
    []
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    piles.forEach((p, i) => {
      matrix.makeTranslation(p.x, 0, p.z);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
  }, [piles]);

  useFrame(() => {
    material.uniforms.uProgress.value = span(
      heroState.progress,
      PHASE.piles[0],
      PHASE.piles[1]
    );
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, piles.length]}
      renderOrder={1}
    />
  );
}
