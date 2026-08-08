'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { heroState } from './heroState';
import { useI18n } from '@/lib/i18n';
import { useDevice } from '@/lib/useDevice';

gsap.registerPlugin(ScrollTrigger);

// Three.js весит больше всего остального сайта вместе взятого.
// Грузим его отдельным чанком, пока на экране висит прелоадер, —
// иначе первый байт разметки ждёт полной загрузки 3D-движка.
const HeroCanvas = dynamic(
  () => import('./HeroCanvas').then((m) => m.HeroCanvas),
  { ssr: false }
);

/** На какой отметке заканчивается автопрокрутка вступления. */
const INTRO_END = 0.3;

export function Hero({ started }: { started: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [introDone, setIntroDone] = useState(false);
  const introTween = useRef<gsap.core.Tween | null>(null);
  const { t } = useI18n();
  const { reducedMotion, ready } = useDevice();

  // Прячем строки заголовка до первой отрисовки.
  //
  // Именно через gsap.set, а не CSS-классом: GSAP считывает уже стоящий
  // на элементе transform как базовое смещение и анимирует yPercent
  // поверх него — в сумме строка так и остаётся опущенной на свою высоту.
  useLayoutEffect(() => {
    gsap.set('.hero-name .mask-line > span', { yPercent: 100 });
  }, []);

  // --- Фаза 1: вступление играет само, страница заблокирована.
  useEffect(() => {
    if (!started || !ready) return;

    if (reducedMotion) {
      // Пользователь просил меньше движения — показываем финальный кадр.
      heroState.progress = INTRO_END;
      heroState.eased = INTRO_END;
      setIntroDone(true);
      return;
    }

    document.body.dataset.locked = 'true';

    introTween.current = gsap.to(heroState, {
      progress: INTRO_END,
      duration: 4.6,
      ease: 'power1.inOut',
      onComplete: () => setIntroDone(true),
    });

    return () => {
      introTween.current?.kill();
    };
  }, [started, ready, reducedMotion]);

  // --- Фаза 2: управление отдаётся скроллу.
  useEffect(() => {
    if (!introDone) return;

    document.body.dataset.locked = 'false';

    const trigger = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        heroState.progress = INTRO_END + self.progress * (1 - INTRO_END);
      },
    });

    // Заголовок уезжает, пока камера отъезжает от города.
    const textFade = gsap.to(textRef.current, {
      opacity: 0,
      yPercent: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapRef.current,
        start: 'top top',
        end: '35% top',
        scrub: true,
      },
    });

    return () => {
      trigger.kill();
      textFade.scrollTrigger?.kill();
      textFade.kill();
    };
  }, [introDone]);

  // --- Появление заголовка синхронно с окончанием вступления.
  useEffect(() => {
    if (!started || !ready) return;

    const delay = reducedMotion ? 0 : 3.1;
    const timeline = gsap.timeline({ delay });

    timeline
      .to('.hero-role', { opacity: 1, duration: 0.8, ease: 'power2.out' })
      // Двигать нужно внутреннюю строку, а не саму маску:
      // маска — это рамка с overflow:hidden, из-под неё и выезжает текст.
      .to(
        '.hero-name .mask-line > span',
        { yPercent: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out' },
        '-=0.5'
      )
      .to(
        '.hero-tag',
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out' },
        '-=0.6'
      )
      .to('.hero-hint', { opacity: 1, duration: 0.6 }, '-=0.3');

    return () => {
      timeline.kill();
    };
  }, [started, ready, reducedMotion]);

  const skipIntro = () => {
    introTween.current?.progress(1);
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      style={{ height: 'var(--hero-scroll)' }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Слой 1 — 3D-сцена */}
        <div className="absolute inset-0">{started && <HeroCanvas />}</div>

        {/* Слой 2 — виньетка, чтобы текст читался поверх города */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 45%, transparent 35%, rgba(5,6,7,0.55) 78%, rgba(5,6,7,0.92) 100%)',
          }}
        />

        {/* Слой 3 — типографика */}
        <div
          ref={textRef}
          className="pointer-events-none absolute inset-0 flex flex-col justify-end pb-28 md:justify-center md:pb-0"
        >
          <div className="shell">
            <p className="hero-role eyebrow mb-4 opacity-0 md:mb-6">
              {t.hero.role}
            </p>

            <h1 className="hero-name h-display text-chalk">
              <span className="mask-line text-[15vw] leading-[0.86] md:text-[9.5vw]">
                <span className="block">{t.hero.name}</span>
              </span>
              <span className="mask-line text-[15vw] leading-[0.86] md:text-[9.5vw]">
                <span className="block text-signalMuted">{t.hero.surname}</span>
              </span>
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 md:mt-10">
              {t.hero.tagline.map((word) => (
                <span
                  key={word}
                  className="hero-tag translate-y-3 font-mono text-xs uppercase tracking-[0.22em] text-concrete opacity-0"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Слой 4 — подсказка о скролле */}
        <div className="hero-hint pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0">
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-concrete">
              {t.hero.scrollHint}
            </span>
            <span className="block h-10 w-px animate-pulse bg-gradient-to-b from-signal to-transparent" />
          </div>
        </div>

        {/* Кнопка пропуска — только пока играет вступление */}
        {started && !introDone && !reducedMotion && (
          <button
            type="button"
            onClick={skipIntro}
            className="absolute bottom-6 right-6 z-10 font-mono text-[10px] uppercase tracking-[0.25em] text-concrete transition-colors hover:text-signal md:bottom-10 md:right-12"
          >
            {t.hero.skip} →
          </button>
        )}
      </div>
    </div>
  );
}
