/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Amiri', 'Cairo', 'serif'],
      },
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#dae5f0',
          200: '#b8cce2',
          300: '#8ba8cd',
          400: '#5e7fb0',
          500: '#3f6095',
          600: '#314c7a',
          700: '#283d63',
          800: '#1f3049',
          900: '#162233',
          950: '#0e1722',
        },
        gold: {
          50: '#fbf7ec',
          100: '#f6edd0',
          200: '#ecd79c',
          300: '#e1bf63',
          400: '#d8a93c',
          500: '#c8932a',
          600: '#a97422',
          700: '#88571f',
          800: '#6f451f',
          900: '#5d3a1d',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.05)',
        'card-hover': '0 10px 30px -12px rgb(15 23 42 / 0.18)',
        glow: '0 0 0 1px rgb(200 147 42 / 0.25), 0 8px 24px -8px rgb(200 147 42 / 0.35)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.18s ease-out',
      },
    },
  },
  plugins: [],
};
