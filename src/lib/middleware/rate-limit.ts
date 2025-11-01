import { cacheManager, CacheKey } from '@/lib/cache/redis';
import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitConfig {
  /**
   * Number of requests allowed within the time window
   */
  limit: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Message to return when rate limit is exceeded
   */
  message?: string;

  /**
   * Status code to return when rate limit is exceeded
   */
  statusCode?: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Rate limiter using Redis with sliding window algorithm
 */
export class RateLimiter {
  private config: Required<RateLimitConfig>;
  private fallbackStore: Map<string, { count: number; resetAt: number }> = new Map();

  constructor(config: RateLimitConfig) {
    this.config = {
      limit: config.limit,
      windowSeconds: config.windowSeconds,
      message: config.message || 'Too many requests. Please try again later.',
      statusCode: config.statusCode || 429,
    };
  }

  /**
   * Check if request should be rate limited
   */
  async check(identifier: string, action: string = 'default'): Promise<RateLimitResult> {
    try {
      const key = CacheKey.rateLimit(identifier, action);
      const now = Math.floor(Date.now() / 1000);
      const resetTime = now + this.config.windowSeconds;

      // Try Redis first
      const current = await cacheManager.get<number>(key);

      if (current === null) {
        // First request in window
        await cacheManager.set(key, 1, this.config.windowSeconds);
        return {
          success: true,
          limit: this.config.limit,
          remaining: this.config.limit - 1,
          reset: resetTime,
        };
      }

      // Check if limit exceeded
      if (current >= this.config.limit) {
        const ttl = await cacheManager.ttl(key);
        const retryAfter = ttl > 0 ? ttl : this.config.windowSeconds;

        return {
          success: false,
          limit: this.config.limit,
          remaining: 0,
          reset: now + retryAfter,
          retryAfter,
        };
      }

      // Increment counter
      const newCount = current + 1;
      await cacheManager.set(key, newCount, this.config.windowSeconds);

      return {
        success: true,
        limit: this.config.limit,
        remaining: this.config.limit - newCount,
        reset: resetTime,
      };
    } catch (error) {
      console.warn('Rate limiter Redis error, using fallback:', error);
      return this.checkFallback(identifier, action);
    }
  }

  /**
   * Fallback rate limiting using in-memory storage
   */
  private checkFallback(identifier: string, action: string): RateLimitResult {
    const key = `${identifier}:${action}`;
    const now = Math.floor(Date.now() / 1000);

    // Clean up expired entries
    for (const [k, v] of this.fallbackStore.entries()) {
      if (v.resetAt <= now) {
        this.fallbackStore.delete(k);
      }
    }

    const entry = this.fallbackStore.get(key);

    if (!entry) {
      // First request
      this.fallbackStore.set(key, {
        count: 1,
        resetAt: now + this.config.windowSeconds,
      });

      return {
        success: true,
        limit: this.config.limit,
        remaining: this.config.limit - 1,
        reset: now + this.config.windowSeconds,
      };
    }

    if (entry.resetAt <= now) {
      // Window expired, reset
      this.fallbackStore.set(key, {
        count: 1,
        resetAt: now + this.config.windowSeconds,
      });

      return {
        success: true,
        limit: this.config.limit,
        remaining: this.config.limit - 1,
        reset: now + this.config.windowSeconds,
      };
    }

    if (entry.count >= this.config.limit) {
      // Limit exceeded
      return {
        success: false,
        limit: this.config.limit,
        remaining: 0,
        reset: entry.resetAt,
        retryAfter: entry.resetAt - now,
      };
    }

    // Increment
    entry.count++;
    this.fallbackStore.set(key, entry);

    return {
      success: true,
      limit: this.config.limit,
      remaining: this.config.limit - entry.count,
      reset: entry.resetAt,
    };
  }

  /**
   * Reset rate limit for an identifier
   */
  async reset(identifier: string, action: string = 'default'): Promise<void> {
    try {
      const key = CacheKey.rateLimit(identifier, action);
      await cacheManager.del(key);
      this.fallbackStore.delete(`${identifier}:${action}`);
    } catch (error) {
      console.warn('Failed to reset rate limit:', error);
    }
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * AI chat requests: 10 requests per minute per user/session
   */
  aiChat: new RateLimiter({
    limit: 10,
    windowSeconds: 60,
    message: 'Too many chat requests. Please wait a moment before sending another message.',
  }),

  /**
   * API endpoints: 100 requests per minute per IP
   */
  api: new RateLimiter({
    limit: 100,
    windowSeconds: 60,
    message: 'API rate limit exceeded. Please try again later.',
  }),

  /**
   * Authentication attempts: 5 per 15 minutes per IP
   */
  auth: new RateLimiter({
    limit: 5,
    windowSeconds: 900,
    message: 'Too many authentication attempts. Please try again later.',
  }),

  /**
   * Contact form: 3 per hour per user
   */
  contactForm: new RateLimiter({
    limit: 3,
    windowSeconds: 3600,
    message: 'Too many form submissions. Please try again later.',
  }),

  /**
   * File uploads: 10 per hour per user
   */
  fileUpload: new RateLimiter({
    limit: 10,
    windowSeconds: 3600,
    message: 'Upload limit exceeded. Please try again later.',
  }),
};

/**
 * Extract identifier from request (user ID, session ID, or IP)
 */
export function getRequestIdentifier(req: NextRequest): string {
  // Try to get user ID from session (requires auth middleware)
  const userId = req.headers.get('x-user-id');
  if (userId) return `user:${userId}`;

  // Try to get session ID
  const sessionId = req.headers.get('x-session-id') || req.cookies.get('sessionId')?.value;
  if (sessionId) return `session:${sessionId}`;

  // Fallback to IP address
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : realIp || 'unknown';
  return `ip:${ip}`;
}

/**
 * Middleware to apply rate limiting to Next.js API routes
 */
export function withRateLimit(
  limiter: RateLimiter,
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const identifier = getRequestIdentifier(req);
    const result = await limiter.check(identifier);

    // Add rate limit headers
    const response = result.success
      ? await handler(req)
      : NextResponse.json(
          { error: limiter['config'].message },
          { status: limiter['config'].statusCode }
        );

    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.reset.toString());

    if (!result.success && result.retryAfter) {
      response.headers.set('Retry-After', result.retryAfter.toString());
    }

    return response;
  };
}

/**
 * Helper to create rate limit response
 */
export function createRateLimitResponse(result: RateLimitResult, message?: string): NextResponse {
  const response = NextResponse.json(
    { error: message || 'Too many requests. Please try again later.' },
    { status: 429 }
  );

  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());

  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString());
  }

  return response;
}
