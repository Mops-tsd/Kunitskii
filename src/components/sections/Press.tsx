'use client';

import { useI18n } from '@/lib/i18n';
import { asset } from '@/lib/asset';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';

export function Press() {
  const { t } = useI18n();

  return (
    <section id="press" className="relative border-t border-steel py-24 md:py-36">
      <div className="shell">
        <SectionHead
          index="09"
          label={t.press.section}
          title={t.press.heading}
          lead={t.press.lead}
        />

        <ul className="divide-y divide-steel border-y border-steel">
          {t.press.items.map((item, i) => (
            <Reveal as="li" key={`${item.event}-${item.date}`} delay={i * 0.06}>
              <div className="group grid gap-2 py-7 md:grid-cols-12 md:items-baseline md:gap-8">
                <span className="font-mono text-xs text-signal md:col-span-2">
                  {item.date}
                </span>
                <h3 className="h-display text-2xl text-chalk transition-colors group-hover:text-signal md:col-span-4">
                  {item.event}
                </h3>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-concrete md:col-span-2">
                  {item.place}
                </span>
                <p className="text-concrete md:col-span-4">{item.topic}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        {/*
          Соглашения. Здесь фотография работает как документ: на снимке
          видны и стороны, и логотипы на заднике. Текстом то же самое
          пришлось бы утверждать голословно.
        */}
        <div className="mt-20 md:mt-28">
          <Reveal>
            <h3 className="eyebrow mb-8">{t.press.agreements.heading}</h3>
          </Reveal>

          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
            {t.press.agreements.items.map((item, i) => (
              <Reveal
                as="article"
                key={item.image}
                delay={(i % 4) * 0.06}
                className="group"
              >
                <div className="overflow-hidden border border-steel bg-graphite">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(item.image)}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[3/2] w-full scale-[1.02] object-cover transition-transform duration-[900ms] ease-out group-hover:scale-100"
                  />
                </div>
                <h4 className="mt-4 h-display text-xl text-chalk">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-concrete">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
