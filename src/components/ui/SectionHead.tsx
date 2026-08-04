'use client';

import { Reveal } from './Reveal';

/** Единая шапка секции: номер, метка, заголовок и линейка под ним. */
export function SectionHead({
  index,
  label,
  title,
  lead,
}: {
  index: string;
  label: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="mb-14 md:mb-20">
      <Reveal>
        <div className="mb-5 flex items-center gap-4">
          <span className="font-mono text-xs text-signal">{index}</span>
          <span className="rule w-16" />
          <span className="eyebrow">{label}</span>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="h-display max-w-4xl text-[9vw] text-chalk md:text-[4.5vw]">
          {title}
        </h2>
      </Reveal>

      {lead && (
        <Reveal delay={0.16}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-concrete md:text-lg">
            {lead}
          </p>
        </Reveal>
      )}
    </header>
  );
}
