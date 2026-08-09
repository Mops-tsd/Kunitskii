'use client';

import { useI18n } from '@/lib/i18n';
import { asset } from '@/lib/asset';
import { Reveal } from '@/components/ui/Reveal';
import { LINKS, LAUNCH_YEAR } from '@/content/links';

export function Contact() {
  const { t } = useI18n();

  const channels = [
    { label: t.contact.telegram, href: LINKS.telegram },
    { label: t.contact.whatsapp, href: LINKS.whatsapp },
    { label: t.contact.max, href: LINKS.max },
  ];

  return (
    <section
      id="contact"
      className="relative border-t border-steel py-24 md:py-36"
    >
      <div className="shell">
        <Reveal>
          <div className="mb-5 flex items-center gap-4">
            <span className="font-mono text-xs text-signal">08</span>
            <span className="rule w-16" />
            <span className="eyebrow">{t.contact.section}</span>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="h-display max-w-4xl text-[11vw] text-chalk md:text-[6vw]">
            {t.contact.heading}
          </h2>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mt-6 max-w-xl text-lg text-concrete">{t.contact.lead}</p>
        </Reveal>

        {/* Мессенджеры — основное целевое действие сайта. */}
        <div className="mt-12 grid gap-px border border-steel bg-steel sm:grid-cols-3">
          {channels.map((channel, i) => (
            <Reveal key={channel.label} delay={0.2 + i * 0.06}>
              <a
                href={channel.href || undefined}
                target={channel.href ? '_blank' : undefined}
                rel={channel.href ? 'noopener noreferrer' : undefined}
                aria-disabled={!channel.href}
                className={`group flex h-full items-center justify-between bg-void px-6 py-8 transition-colors ${
                  channel.href
                    ? 'hover:bg-graphite'
                    : 'cursor-not-allowed opacity-45'
                }`}
              >
                <span className="h-display text-2xl text-chalk transition-colors group-hover:text-signal md:text-3xl">
                  {channel.label}
                </span>
                <span className="font-mono text-signal transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                  ↗
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <div className="mt-14 grid gap-8 border-t border-steel pt-8 sm:grid-cols-2">
            <div>
              <span className="eyebrow">{t.contact.office}</span>
              <p className="mt-3 text-chalk">{t.contact.officeAddress}</p>
              <p className="mt-1 text-sm text-concrete">{t.contact.company}</p>
            </div>
            <div className="sm:text-end">
              <span className="eyebrow">TSD Group</span>
              <p className="mt-3">
                <a
                  href={LINKS.companySite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-chalk underline decoration-steel underline-offset-4 transition-colors hover:text-signal hover:decoration-signal"
                >
                  tsr-gr.ru ↗
                </a>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-steel py-10">
      <div className="shell flex flex-col gap-4 text-[11px] text-concrete/70 md:flex-row md:items-center md:justify-between">
        <span className="font-mono uppercase tracking-[0.14em]">
          © {Math.max(year, LAUNCH_YEAR)} {t.contact.company}. {t.footer.rights}.
        </span>
        <span className="max-w-md leading-relaxed">{t.footer.disclaimer}</span>

        {/* Ссылка нужна на всех языках: документ один и на русском —
            это юридический текст по месту регистрации компании. */}
        <a
          href={asset('/privacy/')}
          className="font-mono uppercase tracking-[0.14em] transition-colors hover:text-signal"
        >
          {t.footer.privacy}
        </a>
      </div>
    </footer>
  );
}
