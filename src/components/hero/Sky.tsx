'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PALETTE } from '@/lib/palette';

/**
 * Задник сцены.
 *
 * На сплошной черноте силуэт города не от чего отделить: дальние дома
 * просто пропадали. Лёгкое свечение у горизонта даёт им контур и
 * добавляет кадру глубины — сразу видно, что за ближними корпусами
 * стоят ещё.
 *
 * Это не источник света, а фон: свечение слабое и держится у самой
 * линии горизонта, выше — та же пустота, что и была.
 */

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  precision mediump float;

  uniform vec3 uVoid;
  uniform vec3 uHorizon;

  varying vec3 vDir;

  void main() {
    float height = normalize(vDir).y;
    // Узкая полоса у горизонта, симметрично вверх и вниз.
    float glow = exp(-abs(height) * 2.6);
    gl_FragColor = vec4(mix(uVoid, uHorizon, glow), 1.0);
  }
`;

export function Sky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        side: THREE.BackSide,
        depthWrite: false,
        // Глубину проверяем: задник должен закрашивать только то, что
        // не закрыто сценой. Без этого он каждый кадр заливал весь экран
        // целиком, а поверх него рисовалось всё остальное.
        depthTest: true,
        // Задник не должен растворяться в собственном тумане сцены.
        fog: false,
        uniforms: {
          uVoid: { value: new THREE.Color(PALETTE.void) },
          uHorizon: { value: new THREE.Color(PALETTE.horizon) },
        },
      }),
    []
  );

  const ref = useRef<THREE.Mesh>(null);

  /*
   * Сфера едет за камерой. Стоя в нуле, она давала свечение вокруг
   * центра сцены, а не вокруг зрителя: стоило камере подняться на отлёте,
   * как её «горизонт» оказывался ниже настоящего и через весь кадр шла
   * заметная дуга.
   */
  useFrame(({ camera }) => {
    ref.current?.position.copy(camera.position);
  });

  return (
    <mesh ref={ref} material={material} renderOrder={900} frustumCulled={false}>
      <sphereGeometry args={[600, 24, 16]} />
    </mesh>
  );
}
