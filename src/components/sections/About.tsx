'use client';

import { useI18n } from '@/lib/i18n';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';

export function About() {
  const { t } = useI18n();

  return (
    <section id="about" className="relative border-t border-steel py-24 md:py-36">
      <div className="shell">
        <SectionHead index="01" label={t.about.section} title={t.about.heading} />

        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <Reveal>
              <p className="text-xl leading-snug text-chalk md:text-2xl">
                {t.about.lead}
              </p>
            </Reveal>

            <div className="mt-8 space-y-5">
              {t.about.body.map((paragraph, i) => (
                <Reveal key={i} delay={0.06 * i}>
                  <p className="leading-relaxed text-concrete">{paragraph}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="md:col-span-5">
            {/*
              Портрета пока нет — вместо «рыбы» из стока стоит рамка
              с координатами Владивостока: честнее и в стилистике чертежа.
            */}
            <Reveal delay={0.1}>
              <figure className="relative aspect-[4/5] overflow-hidden border border-steel bg-graphite">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(95,212,232,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(95,212,232,0.16) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-concrete">
                    43°07′N 131°53′E
                  </span>
                  <div>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.24em] text-signal">
                      {t.about.portraitLabel}
                    </span>
                    <span className="mt-1 block text-sm text-concrete">
                      {t.about.portraitNote}
                    </span>
                  </div>
                </div>
                {/* Уголки рамки — как метки кадрирования на чертеже */}
                {['left-3 top-3', 'right-3 top-3', 'left-3 bottom-3', 'right-3 bottom-3'].map(
                  (pos) => (
                    <span
                      key={pos}
                      className={`absolute ${pos} h-3 w-3 border border-signal opacity-60`}
                    />
                  )
                )}
              </figure>
            </Reveal>

            <Reveal delay={0.18}>
              <blockquote className="mt-8 border-s-2 border-signal ps-5">
                <p className="text-lg leading-snug text-chalk">
                  «{t.about.quotePlaceholder}»
                </p>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
