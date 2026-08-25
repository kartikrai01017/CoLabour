/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0c0e14',
          900: '#0c0e14',
          800: '#12151e',
          700: '#1a1e2e',
          600: '#242840',
          500: '#2e3350',
        },
        neon: {
          cyan: '#c5a059',
          purple: '#7c9a6b',
          blue: '#6b8db5',
          pink: '#c27a6e',
          green: '#7c9a6b',
          indigo: '#6b7eb5',
          gold: '#c5a059',
          sage: '#7c9a6b',
          warm: '#d4a574',
        },
        accent: {
          DEFAULT: '#c5a059',
          light: '#ddbb7a',
          dark: '#a8833e',
        },
        brass: {
          DEFAULT: '#c5a059',
          light: '#ddbb7a',
          dark: '#a8833e',
          muted: '#8a7340',
        },
        sage: {
          DEFAULT: '#7c9a6b',
          light: '#9ab88e',
          dark: '#5a7a4e',
          muted: '#6b8a5e',
        },
        cream: {
          DEFAULT: '#f5f0e8',
          muted: '#d4cfc4',
          dark: '#a8a29a',
        },
        surface: {
          DEFAULT: '#12151e',
          raised: '#1a1e2e',
          overlay: '#242840',
        },
        muted: {
          DEFAULT: '#8a8fa8',
          light: '#c4c8d8',
          dark: '#5a6080',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'float-reverse': 'floatReverse 8s ease-in-out infinite',
        'drift': 'drift 20s ease-in-out infinite',
        'drift-slow': 'drift 30s ease-in-out infinite',
        'rotate-slow': 'rotateSlow 25s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        'shimmer': 'shimmer 2s linear infinite',
        'confetti': 'confetti 1s ease-out forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'orbit': 'orbit 12s linear infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'float3d': 'float3d 20s ease-in-out infinite',
        'float3d-drift': 'float3dDrift 25s ease-in-out infinite',
        'rotate3d-slow': 'rotate3dSlow 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-15px) rotate(1deg)' },
          '66%': { transform: 'translateY(-8px) rotate(-1deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(12px) rotate(-1deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '50%': { transform: 'translate(-10px, 20px) scale(0.95)' },
          '75%': { transform: 'translate(-30px, -10px) scale(1.02)' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'brightness(1) blur(0px)' },
          '50%': { opacity: '1', filter: 'brightness(1.2) blur(1px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(300px) rotate(720deg)', opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(197,160,89,0.1), 0 0 60px rgba(197,160,89,0.03)' },
          '50%': { boxShadow: '0 0 30px rgba(197,160,89,0.18), 0 0 80px rgba(197,160,89,0.06)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(40px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(40px) rotate(-360deg)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
        float3d: {
          '0%, 100%': { transform: 'translateY(0) translateX(0) rotateX(0deg) rotateY(0deg)' },
          '25%': { transform: 'translateY(-20px) translateX(10px) rotateX(5deg) rotateY(8deg)' },
          '50%': { transform: 'translateY(-8px) translateX(-15px) rotateX(-3deg) rotateY(-5deg)' },
          '75%': { transform: 'translateY(-25px) translateX(5px) rotateX(4deg) rotateY(-3deg)' },
        },
        float3dDrift: {
          '0%, 100%': { transform: 'translateY(0) translateX(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg)' },
          '20%': { transform: 'translateY(-30px) translateX(20px) rotateX(10deg) rotateY(-12deg) rotateZ(5deg)' },
          '40%': { transform: 'translateY(10px) translateX(-25px) rotateX(-6deg) rotateY(8deg) rotateZ(-3deg)' },
          '60%': { transform: 'translateY(-15px) translateX(15px) rotateX(4deg) rotateY(-6deg) rotateZ(7deg)' },
          '80%': { transform: 'translateY(5px) translateX(-10px) rotateX(-8deg) rotateY(14deg) rotateZ(-4deg)' },
        },
        rotate3dSlow: {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)' },
          '100%': { transform: 'rotateX(360deg) rotateY(360deg) rotateZ(180deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(197,160,89,0.15), 0 0 60px rgba(197,160,89,0.04)',
        'neon-purple': '0 0 20px rgba(124,154,107,0.15), 0 0 60px rgba(124,154,107,0.04)',
        'neon-pink': '0 0 20px rgba(194,122,110,0.15), 0 0 60px rgba(194,122,110,0.04)',
        'neon-green': '0 0 20px rgba(124,154,107,0.15), 0 0 60px rgba(124,154,107,0.04)',
        'glass': '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
        'glass-lg': '0 16px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
        'depth': '0 20px 60px -10px rgba(0,0,0,0.7), 0 0 1px rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
};
