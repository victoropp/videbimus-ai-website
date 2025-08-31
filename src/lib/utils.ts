/**
 * Core utility functions for the application
 * @fileoverview Main utility functions including Tailwind CSS class merging and common helpers
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Re-export utility functions from dedicated modules
export * from '@/utils/format';
export * from '@/utils/validation';
export * from '@/utils/helpers';

/**
 * Combines and merges Tailwind CSS classes with clsx
 * @param inputs - Class values to combine
 * @returns Merged class string
 * 
 * @example
 * ```typescript
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': true }) 
 * // "px-4 py-2 bg-blue-500 text-white"
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Creates a CSS custom property (variable) string
 * @param name - The CSS variable name (without --)
 * @param value - The CSS variable value
 * @returns CSS custom property string
 * 
 * @example
 * ```typescript
 * cssVar('primary-color', '#3b82f6') // '--primary-color: #3b82f6;'
 * ```
 */
export function cssVar(name: string, value: string): string {
  return `--${name}: ${value};`;
}

/**
 * Converts a hex color to HSL
 * @param hex - Hex color string (with or without #)
 * @returns HSL values as object
 * 
 * @example
 * ```typescript
 * hexToHsl('#3b82f6') // { h: 217, s: 91, l: 60 }
 * ```
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  
  if (!result) {
    throw new Error('Invalid hex color');
  }
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number;
  let s: number;
  const l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0; break;
    }
    
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Converts HSL to hex color
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color string
 * 
 * @example
 * ```typescript
 * hslToHex(217, 91, 60) // "#3b82f6"
 * ```
 */
export function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  const r = hue2rgb(p, q, h + 1/3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1/3);
  
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Calculates contrast ratio between two colors
 * @param color1 - First color (hex)
 * @param color2 - Second color (hex)
 * @returns Contrast ratio (1-21)
 * 
 * @example
 * ```typescript
 * getContrastRatio('#000000', '#ffffff') // 21
 * ```
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToHsl(hex);
    const { r, g, b } = {
      r: rgb.h / 255,
      g: rgb.s / 255,
      b: rgb.l / 255
    };
    
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Checks if a color meets WCAG contrast requirements
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param level - WCAG level ('AA' or 'AAA')
 * @param size - Text size ('normal' or 'large')
 * @returns Whether the contrast is sufficient
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  const requirements = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 }
  };
  
  return ratio >= requirements[level][size];
}

/**
 * Creates a range of numbers
 * @param start - Start number
 * @param end - End number
 * @param step - Step size (default: 1)
 * @returns Array of numbers
 * 
 * @example
 * ```typescript
 * range(1, 5) // [1, 2, 3, 4, 5]
 * range(0, 10, 2) // [0, 2, 4, 6, 8, 10]
 * ```
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  
  if (step > 0) {
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i >= end; i += step) {
      result.push(i);
    }
  }
  
  return result;
}

/**
 * Clamps a number between a minimum and maximum value
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 * 
 * @example
 * ```typescript
 * clamp(15, 0, 10) // 10
 * clamp(-5, 0, 10) // 0
 * clamp(5, 0, 10) // 5
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param start - Start value
 * @param end - End value
 * @param factor - Interpolation factor (0-1)
 * @returns Interpolated value
 * 
 * @example
 * ```typescript
 * lerp(0, 100, 0.5) // 50
 * lerp(10, 20, 0.25) // 12.5
 * ```
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * clamp(factor, 0, 1);
}

/**
 * Maps a value from one range to another
 * @param value - Input value
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns Mapped value
 * 
 * @example
 * ```typescript
 * mapRange(5, 0, 10, 0, 100) // 50
 * mapRange(75, 0, 100, 0, 1) // 0.75
 * ```
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Legacy functions for backward compatibility
/** @deprecated Use formatDate from @/utils/format instead */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

/** @deprecated Use slugify from @/utils/helpers instead */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

/** @deprecated Use debounce from @/utils/helpers instead */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/** @deprecated Use throttle from @/utils/helpers instead */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/** @deprecated Use generateId from @/utils/helpers instead */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};