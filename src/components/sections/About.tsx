'use client';

import { useI18n } from '@/lib/i18n';
import { asset } from '@/lib/asset';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { PORTRAIT } from '@/content/links';

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
            <Reveal delay={0.1}>
              <figure className="relative aspect-[4/5] overflow-hidden border border-steel bg-graphite">
                {/*
                  Обычный <img>: сборка статическая, сервера оптимизации
                  картинок под ней нет, файл уже ужат на этапе сборки.
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(PORTRAIT)}
                  alt={t.about.portraitNote}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                {/*
                  Затемнение только у нижней кромки — под подпись.
                  По лицу фильтров нет: снимок деловой, и приводить его
                  к «стилю сайта» значит прятать то, ради чего он здесь.
                */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-5">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.24em] text-signal">
                    {t.about.portraitLabel}
                  </span>
                </figcaption>
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
                  «{t.about.quote}»
                </p>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
