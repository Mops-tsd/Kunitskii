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
 */

const pileVertex = /* glsl */ `
  attribute float aDepth;
  attribute float aDelay;

  uniform float uProgress;

  varying float vAlong;   // 0 у поверхности, 1 на острие сваи
  varying float vDrive;   // насколько эта свая уже забита

  void main() {
    float drive = clamp((uProgress - aDelay * 0.5) / 0.5, 0.0, 1.0);
    drive = drive * drive * (3.0 - 2.0 * drive);

    vec3 p = position;
    p.y *= aDepth * drive;

    vAlong = -position.y;
    vDrive = drive;

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.0);
  }
`;

const pileFragment = /* glsl */ `
  precision mediump float;

  uniform vec3 uColor;
  varying float vAlong;
  varying float vDrive;

  void main() {
    // Свеча гаснет к острию — свая уходит во тьму грунта.
    float fade = 1.0 - smoothstep(0.1, 1.0, vAlong);
    float alpha = fade * vDrive * 0.9;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor * (0.5 + fade), alpha);
  }
`;

export function Piles({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const city = useMemo(() => buildCity(count), [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.16, 0.09, 1, 6, 1, true);
    // Верх сваи — на уровне земли, тело уходит вниз.
    geo.translate(0, -0.5, 0);

    const depth = new Float32Array(city.length);
    const delay = new Float32Array(city.length);
    city.forEach((b, i) => {
      depth[i] = b.pileDepth;
      delay[i] = b.delay;
    });

    geo.setAttribute('aDepth', new THREE.InstancedBufferAttribute(depth, 1));
    geo.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delay, 1));
    return geo;
  }, [city]);

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
          uColor: { value: new THREE.Color(PALETTE.pile) },
        },
      }),
    []
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    city.forEach((b, i) => {
      matrix.makeTranslation(b.x, 0, b.z);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
  }, [city]);

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
      args={[geometry, material, city.length]}
      renderOrder={1}
    />
  );
}
