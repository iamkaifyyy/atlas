/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#090909',
        background: '#090909',
        'surface-1': '#141414',
        surface: '#141414',
        'surface-2': '#1c1c1c',
        'surface-elevated': '#1c1c1c',
        hairline: '#262626',
        'hairline-soft': '#1a1a1a',
        border: '#262626',
        ink: '#ffffff',
        'ink-muted': '#999999',
        'accent-blue': '#0099ff',
        'gradient-violet': '#6a4cf5',
        'gradient-magenta': '#d44df0',
        'gradient-orange': '#ff7a3d',
        'gradient-coral': '#ff5577',
        'semantic-success': '#22c55e',
        accent: {
          green: '#22c55e',
          red: '#f43f5e',
          amber: '#f59e0b',
          zinc: '#999999',
        }
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '15px',
        xl: '20px',
        xxl: '30px',
        pill: '100px',
      },
      letterSpacing: {
        'display-xxl': '-0.05em',
        'display-xl': '-0.045em',
        'display-lg': '-0.04em',
        'display-md': '-0.03em',
        headline: '-0.025em',
      }
    },
  },
  plugins: [],
};
