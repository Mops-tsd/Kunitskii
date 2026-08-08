"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Buildings } from "./Buildings";
import { Piles } from "./Piles";
import { BlueprintGrid } from "./BlueprintGrid";
import { Ground } from "./Ground";
import { Sky } from "./Sky";
import { Cranes } from "./Cranes";
import { AdaptiveQuality } from "./AdaptiveQuality";
import { Snow } from "./Snow";
import { CameraRig } from "./CameraRig";
import { heroState } from "./heroState";
import { useDevice } from "@/lib/useDevice";

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
  const snowCount = light ? 900 : 3200;
  /*
   * Сцена упирается не в количество объектов, а в закраску пикселей:
   * плита, задник и фасады перекрывают друг друга во весь экран. Поэтому
   * плотность пикселей — самый сильный рычаг. На ретине разница между
   * 2 и 1.6 в кадре почти не видна, а работы меньше на треть.
   */
  const maxPixelRatio = light ? 1.35 : 1.6;

  /*
   * Сцена рисуется только пока первый экран в кадре.
   *
   * Дальше по странице она не видна, но цикл продолжал работать и
   * забирал кадры у скролл-анимаций в секциях — при чтении это ощущается
   * как подтормаживание всего сайта, хотя 3D там уже ни при чём.
   */
  const [onScreen, setOnScreen] = useState(true);
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = holderRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Если устройство не тянет, первым отключается то, что дороже всего
  // относительно вклада в кадр.
  const [quality, setQuality] = useState(0);
  const handleDowngrade = useCallback((step: number) => setQuality(step), []);

  // Параллакс от указателя. На тач-устройствах не нужен — там нет курсора.
  useEffect(() => {
    if (isMobile || reducedMotion) return;

    const onMove = (event: PointerEvent) => {
      heroState.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      heroState.pointerY = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [isMobile, reducedMotion]);

  return (
    <div ref={holderRef} className="absolute inset-0">
      <Canvas
        dpr={[1, maxPixelRatio]}
        gl={{
          // Сглаживание выключено везде. На сцене, где почти всё —
          // сплошные грани и линии постоянной экранной толщины, оно даёт
          // мало, а стоит дорого именно там, где и так тяжело.
          antialias: false,
          powerPreference: "high-performance",
          alpha: false,
        }}
        camera={{ fov: 62, near: 0.1, far: 700, position: [0, 1.7, 64] }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(new THREE.Color("#050607"), 1);
          scene.fog = new THREE.Fog("#050607", 90, 320);
        }}
        // Пока первый экран в кадре — рисуем каждый кадр, сцена анимирована
        // постоянно. Ушёл за экран — цикл останавливается полностью.
        frameloop={onScreen ? "always" : "never"}
      >
        <AdaptiveQuality
          ceiling={maxPixelRatio}
          onDowngrade={handleDowngrade}
        />
        <CameraRig parallax={!isMobile && !reducedMotion} />
        <Sky />
        <BlueprintGrid />
        <Piles count={buildingCount} />
        <Ground />
        <Buildings count={buildingCount} />
        {/* Краны — только там, где есть запас производительности: пять
          решётчатых мачт это несколько тысяч отрезков. Если устройство
          уже просело, они уходят первыми. */}
        {!light && quality === 0 && <Cranes count={buildingCount} />}
        <Snow count={snowCount} pixelRatio={maxPixelRatio} />
      </Canvas>
    </div>
  );
}
