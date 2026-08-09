'use client';

import Script from 'next/script';

/**
 * Счётчик посещаемости.
 *
 * Номер счётчика подставляется при сборке:
 *
 *   NEXT_PUBLIC_METRIKA_ID=00000000 npm run build
 *
 * Пока номера нет, компонент не выводит ничего — ни тега, ни запроса.
 * Это не заглушка «на потом», а рабочее состояние: счётчик подключается
 * одной переменной, без правки кода, и до этого момента сайт не грузит
 * чужие скрипты и не ставит чужих cookie.
 *
 * Загрузка отложена до простоя браузера: аналитика не должна отбирать
 * ресурсы у первого экрана, где и так работает 3D-сцена.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_METRIKA_ID;
  if (!id) return null;

  return (
    <>
      <Script id="metrika" strategy="lazyOnload">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${JSON.stringify(id)}, "init", {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: false
          });
        `}
      </Script>

      {/* Резервный пиксель для случая, когда скрипты заблокированы. */}
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${id}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
