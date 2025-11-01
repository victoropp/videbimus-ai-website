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
      typography: {
        DEFAULT: {
          css: {
            // Videbimus AI Brand Colors (Cyan-to-Purple Gradient Theme)
            '--tw-prose-body': '#2D3436',
            '--tw-prose-headings': '#0A2540',
            '--tw-prose-links': '#06b6d4', // Cyan
            '--tw-prose-bold': '#0A2540',
            '--tw-prose-code': '#a855f7', // Purple
            '--tw-prose-quotes': '#194670',
            '--tw-prose-counters': '#636E72',
            '--tw-prose-bullets': '#06b6d4',
            '--tw-prose-hr': '#DFE6E9',
            '--tw-prose-th-borders': '#194670',
            '--tw-prose-td-borders': '#DFE6E9',

            maxWidth: 'none',
            lineHeight: '1.8',
            fontSize: '1.125rem',
            color: 'var(--tw-prose-body)',

            // Headings - Professional hierarchy with gradient accents
            h1: {
              fontFamily: 'var(--font-jakarta)',
              fontWeight: '700',
              fontSize: '2.5rem',
              lineHeight: '1.2',
              marginTop: '0',
              marginBottom: '2rem',
              color: 'var(--tw-prose-headings)',
              background: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            },
            h2: {
              fontFamily: 'var(--font-jakarta)',
              fontWeight: '600',
              fontSize: '2rem',
              lineHeight: '1.3',
              marginTop: '3rem',
              marginBottom: '1.5rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid transparent',
              borderImage: 'linear-gradient(90deg, #06b6d4, #a855f7) 1',
              color: 'var(--tw-prose-headings)',
              scrollMarginTop: '6rem', // For TOC navigation
            },
            h3: {
              fontFamily: 'var(--font-jakarta)',
              fontWeight: '600',
              fontSize: '1.5rem',
              lineHeight: '1.4',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--tw-prose-headings)',
              scrollMarginTop: '6rem',
            },
            h4: {
              fontFamily: 'var(--font-jakarta)',
              fontWeight: '600',
              fontSize: '1.25rem',
              lineHeight: '1.5',
              marginTop: '2rem',
              marginBottom: '0.75rem',
              color: 'var(--tw-prose-headings)',
            },
            h5: {
              fontFamily: 'var(--font-jakarta)',
              fontWeight: '600',
              fontSize: '1.125rem',
              lineHeight: '1.6',
              marginTop: '1.75rem',
              marginBottom: '0.5rem',
            },
            h6: {
              fontFamily: 'var(--font-jakarta)',
              fontWeight: '600',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
            },

            // Paragraphs - Optimal reading experience
            p: {
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
              lineHeight: '1.8',
            },

            // Links - Cyan brand color with smooth transitions
            a: {
              color: 'var(--tw-prose-links)',
              textDecoration: 'underline',
              fontWeight: '500',
              textDecorationColor: 'rgba(6, 182, 212, 0.3)',
              textUnderlineOffset: '3px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                color: '#0891b2', // Darker cyan
                textDecorationColor: 'rgba(6, 182, 212, 0.8)',
                textDecorationThickness: '2px',
              },
            },

            // Strong/Bold
            strong: {
              color: 'var(--tw-prose-bold)',
              fontWeight: '600',
            },

            // Emphasis
            em: {
              fontStyle: 'italic',
              color: 'inherit',
            },

            // Inline Code - Purple accent
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            code: {
              color: 'var(--tw-prose-code)',
              backgroundColor: '#F0F3F4',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              fontWeight: '500',
              fontSize: '0.875em',
              fontFamily: 'var(--font-jetbrains)',
            },

            // Pre/Code blocks - Professional dark theme
            pre: {
              backgroundColor: '#1E1E1E',
              color: '#D4D4D4',
              borderRadius: '0.5rem',
              padding: '0',
              marginTop: '2rem',
              marginBottom: '2rem',
              overflow: 'hidden',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              padding: '0',
              fontWeight: '400',
              fontSize: '0.875em',
            },

            // Lists - Cyan bullets for brand consistency
            ul: {
              listStyleType: 'disc',
              paddingLeft: '1.75rem',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            'ul > li': {
              paddingLeft: '0.5rem',
            },
            'ul > li::marker': {
              color: 'var(--tw-prose-bullets)',
            },
            ol: {
              listStyleType: 'decimal',
              paddingLeft: '1.75rem',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            'ol > li': {
              paddingLeft: '0.5rem',
            },
            'ol > li::marker': {
              color: 'var(--tw-prose-counters)',
              fontWeight: '600',
            },
            li: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            'li > ul, li > ol': {
              marginTop: '0.75rem',
              marginBottom: '0.75rem',
            },

            // Blockquotes - Cyan accent with gradient
            blockquote: {
              borderLeftWidth: '4px',
              borderLeftColor: '#06b6d4',
              paddingLeft: '1.5rem',
              fontStyle: 'italic',
              color: 'var(--tw-prose-quotes)',
              backgroundColor: '#F8F9FA',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              marginTop: '2rem',
              marginBottom: '2rem',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
              position: 'relative',
            },
            'blockquote::before': {
              content: '""',
              position: 'absolute',
              left: '0',
              top: '0',
              bottom: '0',
              width: '4px',
              background: 'linear-gradient(180deg, #06b6d4 0%, #a855f7 100%)',
              borderRadius: '0 0.5rem 0.5rem 0',
            },
            'blockquote p:first-of-type::before': { content: 'open-quote' },
            'blockquote p:last-of-type::after': { content: 'close-quote' },

            // Tables - Brand-colored headers
            table: {
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0',
              marginTop: '2rem',
              marginBottom: '2rem',
              fontSize: '0.9375em',
              lineHeight: '1.7',
              overflow: 'hidden',
              borderRadius: '0.5rem',
              border: '1px solid var(--tw-prose-td-borders)',
            },
            thead: {
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            },
            th: {
              color: 'white',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: '600',
              verticalAlign: 'bottom',
              fontFamily: 'var(--font-jakarta)',
            },
            'thead th:first-child': {
              borderTopLeftRadius: '0.5rem',
            },
            'thead th:last-child': {
              borderTopRightRadius: '0.5rem',
            },
            'tbody tr': {
              borderBottomWidth: '1px',
              borderBottomColor: 'var(--tw-prose-td-borders)',
            },
            'tbody tr:hover': {
              backgroundColor: 'rgba(6, 182, 212, 0.05)',
            },
            'tbody tr:last-child': {
              borderBottomWidth: '0',
            },
            td: {
              padding: '1rem',
              verticalAlign: 'top',
            },

            // Images - Enhanced shadows
            img: {
              borderRadius: '0.75rem',
              marginTop: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            },

            // Horizontal rules - Gradient
            hr: {
              border: 'none',
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, #06b6d4 50%, transparent 100%)',
              marginTop: '3rem',
              marginBottom: '3rem',
            },

            // Figure captions
            figcaption: {
              color: '#636e72',
              fontSize: '0.875em',
              lineHeight: '1.6',
              marginTop: '1rem',
              textAlign: 'center',
              fontStyle: 'italic',
            },

            // Keyboard keys
            kbd: {
              backgroundColor: '#F0F3F4',
              color: '#2D3436',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
              fontWeight: '600',
              fontFamily: 'var(--font-mono)',
              border: '1px solid #DFE6E9',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            },

            // Print optimizations
            '@media print': {
              fontSize: '12pt',
              lineHeight: '1.6',
              maxWidth: '100%',
              color: '#000',

              h1: {
                fontSize: '24pt',
                pageBreakAfter: 'avoid',
                color: '#000',
                background: 'none',
                WebkitTextFillColor: 'inherit',
              },
              h2: {
                fontSize: '20pt',
                pageBreakAfter: 'avoid',
                borderBottom: '2pt solid #000',
                color: '#000',
              },
              h3: {
                fontSize: '16pt',
                pageBreakAfter: 'avoid',
                color: '#000',
              },
              h4: {
                fontSize: '14pt',
                pageBreakAfter: 'avoid',
                color: '#000',
              },

              a: {
                color: '#000',
                textDecoration: 'underline',
              },
              'a[href]::after': {
                content: '" (" attr(href) ")"',
                fontSize: '0.8em',
              },

              pre: {
                border: '1pt solid #000',
                pageBreakInside: 'avoid',
                whiteSpace: 'pre-wrap',
              },
              code: {
                backgroundColor: '#f5f5f5',
                color: '#000',
              },

              blockquote: {
                border: 'none',
                borderLeft: '4pt solid #000',
                pageBreakInside: 'avoid',
                backgroundColor: 'transparent',
              },

              table: {
                borderCollapse: 'collapse',
                pageBreakInside: 'avoid',
              },
              th: {
                backgroundColor: '#f0f0f0',
                color: '#000',
                border: '1pt solid #000',
              },
              td: {
                border: '1pt solid #000',
              },

              img: {
                maxWidth: '100%',
                pageBreakInside: 'avoid',
              },
            },
          },
        },

        // Dark mode - Full theme
        dark: {
          css: {
            // Dark mode color variables
            '--tw-prose-body': '#E5E7EB',
            '--tw-prose-headings': '#FFFFFF',
            '--tw-prose-links': '#06b6d4',
            '--tw-prose-bold': '#FFFFFF',
            '--tw-prose-code': '#c084fc', // Lighter purple for dark mode
            '--tw-prose-quotes': '#D1D5DB',
            '--tw-prose-counters': '#9CA3AF',
            '--tw-prose-bullets': '#06b6d4',
            '--tw-prose-hr': '#374151',
            '--tw-prose-th-borders': '#1F2937',
            '--tw-prose-td-borders': '#374151',

            color: 'var(--tw-prose-body)',

            h1: {
              color: 'var(--tw-prose-headings)',
              background: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            },
            h2: {
              color: 'var(--tw-prose-headings)',
              borderImage: 'linear-gradient(90deg, #06b6d4, #a855f7) 1',
            },
            h3: {
              color: 'var(--tw-prose-headings)',
            },
            h4: {
              color: 'var(--tw-prose-headings)',
            },
            h5: {
              color: 'var(--tw-prose-headings)',
            },
            h6: {
              color: 'var(--tw-prose-headings)',
            },

            a: {
              color: 'var(--tw-prose-links)',
              textDecorationColor: 'rgba(6, 182, 212, 0.4)',
              '&:hover': {
                color: '#22d3ee', // Lighter cyan for dark mode
                textDecorationColor: 'rgba(34, 211, 238, 0.8)',
              },
            },

            strong: {
              color: 'var(--tw-prose-bold)',
            },

            code: {
              color: 'var(--tw-prose-code)',
              backgroundColor: '#1F2937',
            },

            pre: {
              backgroundColor: '#111827',
              borderColor: 'rgba(6, 182, 212, 0.3)',
            },

            'ul > li::marker': {
              color: 'var(--tw-prose-bullets)',
            },
            'ol > li::marker': {
              color: 'var(--tw-prose-counters)',
            },

            blockquote: {
              backgroundColor: '#1F2937',
              borderLeftColor: '#06b6d4',
              color: 'var(--tw-prose-quotes)',
            },
            'blockquote::before': {
              background: 'linear-gradient(180deg, #06b6d4 0%, #a855f7 100%)',
            },

            thead: {
              background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
            },
            th: {
              color: '#FFFFFF',
            },
            'tbody tr': {
              borderBottomColor: 'var(--tw-prose-td-borders)',
            },
            'tbody tr:hover': {
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
            },
            td: {
              color: 'var(--tw-prose-body)',
            },

            hr: {
              background: 'linear-gradient(90deg, transparent 0%, #06b6d4 50%, transparent 100%)',
            },

            figcaption: {
              color: '#9CA3AF',
            },

            kbd: {
              backgroundColor: '#374151',
              color: '#E5E7EB',
              borderColor: '#4B5563',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
}
export default config