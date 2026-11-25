/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        card: 'rgb(var(--c-card) / <alpha-value>)',
        line: 'rgb(var(--c-border) / <alpha-value>)',
        ink: 'rgb(var(--c-text) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        brand: {
          DEFAULT: 'rgb(var(--c-brand) / <alpha-value>)',
          hover: 'rgb(var(--c-brand-hover) / <alpha-value>)',
        },
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        neon: {
          blue: 'rgb(var(--c-neon1) / <alpha-value>)',
          pink: 'rgb(var(--c-neon2) / <alpha-value>)',
          orange: 'rgb(var(--c-neon3) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        serif2: ['"Playfair Display"', 'Georgia', 'serif'],
        hand: ['Caveat', 'cursive'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%': { boxShadow: '0 0 15px rgb(var(--c-brand) / .25)' },
          '100%': { boxShadow: '0 0 35px rgb(var(--c-brand) / .55)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'neon-wave': {
          '0%, 100%': { transform: 'scaleY(.7)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in .35s ease-out both',
        'scale-in': 'scale-in .2s ease-out both',
        'pulse-glow': 'pulse-glow 3s infinite alternate',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 24s linear infinite',
        'neon-wave': 'neon-wave 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}