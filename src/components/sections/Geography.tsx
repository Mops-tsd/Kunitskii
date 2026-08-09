'use client';

import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useI18n } from '@/lib/i18n';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { PALETTE } from '@/lib/palette';
import { MAP_VIEW, RUSSIA_OUTLINE } from './russiaOutline';

gsap.registerPlugin(ScrollTrigger);

/**
 * Карта присутствия.
 *
 * Раньше здесь был разметочный лист: координатная сетка и линия,
 * соединяющая объекты с запада на восток. Читалось это как падающий
 * график — прямая, идущая вниз по клетчатому полю, ровно так, как рисуют
 * снижение выручки. Для сайта строителя худшую метафору придумать сложно.
 *
 * Поэтому теперь тут карта, а не чертёж: контур страны, объекты точками,
 * Полярный круг отдельной линией. Соединяющей линии нет вовсе — она
 * ничего не значила, объекты между собой не связаны.
 */

const { width: VIEW_W, height: VIEW_H, lonMin, lonMax, latMin, latMax } = MAP_VIEW;
const ARCTIC_CIRCLE = 66.56;

function projectX(lon: number) {
  const l = lon < 0 ? lon + 360 : lon;
  return ((l - lonMin) / (lonMax - lonMin)) * VIEW_W;
}
function projectY(lat: number) {
  return ((latMax - lat) / (latMax - latMin)) * VIEW_H;
}

interface Placed {
  name: string;
  x: number;
  y: number;
  arctic: boolean;
  /** Куда отвести подпись, чтобы она не легла на соседнюю. */
  labelDx: number;
  labelDy: number;
  labelAnchor: 'start' | 'end';
}

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function overlaps(a: Box, b: Box) {
  return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
}

/** Ширина строки моноширинным 13-м кеглем — с запасом. */
const CHAR_W = 7.9;
const LINE_H = 15;

/**
 * Разводит подписи городов.
 *
 * В Мурманской области четыре объекта в паре сотен километров друг от
 * друга: на такой карте их подписи ложились одна на другую и
 * превращались в нечитаемое пятно.
 *
 * Прикидка «сосед ближе стольких-то пикселей» это не решала — налезали и
 * те, кто по прикидке соседями не считался. Поэтому здесь честная
 * проверка прямоугольников: для каждого города перебираем позиции вокруг
 * точки и берём первую свободную.
 */
function placeLabels(
  points: Omit<Placed, 'labelDx' | 'labelDy' | 'labelAnchor'>[]
): Placed[] {
  const taken: Box[] = [];
  const placed: Placed[] = [];

  // Сами точки тоже занимают место — подпись не должна лечь на кружок.
  for (const p of points) {
    taken.push({ x1: p.x - 7, y1: p.y - 7, x2: p.x + 7, y2: p.y + 7 });
  }

  // Порядок обхода: сначала вправо-вверх, потом всё дальше по вертикали,
  // в конце — влево. Первые варианты выглядят лучше всего, поэтому
  // отклоняемся от них по минимуму.
  const CANDIDATES: Array<[number, number, 'start' | 'end']> = [
    [12, -12, 'start'],
    [12, 16, 'start'],
    [12, -30, 'start'],
    [12, 34, 'start'],
    [-12, -12, 'end'],
    [-12, 16, 'end'],
    [-12, -30, 'end'],
    [-12, 34, 'end'],
    [12, 52, 'start'],
    [-12, 52, 'end'],
  ];

  for (const p of points) {
    const width = p.name.length * CHAR_W;

    let chosen = CANDIDATES[0];
    for (const candidate of CANDIDATES) {
      const [dx, dy, anchor] = candidate;
      const left = anchor === 'end' ? p.x + dx - width : p.x + dx;
      const box: Box = {
        x1: left,
        y1: p.y + dy - LINE_H,
        x2: left + width,
        y2: p.y + dy + 4,
      };
      // За край карты подпись уводить нельзя — её обрежет.
      if (box.x1 < 4 || box.x2 > VIEW_W - 4) continue;
      if (taken.some((t) => overlaps(box, t))) continue;

      chosen = candidate;
      taken.push(box);
      break;
    }

    placed.push({
      ...p,
      labelDx: chosen[0],
      labelDy: chosen[1],
      labelAnchor: chosen[2],
    });
  }

  return placed;
}

export function Geography() {
  const { t } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);

  const points = useMemo(
    () =>
      placeLabels(
        t.projects.items.map((p) => ({
          name: p.city,
          x: projectX(p.coords[1]),
          y: projectY(p.coords[0]),
          arctic: p.coords[0] >= ARCTIC_CIRCLE,
        }))
      ),
    [t]
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const outline = svg.querySelectorAll<SVGPathElement>('.geo-outline');
    const dots = svg.querySelectorAll<SVGGElement>('.geo-dot');

    // Контур обводится линией, как на чертеже, — отсюда и штриховка
    // по всей длине пути, которая потом «дорисовывается».
    outline.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
    gsap.set(dots, { opacity: 0, scale: 0, transformOrigin: 'center' });

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: svg, start: 'top 78%', once: true },
    });

    timeline
      .to(outline, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' })
      // Точки зажигаются с запада на восток, вслед за обводкой.
      .to(dots, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1 }, 0.8);

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, [points]);

  return (
    <section
      id="geography"
      className="relative border-t border-steel py-24 md:py-36"
    >
      <div className="shell">
        <SectionHead
          index="06"
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
              {/* Контур страны: заливка почти в фон, обводка светлее. */}
              {RUSSIA_OUTLINE.map((d, i) => (
                <path
                  key={i}
                  className="geo-outline"
                  d={d}
                  fill={PALETTE.body}
                  fillOpacity="0.55"
                  stroke={PALETTE.gridMajor}
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              ))}

              {/* Полярный круг — граница арктической зоны */}
              <line
                x1="0"
                x2={VIEW_W}
                y1={projectY(ARCTIC_CIRCLE)}
                y2={projectY(ARCTIC_CIRCLE)}
                stroke={PALETTE.signal}
                strokeWidth="1"
                strokeDasharray="6 6"
                opacity="0.55"
              />
              {/* Подпись уводим к правому краю: слева на этой широте
                  стоят мурманские объекты, и текст лёг бы на них. */}
              <text
                x={VIEW_W - 8}
                y={projectY(ARCTIC_CIRCLE) - 10}
                textAnchor="end"
                fill={PALETTE.signal}
                fontSize="11"
                fontFamily="var(--font-mono), monospace"
                letterSpacing="2"
                opacity="0.8"
              >
                {t.geography.arcticLabel.toUpperCase()} · 66°34′N
              </text>

              {/*
                Акцент на сайте один, поэтому арктические объекты
                отделяются от дальневосточных яркостью, а не цветом:
                за Полярным кругом — светлый лёд, южнее — приглушённая сталь.
              */}
              {points.map((p) => {
                const tone = p.arctic ? PALETTE.signal : PALETTE.gridMajor;
                // Подпись, отведённую далеко, соединяем выноской —
                // иначе непонятно, какая точка чья.
                const far = Math.abs(p.labelDy) > 20;
                return (
                  <g key={p.name} className="geo-dot">
                    <circle cx={p.x} cy={p.y} r="13" fill={tone} opacity="0.14" />
                    <circle cx={p.x} cy={p.y} r="4" fill={tone} />
                    {far && (
                      <line
                        x1={p.x}
                        y1={p.y}
                        x2={p.x + p.labelDx * 0.7}
                        y2={p.y + p.labelDy - (p.labelDy > 0 ? 5 : -3)}
                        stroke={tone}
                        strokeWidth="0.75"
                        opacity="0.55"
                      />
                    )}
                    <text
                      x={p.x + p.labelDx}
                      y={p.y + p.labelDy}
                      textAnchor={p.labelAnchor}
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
