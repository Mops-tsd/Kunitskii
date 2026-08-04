'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import ru from '@/content/ru';
import en from '@/content/en';
import zh from '@/content/zh';
import ar from '@/content/ar';
import { LANGS, type Content, type Lang } from '@/content/types';

const DICTS: Record<Lang, Content> = { ru, en, zh, ar };
const STORAGE_KEY = 'kunitskii.lang';

interface I18nValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  t: Content;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

function dirOf(lang: Lang): 'ltr' | 'rtl' {
  return LANGS.find((l) => l.code === lang)?.dir ?? 'ltr';
}

/** Подбирает язык по настройкам браузера, если пользователь ещё не выбирал. */
function detectLang(): Lang {
  if (typeof window === 'undefined') return 'ru';

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && saved in DICTS) return saved as Lang;

  const nav = window.navigator.language.toLowerCase();
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('ar')) return 'ar';
  if (nav.startsWith('ru')) return 'ru';
  return nav.startsWith('en') ? 'en' : 'ru';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Первый рендер всегда русский — он же в HTML, отданном с сервера.
  // Реальный язык подставляем после монтирования, чтобы не ловить рассинхрон гидратации.
  const [lang, setLangState] = useState<Lang>('ru');

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  useEffect(() => {
    const dir = dirOf(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // приватный режим — переживём без сохранения выбора
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({ lang, dir: dirOf(lang), t: DICTS[lang], setLang }),
    [lang, setLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n должен вызываться внутри <I18nProvider>');
  return ctx;
}
