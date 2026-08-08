'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildCity } from './cityLayout';
import { buildingFragment, buildingVertex } from './buildingShader';
import { PHASE, heroState, span } from './heroState';
import { PALETTE } from '@/lib/palette';

export function Buildings({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const city = useMemo(() => buildCity(count), [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    // Сдвигаем куб так, чтобы его низ был в нуле — тогда дом растёт
    // от земли вверх, а не раздувается в обе стороны от центра.
    geo.translate(0, 0.5, 0);

    const dims = new Float32Array(city.length * 3);
    const delay = new Float32Array(city.length);
    const seed = new Float32Array(city.length);

    city.forEach((b, i) => {
      dims[i * 3 + 0] = b.width;
      dims[i * 3 + 1] = b.depth;
      dims[i * 3 + 2] = b.height;
      delay[i] = b.delay;
      seed[i] = i * 0.618;
    });

    geo.setAttribute('aDims', new THREE.InstancedBufferAttribute(dims, 3));
    geo.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delay, 1));
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1));
    return geo;
  }, [city]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: buildingVertex,
        fragmentShader: buildingFragment,
        transparent: true,
        depthWrite: true,
        uniforms: {
          uFrame: { value: 0 },
          uFill: { value: 0 },
          uTime: { value: 0 },
          uOutline: { value: new THREE.Color(PALETTE.outline) },
          uBody: { value: new THREE.Color(PALETTE.body) },
          uWindow: { value: new THREE.Color(PALETTE.window) },
          uFogColor: { value: new THREE.Color(PALETTE.void) },
          uFogNear: { value: 55 },
          uFogFar: { value: 165 },
        },
      }),
    []
  );

  // Позиции ставим один раз: они не меняются, меняется только высота,
  // а её считает вершинный шейдер.
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const matrix = new THREE.Matrix4();
    city.forEach((b, i) => {
      matrix.makeTranslation(b.x, 0, b.z);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    // Дома высокие и разлетаются далеко — автоматический bounding sphere
    // считается по единичному кубу и обрезал бы половину города.
    mesh.frustumCulled = false;
  }, [city]);

  useFrame((_, delta) => {
    const u = material.uniforms;
    u.uTime.value += delta;
    u.uFrame.value = span(heroState.progress, PHASE.frames[0], PHASE.frames[1]);
    u.uFill.value = span(heroState.progress, PHASE.fill[0], PHASE.fill[1]);
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, city.length]}
      renderOrder={2}
    />
  );
}
