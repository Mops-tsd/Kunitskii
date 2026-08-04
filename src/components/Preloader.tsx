'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useI18n } from '@/lib/i18n';

/**
 * Прелоадер.
 *
 * Нужен не для красоты: WebGL-сцена компилирует шейдеры и раскладывает
 * город, и без заглушки первые доли секунды пользователь видит чёрный
 * экран и решает, что сайт сломан. Заодно это первый кадр повествования —
 * линия горизонта, из которой потом вырастет всё остальное.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(0);
  const { t } = useI18n();

  useEffect(() => {
    const counter = { value: 0 };

    const timeline = gsap.timeline({
      onComplete: () => {
        onDone();
      },
    });

    timeline
      .to(counter, {
        value: 100,
        duration: 1.9,
        ease: 'power2.inOut',
        onUpdate: () => setPercent(Math.round(counter.value)),
      })
      .to('.preloader-line', { scaleX: 1, duration: 1.9, ease: 'power2.inOut' }, 0)
      // Строки уезжают вверх под маску — тот же приём, что и в заголовке героя.
      .to('.preloader-word .mask-line > span', {
        yPercent: -100,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.in',
      })
      // Шторка уезжает вверх и открывает уже отрисованную сцену.
      .to(
        rootRef.current,
        { yPercent: -100, duration: 0.9, ease: 'expo.inOut' },
        '-=0.25'
      );

    return () => {
      timeline.kill();
    };
  }, [onDone]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-void px-6 py-8 md:px-12 md:py-12"
    >
      <div className="eyebrow">TSD GROUP</div>

      <div className="preloader-word">
        <span className="mask-line h-display text-[13vw] leading-[0.9] text-chalk md:text-[8vw]">
          <span className="block">{t.preloader.line1}</span>
        </span>
        <span className="mask-line h-display text-[13vw] leading-[0.9] text-signal md:text-[8vw]">
          <span className="block">{t.preloader.line2}</span>
        </span>
      </div>

      <div className="flex items-end justify-between gap-6">
        <div
          ref={barRef}
          className="preloader-line h-px flex-1 origin-left scale-x-0 bg-signal"
        />
        <div className="font-mono text-4xl tabular-nums text-chalk md:text-6xl">
          {String(percent).padStart(3, '0')}
        </div>
      </div>
    </div>
  );
}
