import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET, HEAD } from './route'
import { NextRequest } from 'next/server'

// Mock Prisma
const mockPrisma = {
  $queryRaw: vi.fn(),
}

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock Redis
vi.mock('redis', () => ({
  createClient: vi.fn().mockReturnValue({
    ping: vi.fn().mockResolvedValue('PONG'),
    quit: vi.fn().mockResolvedValue(undefined),
  }),
}))

// Mock environment variables
const originalEnv = process.env

beforeEach(() => {
  vi.clearAllMocks()
  process.env = {
    ...originalEnv,
    NODE_ENV: 'test',
    NEXTAUTH_SECRET: 'test-secret',
    OPENAI_API_KEY: 'test-openai-key',
    ANTHROPIC_API_KEY: 'test-anthropic-key',
    PINECONE_API_KEY: 'test-pinecone-key',
    REDIS_URL: 'redis://localhost:6379',
    npm_package_version: '1.0.0',
  }
})

afterEach(() => {
  process.env = originalEnv
})

describe('/api/health', () => {
  describe('GET', () => {
    it('returns healthy status when all services are working', async () => {
      // Mock successful database query
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('healthy')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('uptime')
      expect(data).toHaveProperty('version', '1.0.0')
      expect(data).toHaveProperty('environment', 'test')
      expect(data.database.status).toBe('connected')
      expect(data.database.latency).toMatch(/\d+ms/)
    })

    it('includes memory usage information', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }])

      const response = await GET()
      const data = await response.json()

      expect(data.memory).toHaveProperty('used')
      expect(data.memory).toHaveProperty('total')
      expect(data.memory).toHaveProperty('external')
      expect(typeof data.memory.used).toBe('number')
      expect(typeof data.memory.total).toBe('number')
      expect(typeof data.memory.external).toBe('number')
    })

    it('checks service configurations correctly', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }])

      const response = await GET()
      const data = await response.json()

      expect(data.services).toHaveProperty('redis')
      expect(data.services).toHaveProperty('auth')
      expect(data.services).toHaveProperty('ai')

      // Auth should be configured when NEXTAUTH_SECRET is present
      expect(data.services.auth.status).toBe('configured')

      // AI services should be partially configured
      expect(data.services.ai.status).toBe('partially_configured')
      expect(data.services.ai.services.openai).toBe('configured')
      expect(data.services.ai.services.anthropic).toBe('configured')
      expect(data.services.ai.services.pinecone).toBe('configured')
    })

    it('returns unhealthy status when database fails', async () => {
      // Mock database connection failure
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Database connection failed'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('unhealthy')
      expect(data.error).toBe('Database connection failed')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('uptime')
    })

    it('handles missing environment variables gracefully', async () => {
      // Remove environment variables
      delete process.env.NEXTAUTH_SECRET
      delete process.env.OPENAI_API_KEY
      delete process.env.ANTHROPIC_API_KEY
      delete process.env.PINECONE_API_KEY

      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.services.auth.status).toBe('misconfigured')
      expect(data.services.ai.status).toBe('not_configured')
      expect(data.services.ai.services.openai).toBe('unknown')
      expect(data.services.ai.services.anthropic).toBe('unknown')
      expect(data.services.ai.services.pinecone).toBe('unknown')
    })

    it('handles Redis connection failure gracefully', async () => {
      // Mock Redis connection failure
      vi.mocked(await import('redis')).createClient = vi.fn().mockReturnValue({
        ping: vi.fn().mockRejectedValue(new Error('Redis connection failed')),
        quit: vi.fn().mockResolvedValue(undefined),
      })

      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.services.redis.status).toBe('disconnected')
      expect(data.services.redis.latency).toBeUndefined()
    })

    it('measures database latency correctly', async () => {
      // Mock database query with delay
      mockPrisma.$queryRaw.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([{ 1: 1 }]), 50))
      )

      const startTime = Date.now()
      const response = await GET()
      const endTime = Date.now()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.database.latency).toMatch(/\d+ms/)
      
      // Extract latency value and verify it's reasonable
      const latencyMs = parseInt(data.database.latency.replace('ms', ''))
      expect(latencyMs).toBeGreaterThan(40) // Should be at least 40ms due to our mock delay
      expect(latencyMs).toBeLessThan(endTime - startTime + 10) // Should be within reasonable bounds
    })

    it('includes correct Node.js version information', async () => {
      process.env.npm_package_version = '2.5.1'
      
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }])

      const response = await GET()
      const data = await response.json()

      expect(data.version).toBe('2.5.1')
    })

    it('falls back to default version when npm_package_version is not set', async () => {
      delete process.env.npm_package_version
      
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }])

      const response = await GET()
      const data = await response.json()

      expect(data.version).toBe('1.0.0')
    })
  })

  describe('HEAD', () => {
    it('returns 200 when database is healthy', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }])

      const response = await HEAD()

      expect(response.status).toBe(200)
      expect(response.body).toBe(null)
    })

    it('returns 503 when database is unhealthy', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Database error'))

      const response = await HEAD()

      expect(response.status).toBe(503)
      expect(response.body).toBe(null)
    })
  })

  describe('Error handling', () => {
    it('handles unknown error types gracefully', async () => {
      // Mock throwing a non-Error object
      mockPrisma.$queryRaw.mockRejectedValue('String error')

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('unhealthy')
      expect(data.error).toBe('Unknown error')
    })

    it('logs errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Test error'))

      await GET()

      expect(consoleSpy).toHaveBeenCalledWith('Health check failed:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('Performance', () => {
    it('completes health check within reasonable time', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }])

      const startTime = Date.now()
      const response = await GET()
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })
})