'use client';

import { useI18n } from '@/lib/i18n';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';

/**
 * Признание отрасли и институтов развития.
 *
 * Раздел намеренно устроен как перечень внешних подтверждений: слева
 * тот, кто подтверждает, справа — что именно. Это единственное место
 * на сайте, где говорит не сам герой, поэтому и оформление другое —
 * без крупных заголовков и без превосходных степеней.
 */
export function Recognition() {
  const { t } = useI18n();

  return (
    <section
      id="recognition"
      className="relative border-t border-steel py-24 md:py-36"
    >
      <div className="shell">
        <SectionHead
          index="04"
          label={t.recognition.section}
          title={t.recognition.heading}
          lead={t.recognition.lead}
        />

        <ul className="divide-y divide-steel border-y border-steel">
          {t.recognition.items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 0.06}>
              <div className="group grid gap-3 py-8 md:grid-cols-12 md:items-baseline md:gap-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-signal md:col-span-3">
                  {item.source}
                </span>
                <h3 className="h-display text-2xl leading-tight text-chalk transition-colors group-hover:text-signal md:col-span-4">
                  {item.title}
                </h3>
                <p className="text-concrete md:col-span-5">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.3}>
          <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-concrete/70">
            {t.recognition.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
