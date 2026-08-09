'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useI18n } from '@/lib/i18n';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import type { Stat } from '@/content/types';

gsap.registerPlugin(ScrollTrigger);

export function Stats() {
  const { t, lang } = useI18n();

  return (
    <section id="scale" className="relative border-t border-steel py-24 md:py-36">
      <div className="shell">
        <SectionHead index="03" label={t.stats.section} title={t.stats.heading} />

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-x-10">
          {t.stats.items.map((item, i) => (
            <Counter key={item.label} stat={item} delay={i * 0.08} lang={lang} />
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="mt-14 font-mono text-[11px] uppercase tracking-[0.16em] text-concrete/70">
            {t.stats.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Counter({
  stat,
  delay,
  lang,
}: {
  stat: Stat;
  delay: number;
  lang: string;
}) {
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = valueRef.current;
    if (!el) return;

    const counter = { value: 0 };
    // Разделитель разрядов и запятая зависят от локали:
    // 2,9 млн против 2.9 million.
    const decimals = stat.decimals ?? 0;
    const format = new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : lang, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    const anim = gsap.to(counter, {
      value: stat.value,
      duration: 2,
      delay,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = format.format(counter.value);
      },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [stat.value, stat.decimals, delay, lang]);

  return (
    <Reveal delay={delay}>
      <div className="border-t border-steel pt-5">
        <div className="h-display flex items-baseline text-[10vw] leading-none text-chalk md:text-[3.6vw]">
          <span ref={valueRef} className="tabular-nums">
            0
          </span>
          <span className="text-signal">{stat.suffix}</span>
        </div>
        <p className="mt-3 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-concrete">
          {stat.label}
        </p>
      </div>
    </Reveal>
  );
}
