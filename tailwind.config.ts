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
        // Акцент — «сигнальный янтарь»: цвет строительной техники и разметки.
        signal: '#FF6B1A',
        signalDim: '#B84A10',
        // Холодный контр-акцент — арктический лёд.
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
