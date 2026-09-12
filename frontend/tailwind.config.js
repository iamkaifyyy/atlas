/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cohere Brand Colors (DESIGN.md)
        'cohere-black': '#000000',
        'cohere-primary': '#17171c',
        primary: '#17171c',
        ink: '#212121',
        'deep-green': '#003c33',
        'dark-navy': '#071829',
        'soft-stone': '#eeece7',
        'pale-green': '#edfce9',
        'pale-blue': '#f1f5ff',
        hairline: '#d9d9dd',
        'border-light': '#e5e7eb',
        'card-border': '#f2f2f2',
        muted: '#93939f',
        slate: '#75758a',
        'body-muted': '#616161',
        'action-blue': '#1863dc',
        'focus-blue': '#4c6ee6',
        coral: '#ff7759',
        'coral-soft': '#ffad9b',
        'form-focus': '#9b60aa',
        error: '#b30000',

        // Dark Agent Console Palettes
        'console-bg': '#0e0e12',
        'console-surface': '#17171c',
        'console-elevated': '#1f1f26',
        'console-border': '#2a2a35',

        // Backward compatibility mappings
        canvas: '#ffffff',
        'surface-1': '#17171c',
        'surface-2': '#1f1f26',
        'surface-elevated': '#1f1f26',
        'ink-muted': '#93939f',
        border: '#2a2a35',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '22px',
        xl: '30px',
        pill: '32px',
        full: '9999px',
      },
      letterSpacing: {
        'display-hero': '-1.92px',
        'display-product': '-1.44px',
        'display-section': '-1.2px',
        'mono-label': '0.28px',
        tight: '-0.04em',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
};
