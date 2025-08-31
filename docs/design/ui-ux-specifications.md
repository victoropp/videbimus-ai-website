# UI/UX Design Specifications - Vidibemus AI

## Design System Overview

### Core Design Principles

1. **Clarity** - Information hierarchy and clear navigation
2. **Trust** - Professional, reliable visual language
3. **Innovation** - Modern, cutting-edge aesthetics
4. **Accessibility** - WCAG 2.1 AA compliance
5. **Performance** - Optimized for speed and efficiency

## Color System

### Primary Colors

```css
:root {
  /* Primary Brand Colors */
  --color-primary-900: #051e34;    /* Deep Ocean Blue - Darkest */
  --color-primary-800: #0A2540;    /* Deep Ocean Blue - Dark */
  --color-primary-700: #0f3050;
  --color-primary-600: #143b60;
  --color-primary-500: #194670;    /* Base */
  --color-primary-400: #4d6a89;
  --color-primary-300: #728ba5;
  --color-primary-200: #a4b5c7;
  --color-primary-100: #d1dae3;
  --color-primary-50: #eef2f5;

  /* Accent Colors */
  --color-cyan-500: #00E5FF;       /* Electric Cyan */
  --color-cyan-400: #40EEFF;
  --color-cyan-600: #00B8CC;

  --color-purple-500: #6C5CE7;     /* Quantum Purple */
  --color-purple-400: #8B7EEA;
  --color-purple-600: #5442D3;

  --color-green-500: #00B894;      /* Neural Green */
  --color-green-400: #00D9A6;
  --color-green-600: #009975;
}
```

### Semantic Colors

```css
:root {
  /* Status Colors */
  --color-success: #00B894;
  --color-warning: #FDCB6E;
  --color-error: #FF6B6B;
  --color-info: #4ECDC4;

  /* Neutral Colors */
  --color-gray-900: #1A1A1A;
  --color-gray-800: #2D3436;
  --color-gray-700: #4A4A4A;
  --color-gray-600: #636E72;
  --color-gray-500: #95A5A6;
  --color-gray-400: #B2BEC3;
  --color-gray-300: #DFE6E9;
  --color-gray-200: #F0F3F4;
  --color-gray-100: #F8F9FA;
  --color-white: #FFFFFF;
}
```

## Typography System

### Font Stack

```css
:root {
  /* Primary Font */
  --font-primary: 'Inter', system-ui, -apple-system, sans-serif;
  
  /* Display Font for Headlines */
  --font-display: 'Plus Jakarta Sans', var(--font-primary);
  
  /* Monospace for Code */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Type Scale

```css
/* Desktop Typography */
.text-display-2xl { font-size: 4.5rem; line-height: 1.1; }  /* 72px */
.text-display-xl  { font-size: 3.75rem; line-height: 1.1; } /* 60px */
.text-display-lg  { font-size: 3rem; line-height: 1.2; }    /* 48px */
.text-display-md  { font-size: 2.25rem; line-height: 1.3; } /* 36px */
.text-display-sm  { font-size: 1.875rem; line-height: 1.3; }/* 30px */

.text-xl    { font-size: 1.25rem; line-height: 1.75; }  /* 20px */
.text-lg    { font-size: 1.125rem; line-height: 1.75; } /* 18px */
.text-base  { font-size: 1rem; line-height: 1.75; }     /* 16px */
.text-sm    { font-size: 0.875rem; line-height: 1.5; }  /* 14px */
.text-xs    { font-size: 0.75rem; line-height: 1.5; }   /* 12px */
```

## Spacing System

```css
:root {
  /* Base unit: 4px */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
}
```

## Component Specifications

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, var(--color-cyan-500), var(--color-purple-500));
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(108, 92, 231, 0.25);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  border: 2px solid var(--color-primary-500);
  color: var(--color-primary-500);
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--color-gray-700);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}
```

### Cards

```css
/* Glass Card */
.card-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

/* Neumorphic Card */
.card-neumorphic {
  background: #f0f0f3;
  border-radius: 16px;
  box-shadow: 
    20px 20px 60px #bebebe,
    -20px -20px 60px #ffffff;
  padding: 24px;
}

/* Standard Card */
.card-standard {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  padding: 24px;
  transition: box-shadow 0.3s ease;
}
```

### Form Elements

```css
/* Input Field */
.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--color-gray-300);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
}

.input-field:focus {
  border-color: var(--color-cyan-500);
  box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.1);
  outline: none;
}

/* Select Dropdown */
.select-field {
  appearance: none;
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1.5px solid var(--color-gray-300);
  border-radius: 8px;
  background: white url('dropdown-arrow.svg') no-repeat right 16px center;
}

/* Checkbox & Radio */
.checkbox, .radio {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-gray-400);
  border-radius: 4px; /* 50% for radio */
  transition: all 0.2s ease;
}
```

## Layout Patterns

### Grid System

```css
/* 12-Column Grid */
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}

.grid {
  display: grid;
  gap: 24px;
}

.grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
.grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
```

### Responsive Breakpoints

```css
/* Mobile First Approach */
/* Default: 0-639px (Mobile) */
@media (min-width: 640px) { /* sm: Tablet Portrait */ }
@media (min-width: 768px) { /* md: Tablet Landscape */ }
@media (min-width: 1024px) { /* lg: Desktop */ }
@media (min-width: 1280px) { /* xl: Large Desktop */ }
@media (min-width: 1536px) { /* 2xl: Extra Large */ }
```

## Animation Guidelines

### Micro-interactions

```css
/* Button Hover */
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* Card Hover */
.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}

/* Link Hover */
.link:hover {
  color: var(--color-cyan-500);
  text-decoration: underline;
  text-underline-offset: 4px;
}
```

### Page Transitions

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Slide In */
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* Scale In */
@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

## Dark Mode Specifications

```css
[data-theme="dark"] {
  --bg-primary: #0A0A0A;
  --bg-secondary: #1A1A1A;
  --bg-tertiary: #2A2A2A;
  
  --text-primary: #F8F9FA;
  --text-secondary: #B2BEC3;
  --text-tertiary: #95A5A6;
  
  --border-color: #2D3436;
  
  /* Glass effect for dark mode */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

## Accessibility Guidelines

### Focus States

```css
/* Visible focus indicator */
*:focus-visible {
  outline: 2px solid var(--color-cyan-500);
  outline-offset: 2px;
}

/* Skip to main content */
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 999;
  padding: 16px;
  background: var(--color-primary-800);
  color: white;
  text-decoration: none;
}

.skip-link:focus {
  left: 0;
}
```

### ARIA Labels

- All interactive elements must have descriptive labels
- Form fields must have associated labels
- Images must have alt text
- Icons must have aria-label or sr-only text

### Contrast Ratios

- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

## Loading States

```css
/* Skeleton Loading */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 0%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-gray-200);
  border-top-color: var(--color-cyan-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## Icon System

- **Icon Library**: Heroicons, Tabler Icons
- **Icon Size**: 20px (default), 16px (small), 24px (large)
- **Icon Color**: Inherit from parent text color
- **Icon Weight**: 1.5px stroke width

## Special Effects

### Glassmorphism

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Gradient Borders

```css
.gradient-border {
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, var(--color-cyan-500), var(--color-purple-500)) border-box;
  border: 2px solid transparent;
  border-radius: 12px;
}
```

### Glow Effects

```css
.glow {
  box-shadow: 
    0 0 20px rgba(0, 229, 255, 0.5),
    0 0 40px rgba(0, 229, 255, 0.3),
    0 0 60px rgba(0, 229, 255, 0.1);
}
```

## Performance Considerations

1. **Lazy Loading** - Images below the fold
2. **Code Splitting** - Route-based splitting
3. **Font Loading** - font-display: swap
4. **Image Optimization** - WebP with fallbacks
5. **CSS Optimization** - PurgeCSS for production

## Design Tokens Export

These design tokens should be exported to:
- Tailwind config
- CSS variables
- Design tools (Figma, Sketch)
- Component library
- Documentation