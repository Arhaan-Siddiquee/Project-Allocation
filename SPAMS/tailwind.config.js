/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Syne"', 'sans-serif'],
        'body': ['"DM Sans"', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        'void': '#050508',
        'surface': '#0d0d14',
        'panel': '#12121c',
        'border': '#1e1e2e',
        'accent': '#6366f1',
        'accent-dim': '#4f46e5',
        'accent-glow': '#818cf8',
        'emerald-accent': '#10b981',
        'amber-accent': '#f59e0b',
        'rose-accent': '#f43f5e',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-muted': '#475569',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '32px 32px',
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(99,102,241,0.15)',
        'glow': '0 0 40px rgba(99,102,241,0.2)',
        'glow-lg': '0 0 80px rgba(99,102,241,0.25)',
      },
    },
  },
  plugins: [],
}
