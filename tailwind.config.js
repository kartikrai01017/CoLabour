/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'nb-bg': '#F3F1EA',
        'nb-surface': '#FFFFFF',
        'nb-surface-muted': '#E7E4DC',
        'nb-ink': '#171717',
        'nb-text-muted': '#66635D',
        'nb-accent-yellow': '#F4B942',
        'nb-accent-orange': '#E88600',
        'nb-accent-blue': '#86B7FF',
        'nb-accent-green': '#A8C98A',
        'nb-accent-pink': '#E9A6B5',
        'nb-accent-red': '#E85D5D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'nb-sm': '6px',
        'nb-md': '8px',
        'nb-lg': '12px',
        'nb-xl': '16px',
        'nb-2xl': '20px',
      },
      boxShadow: {
        'nb-sm': '3px 3px 0 #171717',
        'nb-md': '4px 4px 0 #171717',
        'nb-lg': '5px 5px 0 #171717',
        'nb-xl': '8px 8px 0 #171717',
        'nb-xl-orange': '8px 8px 0 #E88600',
        'nb-md-blue': '4px 4px 0 #86B7FF',
        'nb-pressed': '1px 1px 0 #171717',
        'nb-pressed-orange': '1px 1px 0 #E88600',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};