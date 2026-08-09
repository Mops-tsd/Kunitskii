import type { Metadata } from 'next';
import Link from 'next/link';
import { LINKS } from '@/content/links';

/**
 * Политика конфиденциальности.
 *
 * Черновик. Нужен даже сайту-визитке: как только на странице появятся
 * счётчик посещаемости или кнопка обратной связи, сбор данных начнётся,
 * а закон требует объяснить, какие данные и зачем.
 *
 * Текст намеренно короткий и по существу — ровно под то, что сайт
 * действительно делает. Раздувать его типовыми формулировками «на все
 * случаи» смысла нет: чем длиннее, тем меньше вероятность, что его
 * прочитают, и тем проще спрятать в нём неточность.
 *
 * ВАЖНО: перед публикацией текст должен посмотреть юрист заказчика.
 * Здесь оставлены места, которые без него заполнить нельзя, — они
 * помечены комментарием TODO.
 */

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — Евгений Куницкий',
  description:
    'Какие данные собирает сайт, зачем они нужны и как с ними обращаются.',
  robots: { index: false },
};

const UPDATED = '9 августа 2026 года';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-void py-20 md:py-28">
      <div className="shell max-w-3xl">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal transition-colors hover:text-chalk"
        >
          ← На главную
        </Link>

        <h1 className="h-display mt-10 text-4xl text-chalk md:text-6xl">
          Политика конфиденциальности
        </h1>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-concrete">
          Обновлено {UPDATED}
        </p>

        <div className="mt-12 space-y-10 text-concrete">
          <section>
            <h2 className="h-display text-2xl text-chalk">Коротко</h2>
            <p className="mt-3 leading-relaxed">
              Сайт — визитка. Он не просит регистрироваться, не хранит личные
              кабинеты и не собирает документы. Всё, что здесь есть, — это
              текст о деятельности и кнопки перехода в мессенджеры.
            </p>
          </section>

          <section>
            <h2 className="h-display text-2xl text-chalk">
              Какие данные собираются
            </h2>
            <p className="mt-3 leading-relaxed">
              Обезличенная статистика посещений: страница, время, тип
              устройства, браузер, приблизительный регион, источник перехода.
              Эти данные не позволяют установить личность и используются
              только для того, чтобы понимать, работает ли сайт и с каких
              устройств его смотрят.
            </p>
            {/* TODO: указать конкретный сервис аналитики, когда он будет
                подключён (например, Яндекс.Метрика), и ссылку на его
                собственную политику. */}
            <p className="mt-3 leading-relaxed">
              Статистику собирает внешний сервис веб-аналитики. Он использует
              файлы cookie и хранит данные на своей стороне на условиях
              собственной политики.
            </p>
          </section>

          <section>
            <h2 className="h-display text-2xl text-chalk">
              Переход в мессенджеры
            </h2>
            <p className="mt-3 leading-relaxed">
              Кнопки связи ведут во внешние приложения. Сообщение, которое вы
              там напишете, отправляется напрямую в мессенджер и на этом сайте
              не сохраняется. Правила обработки переписки определяет сам
              мессенджер.
            </p>
          </section>

          <section>
            <h2 className="h-display text-2xl text-chalk">Файлы cookie</h2>
            <p className="mt-3 leading-relaxed">
              Сайт запоминает выбранный язык, чтобы не переспрашивать при
              следующем заходе. Остальные cookie ставит сервис аналитики.
              Их можно запретить в настройках браузера — сайт продолжит
              работать.
            </p>
          </section>

          <section>
            <h2 className="h-display text-2xl text-chalk">Ваши права</h2>
            <p className="mt-3 leading-relaxed">
              Вы можете запросить, какие данные о вас есть, потребовать их
              удаления или отозвать согласие на обработку. Для этого
              напишите по контактам ниже — ответ придёт в разумный срок.
            </p>
          </section>

          <section>
            <h2 className="h-display text-2xl text-chalk">Кто отвечает</h2>
            {/* TODO: заказчику — подтвердить юрлицо-оператора и адрес для
                обращений. Сейчас указано юрлицо со страницы контактов. */}
            <p className="mt-3 leading-relaxed">
              ООО СЗ «ТрансСтрой Девелопмент», Владивосток, ул. Днепровская,
              107, офис&nbsp;4.
            </p>
            <p className="mt-3 leading-relaxed">
              Сайт группы компаний:{' '}
              <a
                href={LINKS.companySite}
                target="_blank"
                rel="noreferrer noopener"
                className="text-signal underline-offset-4 hover:underline"
              >
                {LINKS.companySite.replace(/^https?:\/\//, '')}
              </a>
            </p>
          </section>

          <section>
            <h2 className="h-display text-2xl text-chalk">Изменения</h2>
            <p className="mt-3 leading-relaxed">
              Если порядок обработки данных изменится, здесь появится новая
              редакция с другой датой обновления.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
