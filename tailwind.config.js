/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '85': '0.85',
      }
    },
    colors: {
      white: '#ffffff',
      black: '#000000',
      transparent: 'transparent',
      current: 'currentColor',
      // Custom color palette using CSS variables
      primary: 'var(--color-primary)',
      background: {
        DEFAULT: 'var(--color-background)',
      },
      card: {
        DEFAULT: 'var(--color-card)',
      },
      text: {
        DEFAULT: 'var(--color-text)', // Assuming you have --color-text for light mode
        dark: 'var(--color-text)', // For dark mode, this will be overridden by .dark --color-text
      },
      status: {
        healthy: 'var(--color-status-healthy)',
        warning: 'var(--color-status-warning)',
        critical: 'var(--color-status-critical)',
      },
      grid: {
        DEFAULT: 'var(--color-grid)',
      },
      navbar: {
        DEFAULT: 'var(--color-navbar)',
      },
      hover: {
        DEFAULT: 'var(--color-hover)',
      },
      // Keep original color palette for compatibility
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
      red: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },
    },
  },
  plugins: [],
  safelist: [
    { pattern: /bg-/ },
    { pattern: /text-/ },
    { pattern: /border-/ },
    { pattern: /backdrop-/ },
  ],
} 