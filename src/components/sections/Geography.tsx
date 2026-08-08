'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useI18n } from '@/lib/i18n';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { PALETTE } from '@/lib/palette';

gsap.registerPlugin(ScrollTrigger);

/**
 * Карта присутствия.
 *
 * Намеренно не рисуем контур страны: карта сделана как разметочный лист —
 * координатная сетка, Полярный круг и точки объектов. Это и точнее
 * (границы регионов на такой мелкой карте всё равно нечитаемы),
 * и держит единый язык с чертёжной сценой в начале сайта.
 */

const VIEW_W = 1000;
const VIEW_H = 420;
const LON_MIN = 25;
const LON_MAX = 182;
const LAT_MIN = 41;
const LAT_MAX = 73;
const ARCTIC_CIRCLE = 66.56;

function projectX(lon: number) {
  return ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * VIEW_W;
}
function projectY(lat: number) {
  return ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VIEW_H;
}

export function Geography() {
  const { t } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);

  const points = t.projects.items.map((p) => ({
    name: p.city,
    x: projectX(p.coords[1]),
    y: projectY(p.coords[0]),
    arctic: p.coords[0] >= ARCTIC_CIRCLE,
  }));

  // Маршрут через все объекты с запада на восток.
  const route = [...points].sort((a, b) => a.x - b.x);
  const routePath = route
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const path = svg.querySelector<SVGPathElement>('.geo-route');
    const dots = svg.querySelectorAll<SVGGElement>('.geo-dot');
    if (!path) return;

    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.set(dots, { opacity: 0, scale: 0, transformOrigin: 'center' });

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: svg, start: 'top 78%', once: true },
    });

    timeline
      .to(path, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut' })
      // Точки зажигаются по ходу линии, а не все разом.
      .to(dots, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.12 }, 0.5);

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, [routePath]);

  return (
    <section
      id="geography"
      className="relative border-t border-steel py-24 md:py-36"
    >
      <div className="shell">
        <SectionHead
          index="04"
          label={t.geography.section}
          title={t.geography.heading}
          lead={t.geography.lead}
        />

        <Reveal>
          <div className="overflow-x-auto">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="h-auto w-full min-w-[680px]"
              role="img"
              aria-label={t.geography.heading}
            >
              {/* Координатная сетка */}
              <g stroke="#1F262C" strokeWidth="1">
                {[45, 50, 55, 60, 65, 70].map((lat) => (
                  <line
                    key={lat}
                    x1="0"
                    x2={VIEW_W}
                    y1={projectY(lat)}
                    y2={projectY(lat)}
                  />
                ))}
                {[40, 60, 80, 100, 120, 140, 160, 180].map((lon) => (
                  <line
                    key={lon}
                    y1="0"
                    y2={VIEW_H}
                    x1={projectX(lon)}
                    x2={projectX(lon)}
                  />
                ))}
              </g>

              {/* Полярный круг — граница арктической зоны */}
              <line
                x1="0"
                x2={VIEW_W}
                y1={projectY(ARCTIC_CIRCLE)}
                y2={projectY(ARCTIC_CIRCLE)}
                stroke="#5FD4E8"
                strokeWidth="1"
                strokeDasharray="6 6"
                opacity="0.8"
              />
              {/* Подпись уводим к правому краю: слева на этой широте
                  стоят Мурманск и Архангельск, и текст лез бы на них. */}
              <text
                x={VIEW_W - 8}
                y={projectY(ARCTIC_CIRCLE) - 10}
                textAnchor="end"
                fill="#5FD4E8"
                fontSize="11"
                fontFamily="var(--font-mono), monospace"
                letterSpacing="2"
              >
                {t.geography.arcticLabel.toUpperCase()} · 66°34′N
              </text>

              {/* Маршрут по объектам */}
              <path
                className="geo-route"
                d={routePath}
                fill="none"
                stroke={PALETTE.signal}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/*
                Акцент на сайте один, поэтому арктические объекты
                отделяются от дальневосточных яркостью, а не цветом:
                за Полярным кругом — светлый лёд, южнее — приглушённая сталь.
              */}
              {points.map((p) => {
                const tone = p.arctic ? PALETTE.signal : PALETTE.gridMajor;
                return (
                  <g key={p.name} className="geo-dot">
                    <circle cx={p.x} cy={p.y} r="14" fill={tone} opacity="0.12" />
                    <circle cx={p.x} cy={p.y} r="4" fill={tone} />
                    <text
                      x={p.x + 12}
                      y={p.y - 10}
                      fill="#E8EDF1"
                      fontSize="13"
                      fontFamily="var(--font-mono), monospace"
                    >
                      {p.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Reveal>

        {/* Полный список регионов */}
        <Reveal delay={0.15}>
          <ul className="mt-14 flex flex-wrap gap-x-6 gap-y-3 border-t border-steel pt-8">
            {t.geography.regions.map((region) => (
              <li
                key={region}
                className="font-mono text-[11px] uppercase tracking-[0.12em] text-concrete"
              >
                {region}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
