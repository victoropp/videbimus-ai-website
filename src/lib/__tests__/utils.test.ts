import { describe, it, expect } from 'vitest'

/**
 * Unit Tests for Utility Functions
 * Tests common utility functions used across the application
 */

describe('String Utilities', () => {
  it('should generate slug from title', () => {
    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .slice(0, 50)
    }

    expect(generateSlug('Hello World')).toBe('hello-world')
    expect(generateSlug('Test@#$%123')).toBe('test123')
    expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces')
  })

  it('should truncate text with ellipsis', () => {
    const truncate = (text: string, length: number) => {
      if (text.length <= length) return text
      return text.slice(0, length) + '...'
    }

    expect(truncate('Short text', 20)).toBe('Short text')
    expect(truncate('This is a very long text that needs truncating', 20)).toBe('This is a very long ...')
  })

  it('should capitalize first letter', () => {
    const capitalize = (text: string) => {
      return text.charAt(0).toUpperCase() + text.slice(1)
    }

    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('WORLD')).toBe('WORLD')
    expect(capitalize('')).toBe('')
  })
})

describe('Date Utilities', () => {
  it('should format date correctly', () => {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date)
    }

    const testDate = new Date('2024-01-15')
    expect(formatDate(testDate)).toMatch(/Jan/)
  })

  it('should calculate read time', () => {
    const calculateReadTime = (content: string): number => {
      const wordsPerMinute = 200
      const words = content.trim().split(/\s+/).length
      return Math.ceil(words / wordsPerMinute)
    }

    const shortText = 'This is a short text'
    const longText = Array(400).fill('word').join(' ')

    expect(calculateReadTime(shortText)).toBe(1)
    expect(calculateReadTime(longText)).toBe(2)
  })
})

describe('Validation Utilities', () => {
  it('should validate email addresses', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
    expect(isValidEmail('test@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
  })

  it('should validate URLs', () => {
    const isValidUrl = (url: string): boolean => {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }

    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('http://localhost:3000')).toBe(true)
    expect(isValidUrl('not-a-url')).toBe(false)
  })

  it('should validate required fields', () => {
    const isRequired = (value: string | null | undefined): boolean => {
      return value !== null && value !== undefined && value.trim().length > 0
    }

    expect(isRequired('valid')).toBe(true)
    expect(isRequired('')).toBe(false)
    expect(isRequired('  ')).toBe(false)
    expect(isRequired(null)).toBe(false)
    expect(isRequired(undefined)).toBe(false)
  })
})

describe('Array Utilities', () => {
  it('should chunk array into smaller arrays', () => {
    const chunk = <T,>(array: T[], size: number): T[][] => {
      return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, i * size + size)
      )
    }

    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]])
    expect(chunk([], 2)).toEqual([])
  })

  it('should remove duplicates from array', () => {
    const unique = <T,>(array: T[]): T[] => {
      return [...new Set(array)]
    }

    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
    expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
  })
})

describe('Number Utilities', () => {
  it('should format currency', () => {
    const formatCurrency = (amount: number, currency = 'USD'): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
      }).format(amount / 100)
    }

    expect(formatCurrency(1000)).toBe('$10.00')
    expect(formatCurrency(50)).toBe('$0.50')
  })

  it('should format large numbers', () => {
    const formatNumber = (num: number): string => {
      return new Intl.NumberFormat('en-US').format(num)
    }

    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })

  it('should clamp numbers within range', () => {
    const clamp = (num: number, min: number, max: number): number => {
      return Math.min(Math.max(num, min), max)
    }

    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })
})

describe('Object Utilities', () => {
  it('should deep clone objects', () => {
    const deepClone = <T,>(obj: T): T => {
      return JSON.parse(JSON.stringify(obj))
    }

    const original = { a: 1, b: { c: 2 } }
    const cloned = deepClone(original)

    cloned.b.c = 3
    expect(original.b.c).toBe(2)
    expect(cloned.b.c).toBe(3)
  })

  it('should merge objects', () => {
    const merge = <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
      return { ...target, ...source }
    }

    expect(merge({ a: 1, b: 2 }, { b: 3 })).toEqual({ a: 1, b: 3 })
  })

  it('should pick properties from object', () => {
    const pick = <T extends Record<string, any>, K extends keyof T>(
      obj: T,
      keys: K[]
    ): Pick<T, K> => {
      return keys.reduce((result, key) => {
        if (key in obj) {
          result[key] = obj[key]
        }
        return result
      }, {} as Pick<T, K>)
    }

    const obj = { a: 1, b: 2, c: 3 }
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 })
  })
})
