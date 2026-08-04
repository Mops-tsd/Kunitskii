'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { LANGS, type Lang } from '@/content/types';

const SECTIONS = [
  { id: 'about', key: 'about' },
  { id: 'scale', key: 'scale' },
  { id: 'geography', key: 'geography' },
  { id: 'projects', key: 'projects' },
  { id: 'press', key: 'press' },
  { id: 'contact', key: 'contact' },
] as const;

export function Nav({ visible }: { visible: boolean }) {
  const { t, lang, setLang } = useI18n();
  const [active, setActive] = useState<string>('');
  const [open, setOpen] = useState(false);

  // Подсвечиваем пункт меню той секции, что сейчас в кадре.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-opacity duration-700 ${
          visible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="shell flex items-center justify-between py-5 md:py-6">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-mono text-xs tracking-[0.2em] text-chalk transition-colors hover:text-signal"
          >
            Е.&nbsp;КУНИЦКИЙ
          </button>

          {/* Меню на широком экране */}
          <nav className="hidden items-center gap-7 lg:flex">
            {SECTIONS.map(({ id, key }, i) => (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                className={`group flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                  active === id ? 'text-signal' : 'text-concrete hover:text-chalk'
                }`}
              >
                <span className="text-[9px] opacity-60">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {t.nav[key]}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <LangSwitch lang={lang} setLang={setLang} />

            {/* Бургер на узком экране */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="flex h-8 w-8 flex-col items-end justify-center gap-1.5 lg:hidden"
            >
              <span
                className={`block h-px bg-chalk transition-all duration-300 ${
                  open ? 'w-6 translate-y-[3px] rotate-45' : 'w-6'
                }`}
              />
              <span
                className={`block h-px bg-chalk transition-all duration-300 ${
                  open ? 'w-6 -translate-y-[3px] -rotate-45' : 'w-4'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Полноэкранное меню для телефона */}
      <div
        className={`fixed inset-0 z-40 bg-void/97 backdrop-blur-sm transition-all duration-500 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <nav className="shell flex h-full flex-col justify-center gap-1">
          {SECTIONS.map(({ id, key }, i) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              className="group flex items-baseline gap-4 py-2 text-start"
            >
              <span className="font-mono text-xs text-signal">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="h-display text-[11vw] text-chalk transition-colors group-hover:text-signal">
                {t.nav[key]}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

function LangSwitch({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={`font-mono text-[11px] transition-colors ${
            lang === code ? 'text-signal' : 'text-concrete hover:text-chalk'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
