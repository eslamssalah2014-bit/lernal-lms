/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#00212D',           // Primary Navy Logo Canvas
          surface: '#002B3B',      // Card Background
          'surface-card': '#003347', // Elevated Card
          'surface-hover': '#003D54', // Hover Surface
          border: '#004D6A',       // Subtle border
          'border-bright': '#00A9D6', // Accent border
          cyan: '#00A9D6',          // Primary Brand Cyan
          'bright-cyan': '#36C7F4', // Bright Neon Cyan
          'light-blue': '#8DDFFF',  // Soft Accent Blue
          ice: '#F5FAFC',           // Crisp White Text
          'text-dark': '#00212D',   // Dark contrast text
          'text-muted': '#94A3B8',  // Secondary description text
          'text-soft': '#CBD5E1',   // Subtitle text
        },
        // Complementary gamification accents for kids
        kid: {
          gold: '#FFB800',
          coral: '#FF6B4A',
          mint: '#10B981',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 25px -5px rgba(54, 199, 244, 0.35)',
        'cyan-glow-lg': '0 0 45px -10px rgba(0, 169, 214, 0.45)',
        'card-soft': '0 10px 30px -5px rgba(0, 15, 23, 0.6)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
