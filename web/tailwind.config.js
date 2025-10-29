/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0f0f17', // mörk bakgrund
        surface: '#1a1a24',    // paneler
        accent: '#8b5cf6',     // lila
        accentHover: '#a78bfa',
        textMain: '#e5e7eb',
        textSubtle: '#9ca3af',
        border: '#2a2a35',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(180deg, #0f0f17 0%, #1a1a24 100%)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        fadeIn: 'fadeIn 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
