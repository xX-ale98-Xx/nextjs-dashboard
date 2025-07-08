import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      colors: {
        brand: {
          hover: '#2AE9D9',
          100: '#E1F5F3',
          200: '#B4E5E0',
          300: '#7ED6CB',
          400: '#44C3B4',
          main: '#109C90',
          600: '#0D8A80',
          700: '#0A726A',
          800: '#075C56',
          900: '#044240',
        },
        black: {
          text: '#171D1C',
        },
        gray:{
          border: '#E0E0E0',
          background: '#82828221',
          user: '#82828240',
        },
        blue: {
          400: '#2589FE',
          500: '#0070F3',
          600: '#2F6FEB',
        },
      },
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
