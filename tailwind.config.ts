import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          50: '#eef2f5',
          100: '#d1dae3',
          200: '#a4b5c7',
          300: '#728ba5',
          400: '#4d6a89',
          500: '#194670', // Base
          600: '#143b60',
          700: '#0f3050',
          800: '#0A2540',
          900: '#051e34',
        },
        // Accent Colors
        cyan: {
          400: '#40EEFF',
          500: '#00E5FF',
          600: '#00B8CC',
        },
        purple: {
          400: '#8B7EEA',
          500: '#6C5CE7',
          600: '#5442D3',
        },
        green: {
          400: '#00D9A6',
          500: '#00B894',
          600: '#009975',
        },
        // Semantic Colors
        success: '#00B894',
        warning: '#FDCB6E',
        error: '#FF6B6B',
        info: '#4ECDC4',
        // Custom neutral colors
        gray: {
          50: '#F8F9FA',
          100: '#F0F3F4',
          200: '#DFE6E9',
          300: '#B2BEC3',
          400: '#B2BEC3',
          500: '#95A5A6',
          600: '#636E72',
          700: '#4A4A4A',
          800: '#2D3436',
          900: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1' }],
        'display-lg': ['3rem', { lineHeight: '1.2' }],
        'display-md': ['2.25rem', { lineHeight: '1.3' }],
        'display-sm': ['1.875rem', { lineHeight: '1.3' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 229, 255, 0.8), 0 0 60px rgba(108, 92, 231, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        skeleton: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(108, 92, 231, 0.5)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config