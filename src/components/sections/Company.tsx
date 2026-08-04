'use client';

import { useI18n } from '@/lib/i18n';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';

export function Company() {
  const { t } = useI18n();

  return (
    <section className="relative border-t border-steel py-24 md:py-36">
      <div className="shell">
        <SectionHead
          index="06"
          label={t.company.section}
          title={t.company.heading}
          lead={t.company.lead}
        />

        <div className="grid gap-14 md:grid-cols-12 md:gap-16">
          <div className="space-y-5 md:col-span-5">
            {t.company.body.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="leading-relaxed text-concrete">{paragraph}</p>
              </Reveal>
            ))}
          </div>

          {/* Хронология — вертикальная шкала с засечками по годам. */}
          <ol className="relative md:col-span-7">
            <span className="absolute inset-y-0 start-0 w-px bg-steel" />
            {t.company.timeline.map((entry, i) => (
              <Reveal as="li" key={entry.year} delay={i * 0.07}>
                <div className="relative ps-8 pb-10 last:pb-0">
                  <span className="absolute start-0 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-signal rtl:translate-x-1/2" />
                  <div className="font-mono text-xs tracking-[0.16em] text-signal">
                    {entry.year}
                  </div>
                  <h3 className="mt-2 h-display text-2xl text-chalk">
                    {entry.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-concrete">
                    {entry.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
