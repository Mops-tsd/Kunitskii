import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Тёмная база — уголь/графит, как ночной бетон.
        void: '#050607',
        ink: '#0B0D0F',
        graphite: '#14181C',
        steel: '#1F262C',
        concrete: '#8A949C',
        chalk: '#E8EDF1',
        // Акцент один на весь сайт — арктический лёд.
        // Значения продублированы в src/lib/palette.ts для 3D-сцены.
        signal: '#5FD4E8',
        signalDim: '#2F8FA6',
        /** Приглушённый акцент для крупного текста — см. src/lib/palette.ts. */
        signalMuted: '#7FB6C6',
        ice: '#5FD4E8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.05em',
        supertight: '-0.03em',
      },
    },
  },
  plugins: [],
};

export default config;
