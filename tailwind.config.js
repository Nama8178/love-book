/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        cursive: ['"Great Vibes"', 'cursive'],
        handwriting: ['"Caveat"', 'cursive'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        gold: {
          100: '#fff9e6',
          200: '#fcedb9',
          300: '#f8de86',
          400: '#f3cd50',
          500: '#d4af37',
          600: '#b89225',
          700: '#946f18',
        },
        parchment: {
          50: '#fdfbf7',
          100: '#fbf7ee',
          200: '#f5edd9',
          300: '#ece0c1',
          400: '#e0cfa4',
          500: '#d1b984',
        }
      },
      boxShadow: {
        'page-left': '-10px 0 20px rgba(0,0,0,0.15)',
        'page-right': '10px 0 20px rgba(0,0,0,0.15)',
        'book': '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(212, 175, 55, 0.2)',
        'glow-gold': '0 0 25px rgba(212, 175, 55, 0.4)',
        'glow-rose': '0 0 25px rgba(244, 63, 94, 0.4)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
