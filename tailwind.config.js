/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-teal': '#4ECDC4',
        'brand-pink': '#FF6B9D',
        'brand-sky': '#95E1D3',
        'brand-peach': '#FFD3B6',
        'brand-lavender': '#B8A9E8',
        'pastel-yellow': '#FFF9C4',
        'pastel-green': '#C8E6C9',
        'primary': {
          100: '#E0F7F5',
          300: '#81DCD6',
          500: '#4ECDC4',
        },
        'accent': {
          300: '#FF96BA',
        }
      },
      borderRadius: {
        'nest': '40px 120px 40px 120px / 120px 40px 120px 40px',
        'blob': '64% 36% 47% 53% / 55% 48% 52% 45%',
        'blob-2': '47% 53% 42% 58% / 63% 56% 44% 37%',
        'blob-3': '38% 62% 63% 37% / 41% 44% 56% 59%',
      },
      boxShadow: {
        'blob': '0 10px 40px rgba(78, 205, 196, 0.2)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        '3xl': '0 20px 60px rgba(0, 0, 0, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Quicksand', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'in': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
