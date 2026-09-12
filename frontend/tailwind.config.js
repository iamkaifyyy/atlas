/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#121215',
        'surface-elevated': '#1a1a1f',
        border: '#27272a',
        primary: {
          DEFAULT: '#f4f4f5',
          hover: '#e4e4e7',
          glow: 'rgba(255, 255, 255, 0.08)',
        },
        accent: {
          green: '#10b981',
          red: '#f43f5e',
          amber: '#f59e0b',
          zinc: '#a1a1aa',
        }
      },
    },
  },
  plugins: [],
};
