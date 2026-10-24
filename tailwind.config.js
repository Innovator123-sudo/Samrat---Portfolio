/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--c-ink)',
        paper: 'var(--c-paper)',
        cream: 'var(--c-cream)',
        amber: {
          DEFAULT: 'var(--c-amber)',
          soft: 'var(--c-amber-soft)',
        },
        coral: 'var(--c-coral)',
        teal: {
          DEFAULT: 'var(--c-teal)',
          soft: 'var(--c-teal-soft)',
        },
        steel: 'var(--c-steel)',
        plum: 'var(--c-plum)',
        night: 'var(--c-night)',
        dusk: 'var(--c-dusk)',
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        body: ['"Manrope Variable"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        xs: '3px',
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
      },
      boxShadow: {
        hair: '0 1px 2px rgba(28,26,23,.06)',
        lift: '0 8px 28px -10px rgba(28,26,23,.25)',
        panel: '0 24px 70px -24px rgba(14,12,22,.45)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.22,1,.36,1)',
        inOut: 'cubic-bezier(.65,0,.35,1)',
      },
      keyframes(/** @type {any} */) {
        return {}
      },
    },
  },
  plugins: [],
}
