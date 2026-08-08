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
    float reveal = 1.0 - smoothstep(uReveal - 12.0, uReveal, dist);
    // Бегущий световой обод по фронту проявления.
    float ring = exp(-pow((dist - uReveal) / 5.0, 2.0)) * 0.9;

    float fade = 1.0 - smoothstep(20.0, 105.0, dist);

    vec3 color = uMinor * minor * 0.5 + uMajor * major;
    float alpha = (minor * 0.28 + major * 0.6) * reveal * fade + ring * fade * 0.5;

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
    material.uniforms.uReveal.value = reveal * 130;
  });

  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.02, 0]}
      material={material}
      renderOrder={0}
      frustumCulled={false}
    >
      <planeGeometry args={[300, 300]} />
    </mesh>
  );
}
