'use client';

import { useI18n } from '@/lib/i18n';
import { asset } from '@/lib/asset';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import type { Project } from '@/content/types';

export function Projects() {
  const { t } = useI18n();

  return (
    <section
      id="projects"
      className="relative border-t border-steel py-24 md:py-36"
    >
      <div className="shell">
        <SectionHead
          index="07"
          label={t.projects.section}
          title={t.projects.heading}
          lead={t.projects.lead}
        />

        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:gap-x-12">
          {t.projects.items.map((project, i) => (
            <Card key={project.name} project={project} delay={(i % 2) * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ project, delay }: { project: Project; delay: number }) {
  return (
    <Reveal as="article" delay={delay} className="group">
      <div className="relative aspect-[16/10] overflow-hidden border border-steel bg-graphite">
        {project.image ? (
          <>
            {/*
              Обычный <img>, а не next/image: сайт собирается статически
              и раскладывается на любой хостинг, без сервера оптимизации.
              Файлы уже ужаты в WebP на этапе сборки.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(project.image)}
              alt={`${project.name}, ${project.city}`}
              loading="lazy"
              decoding="async"
              /*
               * Ни обесцвечивания, ни притушенности: раньше на карточках
               * стояли временные городские снимки, и общий фильтр приводил
               * их к одному виду. С настоящими визуализациями объектов он
               * только прячет то, ради чего раздел и существует.
               */
              className="h-full w-full scale-[1.03] object-cover transition-transform duration-[900ms] ease-out group-hover:scale-100"
            />
            {/* Лёгкое затемнение только снизу — под подпись, не на весь кадр. */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/45 via-transparent to-transparent" />
          </>
        ) : (
          /* Фотографии ещё нет — вместо неё чертёжная заглушка. */
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(95,212,232,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(95,212,232,0.2) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-concrete">
                {project.coords[0].toFixed(2)}°N {project.coords[1].toFixed(2)}°E
              </span>
            </div>
          </div>
        )}

        <span className="absolute end-4 top-4 border border-signal/60 bg-void/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-signal backdrop-blur-sm">
          {project.status}
        </span>
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-steel pt-4">
        <h3 className="h-display text-2xl text-chalk md:text-3xl">
          {project.name}
        </h3>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-signal">
          {project.city}
        </span>
      </div>

      <p className="mt-3 leading-relaxed text-concrete">{project.description}</p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-concrete/60">
        {project.region}
      </p>
    </Reveal>
  );
}
