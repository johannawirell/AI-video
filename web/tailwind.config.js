/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0d0d10',
        surface: '#18181f',
        accent: '#8b5cf6',
        accentHover: '#a78bfa',
        textMain: '#f3f4f6',
        textSubtle: '#9ca3af',
        border: '#2b2b33',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulsebar: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
        pulsebar: 'pulsebar 2s ease-in-out infinite',
        'spin-slow': 'spinSlow 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
