'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Появление блока при въезде в экран.
 *
 * Вынесено в один компонент, чтобы вся страница двигалась одинаково:
 * иначе каждая секция обрастает своими таймингами и скролл начинает
 * выглядеть рвано.
 *
 * Прозрачность выставляется не в разметке, а первым же действием после
 * монтирования. Разница принципиальная: в разметке сайт приезжает с
 * невидимым текстом, и если скрипт не выполнился — не загрузился чанк,
 * отключён JavaScript, старый браузер, — страница остаётся пустой.
 * Сайт, который делают ради текста, не имеет права исчезать целиком
 * из-за анимации. Так текст виден всегда, а анимация — это то, что
 * добавляется сверху, когда есть чему добавляться.
 */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article' | 'header';
}) {
  const ref = useRef<HTMLElement>(null);

  // Прячем до отрисовки — useLayoutEffect выполняется до того, как
  // браузер покажет кадр, поэтому мигания не будет.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.set(el, { opacity: 0 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Пользователь просил систему меньше двигать — показываем сразу.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const anim = gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      }
    );

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [delay, y]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
