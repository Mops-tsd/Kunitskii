import type { MetadataRoute } from 'next';

/**
 * Манифест веб-приложения.
 *
 * Нужен ради одного сценария, но частого на телефоне: «Добавить на
 * экран «Домой»». Без манифеста ярлык получает имя из заголовка
 * вкладки — длинное, с должностью, — и обрезается до бессмысленного
 * куска. С манифестом это короткое имя и знак сайта.
 */
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Евгений Куницкий — ГК «ТрансСтрой Девелопмент»',
    short_name: 'Е. Куницкий',
    description:
      'Управляющий группы компаний «ТрансСтрой Девелопмент». Строительство в Арктике и на Дальнем Востоке.',
    start_url: '.',
    display: 'standalone',
    background_color: '#050607',
    theme_color: '#050607',
    icons: [
      { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: 'apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
