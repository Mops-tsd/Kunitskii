'use client';

import { useI18n } from '@/lib/i18n';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';

/**
 * Карьерный путь.
 *
 * Отдельная секция, а не абзац в «Персоне». Человека, который читает
 * сайт внимательно, интересует последовательность: где работал, кем и
 * что там делал. Абзацем это не передать — нужна шкала.
 *
 * Каждая ступень подписана источником. Это не педантизм: сведения
 * собраны из открытых реестров, и читателю важно видеть, что за
 * строчкой стоит запись в ЕГРЮЛ, а не самоописание.
 *
 * Секция не рендерится, пока ступеней меньше двух. Лестница из одной
 * ступени — не лестница, и выглядит как незаполненная заготовка.
 */
export function Career() {
  const { t } = useI18n();
  const steps = t.career.steps;

  if (steps.length < 2) return null;

  return (
    <section
      id="career"
      className="relative border-t border-steel py-24 md:py-36"
    >
      <div className="shell">
        <SectionHead
          index="02"
          label={t.career.section}
          title={t.career.heading}
          lead={t.career.lead}
        />

        {/*
          Отступ между ступенями стоит на самом элементе списка, а не на
          его содержимом. Вариант last: смотрит на положение среди
          соседей, и на единственном вложенном узле он срабатывает
          всегда — обнуляя отступ у каждой ступени, а не у последней.
        */}
        <ol className="relative max-w-4xl">
          {/*
            Вертикальная линия проходит через все ступени, кроме последней:
            путь продолжается, а не упирается в точку.
          */}
          <span className="absolute bottom-16 start-0 top-2 w-px bg-steel" />

          {steps.map((step, i) => (
            <Reveal
              as="li"
              key={`${step.period}-${step.role}`}
              delay={i * 0.06}
              className="block pb-16 last:pb-0"
            >
              <div className="relative ps-8 md:ps-12">
                {/*
                  Верхняя ступень — текущая должность, её маркер залит.
                  Остальные полые: разница видна боковым зрением, читать
                  подписи ради этого не нужно.
                */}
                <span
                  className={`absolute start-0 top-[0.55rem] h-2.5 w-2.5 -translate-x-1/2 rounded-full rtl:translate-x-1/2 ${
                    i === 0
                      ? 'bg-signal shadow-[0_0_0_4px_rgba(95,212,232,0.14)]'
                      : 'border border-steel bg-void'
                  }`}
                />

                <div className="font-mono text-xs tracking-[0.16em] text-signal">
                  {step.period}
                </div>

                <h3 className="mt-2 h-display text-2xl text-chalk md:text-3xl">
                  {step.role}
                </h3>

                <div className="mt-1 text-sm text-chalk/80">{step.org}</div>

                <p className="mt-3 max-w-2xl leading-relaxed text-concrete">
                  {step.body}
                </p>

                {step.source && (
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-concrete/60">
                    {step.source}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.1}>
          <p className="mt-10 max-w-2xl border-t border-steel pt-6 font-mono text-[11px] leading-relaxed tracking-[0.04em] text-concrete/70">
            {t.career.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
