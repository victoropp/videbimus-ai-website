import { NextRequest } from "next/server"
import { prisma } from "./prisma"

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyGenerator?: (req: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
}

class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: this.defaultKeyGenerator,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      message: "Too many requests, please try again later.",
      ...config,
    }
  }

  private defaultKeyGenerator(req: NextRequest): string {
    // Get IP address from various headers
    const forwarded = req.headers.get("x-forwarded-for")
    const realIp = req.headers.get("x-real-ip")
    const cfIp = req.headers.get("cf-connecting-ip")
    
    return forwarded?.split(",")[0] || realIp || cfIp || "unknown"
  }

  private getKey(req: NextRequest, endpoint: string): string {
    const identifier = this.config.keyGenerator!(req)
    return `${identifier}:${endpoint}`
  }

  async checkRateLimit(req: NextRequest, endpoint: string): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    message?: string
  }> {
    const key = this.getKey(req, endpoint)
    const now = new Date()
    const windowStart = new Date(now.getTime() - this.config.windowMs)

    try {
      // Clean up old entries
      await prisma.rateLimit.deleteMany({
        where: {
          windowStart: {
            lt: windowStart,
          },
        },
      })

      // Get or create current rate limit record
      let rateLimitRecord = await prisma.rateLimit.findUnique({
        where: {
          identifier_key: {
            identifier: key.split(":")[0],
            key: endpoint,
          },
        },
      })

      if (!rateLimitRecord) {
        rateLimitRecord = await prisma.rateLimit.create({
          data: {
            identifier: key.split(":")[0],
            key: endpoint,
            requests: 1,
            windowStart: now,
          },
        })

        return {
          allowed: true,
          remaining: this.config.maxRequests - 1,
          resetTime: now.getTime() + this.config.windowMs,
        }
      }

      // Check if current window is still valid
      const isCurrentWindow = rateLimitRecord.windowStart.getTime() > windowStart.getTime()

      if (!isCurrentWindow) {
        // Reset the window
        await prisma.rateLimit.update({
          where: { id: rateLimitRecord.id },
          data: {
            requests: 1,
            windowStart: now,
          },
        })

        return {
          allowed: true,
          remaining: this.config.maxRequests - 1,
          resetTime: now.getTime() + this.config.windowMs,
        }
      }

      // Check if rate limit exceeded
      if (rateLimitRecord.requests >= this.config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: rateLimitRecord.windowStart.getTime() + this.config.windowMs,
          message: this.config.message,
        }
      }

      // Increment request count
      await prisma.rateLimit.update({
        where: { id: rateLimitRecord.id },
        data: {
          requests: rateLimitRecord.requests + 1,
        },
      })

      return {
        allowed: true,
        remaining: this.config.maxRequests - rateLimitRecord.requests - 1,
        resetTime: rateLimitRecord.windowStart.getTime() + this.config.windowMs,
      }
    } catch (error) {
      console.error("Rate limit check failed:", error)
      // In case of database error, allow the request
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now.getTime() + this.config.windowMs,
      }
    }
  }
}

// Default rate limiters for different endpoints
export const apiRateLimit = new RateLimiter({
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
})

export const authRateLimit = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "Too many authentication attempts, please try again later.",
})

export const contactRateLimit = new RateLimiter({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many contact form submissions, please try again later.",
})

export const newsletterRateLimit = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many newsletter subscription attempts, please try again later.",
})

// Middleware helper
export async function withRateLimit(
  req: NextRequest,
  rateLimiter: RateLimiter,
  endpoint: string
): Promise<Response | null> {
  const result = await rateLimiter.checkRateLimit(req, endpoint)

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: result.message || "Rate limit exceeded",
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": rateLimiter["config"].maxRequests.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.resetTime.toString(),
          "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  return null
}