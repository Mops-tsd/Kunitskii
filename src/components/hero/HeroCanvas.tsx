'use client';

import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Buildings } from './Buildings';
import { Piles } from './Piles';
import { BlueprintGrid } from './BlueprintGrid';
import { Ground } from './Ground';
import { Sky } from './Sky';
import { Cranes } from './Cranes';
import { Snow } from './Snow';
import { CameraRig } from './CameraRig';
import { heroState } from './heroState';
import { useDevice } from '@/lib/useDevice';


/**
 * 3D-сцена первого экрана.
 *
 * Бюджет сцены выбирается под устройство: на телефоне город вдвое реже,
 * снега втрое меньше и pixel ratio ограничен — иначе кадр проседает
 * именно там, где сайт будут смотреть чаще всего.
 */
export function HeroCanvas() {
  const { isMobile, isLowPower, reducedMotion, ready } = useDevice();

  const light = !ready || isMobile || isLowPower;
  const buildingCount = light ? 90 : 190;
  const snowCount = light ? 1400 : 5000;
  const maxPixelRatio = light ? 1.5 : 2;

  // Параллакс от указателя. На тач-устройствах не нужен — там нет курсора.
  useEffect(() => {
    if (isMobile || reducedMotion) return;

    const onMove = (event: PointerEvent) => {
      heroState.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      heroState.pointerY = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [isMobile, reducedMotion]);

  return (
    <Canvas
      dpr={[1, maxPixelRatio]}
      gl={{
        antialias: !light,
        powerPreference: 'high-performance',
        alpha: false,
      }}
      camera={{ fov: 62, near: 0.1, far: 700, position: [0, 1.7, 64] }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color('#050607'), 1);
        scene.fog = new THREE.Fog('#050607', 90, 320);
      }}
      // Перерисовываем постоянно: сцена анимирована каждый кадр.
      frameloop="always"
    >
      <CameraRig parallax={!isMobile && !reducedMotion} />
      <Sky />
      <BlueprintGrid />
      <Piles count={buildingCount} />
      <Ground />
      <Buildings count={buildingCount} />
      {/* Краны — только там, где есть запас производительности: пять
          решётчатых мачт это несколько тысяч отрезков. */}
      {!light && <Cranes count={buildingCount} />}
      <Snow count={snowCount} pixelRatio={maxPixelRatio} />
    </Canvas>
  );
}
