import { NextRequest, NextResponse } from 'next/server';
import { cacheManager, CacheKey } from '@/lib/cache/redis';

// Performance optimization utilities
export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  cacheHit?: boolean;
  dbQueries?: number;
  memoryUsage?: number;
}

// Cache configuration for different endpoints
export const CACHE_CONFIG = {
  // Static content (long TTL)
  STATIC: {
    ttl: 86400, // 24 hours
    patterns: ['/api/health', '/api/team', '/api/testimonials'],
  },
  // Dynamic content (medium TTL)
  DYNAMIC: {
    ttl: 3600, // 1 hour
    patterns: ['/api/blog', '/api/case-studies', '/api/projects'],
  },
  // User-specific content (short TTL)
  USER: {
    ttl: 900, // 15 minutes
    patterns: ['/api/user', '/api/dashboard'],
  },
  // No cache
  NO_CACHE: {
    ttl: 0,
    patterns: ['/api/auth', '/api/payment', '/api/contact'],
  },
} as const;

// Response compression utility
export function shouldCompress(contentType?: string, size?: number): boolean {
  if (!contentType || !size) return false;
  
  // Don't compress small responses
  if (size < 1024) return false;
  
  // Don't compress already compressed formats
  if (contentType.includes('image/') || 
      contentType.includes('video/') || 
      contentType.includes('audio/') ||
      contentType.includes('application/zip') ||
      contentType.includes('application/gzip')) {
    return false;
  }
  
  return true;
}

// ETags for client-side caching
export function generateETag(content: string): string {
  const hash = require('crypto').createHash('md5').update(content).digest('hex');
  return `"${hash}"`;
}

// Cache key generator for API responses
export function generateCacheKey(request: NextRequest): string {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const searchParams = url.searchParams.toString();
  const method = request.method;
  
  return CacheKey.apiResponse(
    `${method}:${pathname}`,
    searchParams
  );
}

// Determine cache TTL based on endpoint
export function getCacheTTL(pathname: string): number {
  for (const [key, config] of Object.entries(CACHE_CONFIG)) {
    if (config.patterns.some(pattern => pathname.startsWith(pattern))) {
      return config.ttl;
    }
  }
  
  // Default to short cache for unknown endpoints
  return CACHE_CONFIG.DYNAMIC.ttl;
}

// Performance monitoring middleware
export function withPerformanceMonitoring<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  endpoint: string
) {
  return async (...args: T): Promise<R> => {
    const metrics: PerformanceMetrics = {
      startTime: performance.now(),
    };

    try {
      // Monitor memory usage
      if (typeof process !== 'undefined' && process.memoryUsage) {
        metrics.memoryUsage = process.memoryUsage().heapUsed;
      }

      const result = await handler(...args);

      metrics.endTime = performance.now();
      metrics.duration = metrics.endTime - metrics.startTime;

      // Log slow requests
      if (metrics.duration > 1000) {
        console.warn(`🐌 Slow request detected: ${endpoint} took ${metrics.duration.toFixed(2)}ms`);
      }

      // Store metrics for monitoring
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${endpoint}: ${metrics.duration.toFixed(2)}ms`, {
          cacheHit: metrics.cacheHit,
          memoryMB: metrics.memoryUsage ? (metrics.memoryUsage / 1024 / 1024).toFixed(2) : 'unknown'
        });
      }

      return result;
    } catch (error) {
      metrics.endTime = performance.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      
      console.error(`❌ Error in ${endpoint} after ${metrics.duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };
}

// API response caching middleware
export function withCache<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  options: {
    ttl?: number;
    keyGenerator?: (request: NextRequest) => string;
    skipCache?: (request: NextRequest) => boolean;
    skipCacheOnError?: boolean;
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    const {
      ttl,
      keyGenerator = generateCacheKey,
      skipCache = () => false,
      skipCacheOnError = true
    } = options;

    // Skip cache for certain conditions
    if (skipCache(request) || request.method !== 'GET') {
      return handler(request);
    }

    const cacheKey = keyGenerator(request);
    const cacheTTL = ttl ?? getCacheTTL(new URL(request.url).pathname);

    // Skip cache if TTL is 0
    if (cacheTTL === 0) {
      return handler(request);
    }

    try {
      // Try to get from cache
      const cachedResponse = await cacheManager.get<{
        status: number;
        headers: Record<string, string>;
        body: any;
        timestamp: number;
      }>(cacheKey);

      if (cachedResponse) {
        // Check if cache is still valid (additional staleness check)
        const age = Date.now() - cachedResponse.timestamp;
        if (age < cacheTTL * 1000) {
          const response = NextResponse.json(cachedResponse.body, {
            status: cachedResponse.status,
            headers: {
              ...cachedResponse.headers,
              'X-Cache': 'HIT',
              'X-Cache-Age': Math.floor(age / 1000).toString(),
            },
          });

          return response;
        }
      }

      // Cache miss - fetch data
      const response = await handler(request);
      const responseClone = response.clone();
      
      // Only cache successful responses
      if (response.status >= 200 && response.status < 300) {
        try {
          const body = await responseClone.json();
          const headers: Record<string, string> = {};
          
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });

          await cacheManager.set(cacheKey, {
            status: response.status,
            headers,
            body,
            timestamp: Date.now(),
          }, cacheTTL);

          // Add cache headers
          response.headers.set('X-Cache', 'MISS');
          response.headers.set('Cache-Control', `public, max-age=${cacheTTL}`);
          
        } catch (cacheError) {
          console.warn('Failed to cache response:', cacheError);
        }
      }

      return response;
      
    } catch (error) {
      console.error('Cache middleware error:', error);
      
      // On cache error, fall back to direct handler execution
      if (skipCacheOnError) {
        return handler(request);
      }
      
      throw error;
    }
  };
}

// Database query optimization utilities
export class QueryOptimizer {
  private static queryCache = new Map<string, any>();
  
  static async withCache<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    return cacheManager.getOrSet(queryKey, queryFn, ttlSeconds);
  }

  static async batchQueries<T, K extends string | number>(
    queries: Record<K, () => Promise<T>>
  ): Promise<Record<K, T>> {
    const results = await Promise.allSettled(
      Object.entries(queries).map(async ([key, queryFn]) => {
        const result = await queryFn();
        return [key, result];
      })
    );

    const successResults: Record<K, T> = {} as Record<K, T>;
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const [key, value] = result.value as [K, T];
        successResults[key] = value;
      }
    }

    return successResults;
  }

  static createDataLoader<K, V>(
    batchLoadFn: (keys: K[]) => Promise<V[]>,
    options: {
      maxBatchSize?: number;
      cacheKeyFn?: (key: K) => string;
      ttlSeconds?: number;
    } = {}
  ) {
    const {
      maxBatchSize = 100,
      cacheKeyFn = (key: K) => String(key),
      ttlSeconds = 300
    } = options;

    const loadMany = async (keys: K[]): Promise<V[]> => {
      // Check cache first
      const cacheKeys = keys.map(cacheKeyFn);
      const cached = await cacheManager.mget<V>(cacheKeys);
      
      const uncachedIndices: number[] = [];
      const uncachedKeys: K[] = [];
      
      cached.forEach((value, index) => {
        if (value === null) {
          uncachedIndices.push(index);
          uncachedKeys.push(keys[index]);
        }
      });

      if (uncachedKeys.length === 0) {
        return cached.filter(v => v !== null) as V[];
      }

      // Batch load uncached data
      const freshData = await batchLoadFn(uncachedKeys);
      
      // Update cache
      const cacheUpdates: Record<string, V> = {};
      uncachedKeys.forEach((key, index) => {
        cacheUpdates[cacheKeyFn(key)] = freshData[index];
      });
      
      await cacheManager.mset(cacheUpdates, ttlSeconds);

      // Merge cached and fresh data
      const result: V[] = [];
      let freshIndex = 0;
      
      cached.forEach((cachedValue, index) => {
        if (cachedValue !== null) {
          result.push(cachedValue);
        } else {
          result.push(freshData[freshIndex++]);
        }
      });

      return result;
    };

    const load = async (key: K): Promise<V> => {
      const results = await loadMany([key]);
      return results[0];
    };

    return { load, loadMany };
  }
}

// Response optimization utilities
export class ResponseOptimizer {
  static addSecurityHeaders(response: NextResponse): void {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }

  static addCorsHeaders(response: NextResponse, origin?: string): void {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  static addCacheHeaders(response: NextResponse, maxAge: number): void {
    response.headers.set('Cache-Control', `public, max-age=${maxAge}`);
    response.headers.set('Vary', 'Accept-Encoding');
  }

  static optimizeJsonResponse<T>(data: T): T {
    // Remove null values and empty objects/arrays for smaller response size
    if (Array.isArray(data)) {
      return data.filter(item => item != null).map(item => 
        ResponseOptimizer.optimizeJsonResponse(item)
      ) as T;
    }
    
    if (data && typeof data === 'object') {
      const optimized: any = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (value != null) {
          if (Array.isArray(value) && value.length === 0) {
            continue; // Skip empty arrays
          }
          
          if (typeof value === 'object' && Object.keys(value).length === 0) {
            continue; // Skip empty objects
          }
          
          optimized[key] = ResponseOptimizer.optimizeJsonResponse(value);
        }
      }
      
      return optimized as T;
    }
    
    return data;
  }
}

// Export all utilities
export default {
  withPerformanceMonitoring,
  withCache,
  QueryOptimizer,
  ResponseOptimizer,
  generateCacheKey,
  getCacheTTL,
  generateETag,
  shouldCompress,
};