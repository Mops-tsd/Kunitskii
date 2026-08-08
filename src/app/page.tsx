'use client';

import { useCallback, useEffect, useState } from 'react';
import { Preloader } from '@/components/Preloader';
import { Nav } from '@/components/Nav';
import { Hero } from '@/components/hero/Hero';
import { About } from '@/components/sections/About';
import { Stats } from '@/components/sections/Stats';
import { Recognition } from '@/components/sections/Recognition';
import { Principles } from '@/components/sections/Principles';
import { Geography } from '@/components/sections/Geography';
import { Projects } from '@/components/sections/Projects';
import { Company } from '@/components/sections/Company';
import { Press } from '@/components/sections/Press';
import { Contact, Footer } from '@/components/sections/Contact';
import { useI18n } from '@/lib/i18n';

export default function Page() {
  const [loaded, setLoaded] = useState(false);
  const { t, lang } = useI18n();

  // Заголовок вкладки и описание меняются вместе с языком.
  useEffect(() => {
    document.title = t.meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t.meta.description);
  }, [t, lang]);

  // Перезагрузка страницы должна начинаться сверху, иначе вступительная
  // анимация запустится, когда пользователь уже в середине сайта.
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const handleLoaded = useCallback(() => setLoaded(true), []);

  return (
    <>
      {!loaded && <Preloader onDone={handleLoaded} />}

      <Nav visible={loaded} />

      <main>
        <Hero started={loaded} />

        {/*
          Контент лежит поверх «липкого» героя: фон непрозрачный,
          иначе сквозь секции просвечивала бы 3D-сцена.
        */}
        <div className="relative z-10 bg-void">
          <About />
          <Stats />
          <Recognition />
          <Principles />
          <Geography />
          <Projects />
          <Company />
          <Press />
          <Contact />
          <Footer />
        </div>
      </main>
    </>
  );
}
