/**
 * Типы контента сайта.
 *
 * Весь текст живёт в src/content/<lang>.ts и не смешан с вёрсткой —
 * чтобы позже подключить админку/CMS без переписывания компонентов.
 */

export type Lang = 'ru' | 'en' | 'zh' | 'ar';

export const LANGS: { code: Lang; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'ru', label: 'RU', dir: 'ltr' },
  { code: 'en', label: 'EN', dir: 'ltr' },
  { code: 'zh', label: '中文', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
];

export interface Stat {
  /** Числовое значение для анимации счётчика. */
  value: number;
  /**
   * Сколько знаков после запятой показывать.
   *
   * По умолчанию ноль: большинство показателей целые. Но 58,5 млрд,
   * округлённые до 59, — это уже другая цифра, а не оформление.
   */
  decimals?: number;
  /** Что дописать после числа: «+», «м²» и т.п. */
  suffix?: string;
  label: string;
}

export interface RecognitionItem {
  /** Ведомство, институт развития или программа. */
  source: string;
  title: string;
  body: string;
}

export interface Principle {
  index: string;
  title: string;
  body: string;
}

export interface Project {
  name: string;
  city: string;
  region: string;
  /** Координаты для метки на карте: [широта, долгота]. */
  coords: [number, number];
  status: string;
  description: string;
  image: string;
}

export interface TimelineEntry {
  year: string;
  title: string;
  body: string;
}

/**
 * Ступень карьеры.
 *
 * Отдельно от TimelineEntry, хотя обе выглядят как «год — текст».
 * У компании хронология — про события, у человека — про должности:
 * важны период, роль и организация, и они нужны отдельными полями,
 * иначе их не перевести и не отдать поисковику разметкой.
 */
export interface CareerStep {
  /** Период: «2022 — н. в.», «2015–2019». */
  period: string;
  /** Должность. */
  role: string;
  /** Организация. */
  org: string;
  /** Чем занимался — одна-две фразы, без общих слов. */
  body: string;
  /**
   * Откуда сведения: «ЕГРЮЛ», «Сайт группы».
   *
   * Показывается мелким шрифтом. Для человека, который вчитывается,
   * подпись источника — не украшение: она отличает проверяемый факт
   * от красивой формулировки.
   */
  source?: string;
}

export interface Appearance {
  date: string;
  event: string;
  place: string;
  topic: string;
}

export interface Content {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    about: string;
    career: string;
    scale: string;
    recognition: string;
    geography: string;
    projects: string;
    press: string;
    contact: string;
  };
  preloader: {
    line1: string;
    line2: string;
    line3: string;
  };
  hero: {
    role: string;
    name: string;
    surname: string;
    tagline: string[];
    scrollHint: string;
    skip: string;
  };
  about: {
    section: string;
    heading: string;
    lead: string;
    body: string[];
    /** Цитата Куницкого — она же смысловая ось всего сайта. */
    quote: string;
    /** Подписи в рамке, которая стоит вместо будущей фотографии. */
    portraitLabel: string;
    portraitNote: string;
  };
  career: {
    section: string;
    heading: string;
    lead: string;
    steps: CareerStep[];
    /** Подпись под лестницей: откуда взяты сведения. */
    note: string;
  };
  stats: {
    section: string;
    heading: string;
    items: Stat[];
    note: string;
  };
  recognition: {
    section: string;
    heading: string;
    lead: string;
    items: RecognitionItem[];
    note: string;
  };
  principles: {
    section: string;
    heading: string;
    items: Principle[];
  };
  geography: {
    section: string;
    heading: string;
    lead: string;
    arcticLabel: string;
    farEastLabel: string;
    regions: string[];
  };
  projects: {
    section: string;
    heading: string;
    lead: string;
    items: Project[];
  };
  company: {
    section: string;
    heading: string;
    lead: string;
    body: string[];
    timeline: TimelineEntry[];
  };
  press: {
    section: string;
    heading: string;
    lead: string;
    items: Appearance[];
  };
  contact: {
    section: string;
    heading: string;
    lead: string;
    telegram: string;
    whatsapp: string;
    max: string;
    office: string;
    officeAddress: string;
    company: string;
  };
  footer: {
    rights: string;
    privacy: string;
    disclaimer: string;
  };
  ui: {
    sound: string;
    soundOn: string;
    soundOff: string;
    langLabel: string;
  };
}
