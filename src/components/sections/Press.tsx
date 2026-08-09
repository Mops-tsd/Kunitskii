'use client';

import { useI18n } from '@/lib/i18n';
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
      </div>
    </section>
  );
}
