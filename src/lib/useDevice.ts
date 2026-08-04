'use client';

import { useEffect, useState } from 'react';

export interface DeviceProfile {
  /** Узкий экран — упрощаем 3D и убираем часть эффектов. */
  isMobile: boolean;
  /** Пользователь просил систему уменьшить анимацию. */
  reducedMotion: boolean;
  /** Слабое железо: мало ядер или мало памяти. */
  isLowPower: boolean;
  /** Профиль уже посчитан на клиенте (до этого рендерим консервативно). */
  ready: boolean;
}

/**
 * Определяет, насколько тяжёлую сцену можно позволить.
 *
 * Сайт смотрят в основном с телефонов, поэтому по умолчанию (до замера)
 * считаем устройство слабым и включаем облегчённый режим.
 */
export function useDevice(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>({
    isMobile: true,
    reducedMotion: false,
    isLowPower: true,
    ready: false,
  });

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const widthQuery = window.matchMedia('(max-width: 900px)');

    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 4;
    const lowPower = cores <= 4 || memory <= 4;

    const update = () =>
      setProfile({
        isMobile: widthQuery.matches,
        reducedMotion: motionQuery.matches,
        isLowPower: lowPower,
        ready: true,
      });

    update();
    motionQuery.addEventListener('change', update);
    widthQuery.addEventListener('change', update);
    return () => {
      motionQuery.removeEventListener('change', update);
      widthQuery.removeEventListener('change', update);
    };
  }, []);

  return profile;
}
