'use client';

import { useI18n } from '@/lib/i18n';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';

export function Principles() {
  const { t } = useI18n();

  return (
    <section className="relative border-t border-steel py-24 md:py-36">
      <div className="shell">
        <SectionHead
          index="03"
          label={t.principles.section}
          title={t.principles.heading}
        />

        <ul className="divide-y divide-steel border-y border-steel">
          {t.principles.items.map((item, i) => (
            <Reveal as="li" key={item.index} delay={i * 0.06}>
              {/*
                Строка-«ведомость»: номер, название, описание.
                При наведении подсвечивается вся строка — так список
                читается как таблица, а не как набор карточек.
              */}
              <div className="group grid gap-3 py-8 transition-colors md:grid-cols-12 md:gap-8 md:py-10">
                <span className="font-mono text-xs text-signal md:col-span-1">
                  {item.index}
                </span>
                <h3 className="h-display text-3xl text-chalk transition-colors group-hover:text-signal md:col-span-4 md:text-4xl">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-concrete md:col-span-7">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
