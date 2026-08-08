'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PHASE, heroState, span } from './heroState';
import { PALETTE } from '@/lib/palette';

/**
 * Сетка чертежа под городом.
 *
 * Появляется первой и задаёт правило чтения всей сцены: сначала лист,
 * потом на нём вырастает объект. Рисуется одним шейдером на плоскости —
 * это дешевле, чем настоящая сетка из тысяч линий.
 */

const gridVertex = /* glsl */ `
  varying vec2 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const gridFragment = /* glsl */ `
  precision mediump float;

  uniform float uReveal;    // радиус проявления сетки
  uniform float uTime;
  uniform float uRetire;    // 0 — чертёж на месте, 1 — сетка убрана
  uniform vec3 uMinor;
  uniform vec3 uMajor;

  varying vec2 vWorld;

  // Линия постоянной толщины независимо от угла обзора.
  float gridLine(vec2 coord, float step) {
    vec2 g = abs(fract(coord / step - 0.5) - 0.5) / fwidth(coord / step);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }

  void main() {
    float minor = gridLine(vWorld, 2.0);
    float major = gridLine(vWorld, 10.0);

    float dist = length(vWorld);

    // Сетка расходится от центра кольцом, а не включается разом.
    float reveal = 1.0 - smoothstep(uReveal - 18.0, uReveal, dist);
    // Бегущий световой обод по фронту проявления.
    float ring = exp(-pow((dist - uReveal) / 9.0, 2.0)) * 0.9;

    float fade = 1.0 - smoothstep(40.0, 230.0, dist);

    /*
     * Мелкая сетка уходит первой. С высоты отлёта шаг в два метра
     * складывается в муар, и район выглядел листом миллиметровки:
     * к финалу от чертежа остаются только крупные оси, и то вполсилы.
     */
    vec3 color = uMinor * minor * 0.5 * (1.0 - uRetire) + uMajor * major;
    float alpha =
      (minor * 0.28 * (1.0 - uRetire) + major * 0.6 * (1.0 - uRetire * 0.75)) *
        reveal * fade +
      ring * fade * 0.5;

    if (alpha < 0.004) discard;
    gl_FragColor = vec4(color + uMajor * ring, alpha);
  }
`;

export function BlueprintGrid() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: gridVertex,
        fragmentShader: gridFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uReveal: { value: 0 },
          uTime: { value: 0 },
          uRetire: { value: 0 },
          uMinor: { value: new THREE.Color(PALETTE.gridMinor) },
          uMajor: { value: new THREE.Color(PALETTE.gridMajor) },
        },
      }),
    []
  );

  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta;
    const reveal = span(heroState.progress, PHASE.gridIn[0], PHASE.gridIn[1]);
    material.uniforms.uReveal.value = reveal * 250;
    // Чертёж живёт до бетона: как только объёмы налиты, разбивочные
    // оси на площадке уже не нужны — их роль отыграна.
    const retire = span(heroState.progress, PHASE.lights[0], PHASE.lights[1]);
    material.uniforms.uRetire.value = retire;

    // Полностью убранную сетку выключаем: прозрачный слой во весь экран
    // всё равно проходит через шейдер и стоит столько же, сколько видимый.
    const mesh = ref.current;
    if (mesh) mesh.visible = retire < 0.995;
  });

  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      // Чуть выше плиты основания: после заливки сетка остаётся
      // разбивочными осями на бетоне, а не пропадает под ним.
      position={[0, 0.03, 0]}
      material={material}
      renderOrder={0}
      frustumCulled={false}
    >
      <planeGeometry args={[560, 560]} />
    </mesh>
  );
}
