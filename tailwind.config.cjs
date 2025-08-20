/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF5A1F', // Zostel Orange
          50:  '#fff5ef',
          100: '#ffe8dc',
          200: '#ffd0ba',
          300: '#ffb08e',
          400: '#ff8557',
          500: '#FF5A1F',
          600: '#ef4f14',
          700: '#d9420c',
          800: '#b93806',
          900: '#7a2b04',
        },
      },
      boxShadow: {
        soft: '0 6px 24px -12px rgba(0,0,0,0.15)',
      },
      fontFamily: {
        // if you want to easily use via className="font-sans"
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Inter', 'Arial', 'sans-serif'],
      },
      keyframes: {
        'kenburns-zoom': {
          '0%':   { transform: 'scale(1) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.12) translate3d(0,0,0)' },
        },
        'reveal-in': {
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'dot-progress': {
          to: { width: '100%' },
        },
        'pin-pulse': {
          '0%':   { transform: 'translateY(0) scale(1)',   filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))' },
          '50%':  { transform: 'translateY(-1px) scale(1.03)', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.28))' },
          '100%': { transform: 'translateY(0) scale(1)',   filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))' },
        },
      },
      animation: {
        'kenburns-zoom': 'kenburns-zoom 20s ease-out infinite alternate',
        'reveal-in': 'reveal-in 420ms ease-out forwards',
        'dot-progress': 'dot-progress var(--dotDur, 4500ms) linear forwards',
        'pin-pulse': 'pin-pulse 900ms ease-in-out infinite',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
};
