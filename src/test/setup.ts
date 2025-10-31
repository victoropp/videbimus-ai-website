/**
 * Vitest Setup File
 *
 * This file runs before all tests and configures the test environment.
 */

import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock tRPC Provider
vi.mock('@/lib/trpc/provider', () => ({
  TRPCProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Setup global test utilities
globalThis.IS_REACT_ACT_ENVIRONMENT = true
