/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0b0b0e',
        surface: '#15151a',
        accent: '#7b5cff',
        accentHover: '#9b7cff',
        textMain: '#f3f4f6',
        textSubtle: '#9ca3af',
        border: '#2b2b33',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px rgba(123, 92, 255, 0.25)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(145deg, #0b0b0e, #15151a)',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(123, 92, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(123, 92, 255, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        glowPulse: 'glowPulse 2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.6s ease forwards',
      },
    },
  },
  plugins: [],
};
