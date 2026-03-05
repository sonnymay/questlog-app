/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'void': '#06060c',
        'abyss': '#0d0d1a',
        'dungeon': '#13131f',
        'stone': '#1a1a2e',
        'slate-deep': '#16213e',
        'gold': '#f0c040',
        'gold-dim': '#c9a227',
        'gold-dark': '#8a6b10',
        'rune': '#7c3aed',
        'rune-bright': '#a78bfa',
        'mana': '#3b82f6',
        'mana-bright': '#60a5fa',
        'blood': '#dc2626',
        'ember': '#f97316',
        'parchment': '#2a1f0e',
        'scroll': '#1e1608',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'exo': ['Exo 2', 'sans-serif'],
      },
      animation: {
        'level-up': 'levelUp 0.6s ease-out forwards',
        'xp-float': 'xpFloat 2s ease-out forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'flash-screen': 'flashScreen 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
        'portrait-in': 'portraitIn 0.5s ease-out',
        'card-in': 'cardIn 0.3s ease-out',
        'checkmark': 'checkmark 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        levelUp: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '60%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        xpFloat: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-80px)', opacity: '0' },
        },
        pulseGold: {
          '0%, 100%': { textShadow: '0 0 8px #f0c040' },
          '50%': { textShadow: '0 0 20px #f0c040, 0 0 40px #f0c040' },
        },
        flashScreen: {
          '0%': { opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(124, 58, 237, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.9), 0 0 40px rgba(59, 130, 246, 0.4)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        portraitIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        cardIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        checkmark: {
          '0%': { transform: 'scale(0)' },
          '60%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'gold': '0 0 15px rgba(240, 192, 64, 0.4)',
        'gold-lg': '0 0 30px rgba(240, 192, 64, 0.6)',
        'rune': '0 0 15px rgba(124, 58, 237, 0.5)',
        'rune-lg': '0 0 30px rgba(124, 58, 237, 0.7)',
        'mana': '0 0 15px rgba(59, 130, 246, 0.5)',
        'inner-dark': 'inset 0 2px 8px rgba(0,0,0,0.8)',
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0h1v40H0zM39 0h1v40h-1zM0 0h40v1H0zM0 39h40v1H0z' fill='rgba(240,192,64,0.03)'/%3E%3C/svg%3E\")",
        'radial-glow': 'radial-gradient(ellipse at center, rgba(124,58,237,0.1) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
};
