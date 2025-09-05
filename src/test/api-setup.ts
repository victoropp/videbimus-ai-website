import { vi } from 'vitest'

// Mock Next.js API context
export const mockRequest = (options: {
  method?: string
  body?: any
  query?: Record<string, string>
  headers?: Record<string, string>
  cookies?: Record<string, string>
} = {}) => ({
  method: options.method || 'GET',
  body: options.body,
  query: options.query || {},
  headers: options.headers || {},
  cookies: options.cookies || {},
  json: async () => options.body,
})

export const mockResponse = () => {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
  }
  return response
}

// Mock Prisma
vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    post: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    consultation: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

// Mock NextAuth
vi.mock('next-auth/next', () => ({
  default: vi.fn().mockReturnValue({
    handlers: {
      GET: vi.fn(),
      POST: vi.fn(),
    },
  }),
}))

// Mock environment variables for tests
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NODE_ENV = 'test'