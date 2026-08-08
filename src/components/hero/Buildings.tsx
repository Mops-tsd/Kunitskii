'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildCity, STOREY } from './cityLayout';
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
      seed[i] = b.seed;
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
          uBuild: { value: 0 },
          uLights: { value: 0 },
          uTime: { value: 0 },
          uStorey: { value: STOREY },
          uOutline: { value: new THREE.Color(PALETTE.outline) },
          uConcrete: { value: new THREE.Color(PALETTE.concrete) },
          uRoof: { value: new THREE.Color(PALETTE.roof) },
          uWindow: { value: new THREE.Color(PALETTE.window) },
          uFogColor: { value: new THREE.Color(PALETTE.void) },
          uFogNear: { value: 90 },
          uFogFar: { value: 340 },
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
    u.uTime.value = (u.uTime.value + delta) % 600;
    u.uBuild.value = span(heroState.progress, PHASE.build[0], PHASE.build[1]);
    u.uLights.value = span(heroState.progress, PHASE.lights[0], PHASE.lights[1]);

    /*
     * Достроенный город переводим в непрозрачный проход.
     *
     * Это самая дорогая деталь всей сцены. Прозрачные объекты рисуются
     * последними и без отсечения по глубине: с уровня улицы за каждым
     * фасадом стоит ещё десяток, и шейдер считался для всех, хотя видно
     * только ближний. В непрозрачном проходе видеокарта отбрасывает
     * закрытые пиксели до того, как считать их цвет.
     *
     * Прозрачность нужна только пока идут работы — сквозь каркас видно
     * стройку. Как только бетон везде налит, разницы в кадре нет,
     * а работы меньше в разы.
     */
    const solid = u.uBuild.value > 0.985;
    if (material.transparent === solid) {
      material.transparent = !solid;
      material.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, city.length]}
      renderOrder={2}
    />
  );
}
