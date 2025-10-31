import Redis, { type RedisOptions } from 'ioredis';
import { z } from 'zod';

// Cache configuration schema
const CacheConfigSchema = z.object({
  url: z.string().url(),
  host: z.string().default('localhost'),
  port: z.number().int().min(1).max(65535).default(6379),
  password: z.string().optional(),
  db: z.number().int().min(0).default(0),
  maxRetriesPerRequest: z.number().int().min(0).default(3),
  retryDelayOnFailover: z.number().int().min(0).default(100),
  enableOfflineQueue: z.boolean().default(false),
  lazyConnect: z.boolean().default(true),
  maxMemoryPolicy: z.enum(['allkeys-lru', 'allkeys-lfu', 'volatile-lru', 'volatile-lfu']).optional(),
});

type CacheConfig = z.infer<typeof CacheConfigSchema>;

// Cache key utilities
export class CacheKey {
  static user(id: string): string {
    return `user:${id}`;
  }

  static userSessions(id: string): string {
    return `user:${id}:sessions`;
  }

  static blogPost(slug: string): string {
    return `blog:post:${slug}`;
  }

  static blogPosts(page: number = 1, category?: string): string {
    const base = `blog:posts:page:${page}`;
    return category ? `${base}:category:${category}` : base;
  }

  static caseStudy(slug: string): string {
    return `case-study:${slug}`;
  }

  static caseStudies(): string {
    return 'case-studies:list';
  }

  static teamMembers(): string {
    return 'team:members';
  }

  static testimonials(): string {
    return 'testimonials:list';
  }

  static project(id: string): string {
    return `project:${id}`;
  }

  static userProjects(userId: string): string {
    return `user:${userId}:projects`;
  }

  static analytics(period: string): string {
    return `analytics:${period}`;
  }

  static healthCheck(): string {
    return 'health:check';
  }

  static apiResponse(endpoint: string, params: string = ''): string {
    const hash = Buffer.from(`${endpoint}:${params}`).toString('base64');
    return `api:response:${hash}`;
  }

  static rateLimit(identifier: string, action: string): string {
    return `rate-limit:${identifier}:${action}`;
  }

  static session(sessionId: string): string {
    return `session:${sessionId}`;
  }
}

// Cache service with advanced features
class CacheManager {
  private static instance: CacheManager;
  private redis: Redis | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;
  private readonly config: CacheConfig;

  private constructor() {
    this.config = this.getConfig();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private getConfig(): CacheConfig {
    const config = {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRY_ATTEMPTS || '3', 10),
      retryDelayOnFailover: 100,
      enableOfflineQueue: false,
      lazyConnect: true,
    };

    return CacheConfigSchema.parse(config);
  }

  private createRedisClient(): Redis {
    // Use URL if provided, otherwise use individual config
    if (this.config.url && this.config.url !== 'redis://localhost:6379') {
      return new Redis(this.config.url, {
        maxRetriesPerRequest: this.config.maxRetriesPerRequest,
        enableOfflineQueue: this.config.enableOfflineQueue,
        lazyConnect: this.config.lazyConnect,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
    }

    const options: RedisOptions = {
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.db,
      maxRetriesPerRequest: 3,
      enableOfflineQueue: this.config.enableOfflineQueue,
      lazyConnect: this.config.lazyConnect,
      // Connection handling
      connectTimeout: 10000,
      commandTimeout: 5000,
      // Retry strategy
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    const redis = new Redis(options);

    // Event listeners
    redis.on('connect', () => {
      this.isConnected = true;
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Redis connected successfully');
      }
    });

    redis.on('error', (error) => {
      this.isConnected = false;
      console.error('❌ Redis connection error:', error);
    });

    redis.on('close', () => {
      this.isConnected = false;
      if (process.env.NODE_ENV === 'development') {
        console.log('🔌 Redis connection closed');
      }
    });

    redis.on('reconnecting', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Redis reconnecting...');
      }
    });

    return redis;
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.redis) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._connect();
    return this.connectionPromise;
  }

  private async _connect(): Promise<void> {
    try {
      if (!this.redis) {
        this.redis = this.createRedisClient();
      }

      await this.redis.ping();
      this.isConnected = true;
      this.connectionPromise = null;

      // Setup graceful shutdown
      this.setupShutdownHandlers();

    } catch (error) {
      this.isConnected = false;
      this.connectionPromise = null;
      console.error('❌ Redis connection failed:', error);
      // Don't throw - allow graceful degradation
    }
  }

  private setupShutdownHandlers(): void {
    const cleanup = async () => {
      if (this.redis) {
        await this.disconnect();
      }
    };

    process.on('beforeExit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('SIGUSR2', cleanup); // nodemon restart
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
      this.isConnected = false;
      this.connectionPromise = null;
    }
  }

  // Core cache operations
  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
      }

      if (!this.redis || !this.isConnected) {
        return null; // Graceful degradation
      }

      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
      }

      if (!this.redis || !this.isConnected) {
        return false; // Graceful degradation
      }

      const serialized = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      console.warn('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string | string[]): Promise<number> {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
      }

      if (!this.redis || !this.isConnected) {
        return 0;
      }

      return await this.redis.del(Array.isArray(key) ? key : [key]);
    } catch (error) {
      console.warn('Redis DEL error:', error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
      }

      if (!this.redis || !this.isConnected) {
        return false;
      }

      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.warn('Redis EXISTS error:', error);
      return false;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
      }

      if (!this.redis || !this.isConnected) {
        return false;
      }

      const result = await this.redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.warn('Redis EXPIRE error:', error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
      }

      if (!this.redis || !this.isConnected) {
        return -1;
      }

      return await this.redis.ttl(key);
    } catch (error) {
      console.warn('Redis TTL error:', error);
      return -1;
    }
  }

  // Advanced operations
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
      }

      if (!this.redis || !this.isConnected) {
        return keys.map(() => null);
      }

      const values = await this.redis.mget(...keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.warn('Redis MGET error:', error);
      return keys.map(() => null);
    }
  }

  async mset(keyValuePairs: Record<string, any>, ttlSeconds?: number): Promise<boolean> {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
      }

      if (!this.redis || !this.isConnected) {
        return false;
      }

      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serialized = JSON.stringify(value);
        if (ttlSeconds) {
          pipeline.setex(key, ttlSeconds, serialized);
        } else {
          pipeline.set(key, serialized);
        }
      }
      
      await pipeline.exec();
      return true;
    } catch (error) {
      console.warn('Redis MSET error:', error);
      return false;
    }
  }

  async flushPattern(pattern: string): Promise<number> {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
      }

      if (!this.redis || !this.isConnected) {
        return 0;
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      return await this.redis.del(...keys);
    } catch (error) {
      console.warn('Redis FLUSH_PATTERN error:', error);
      return 0;
    }
  }

  // Cache with callback (cache-aside pattern)
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Fetch data and cache it
      const data = await fetchFunction();
      await this.set(key, data, ttlSeconds);
      return data;
    } catch (error) {
      console.warn('Redis GET_OR_SET error:', error);
      // Fallback to direct fetch
      return await fetchFunction();
    }
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
    details?: string;
  }> {
    const startTime = Date.now();
    
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
      }

      if (!this.redis || !this.isConnected) {
        return {
          status: 'unhealthy',
          latency: Date.now() - startTime,
          details: 'Not connected to Redis',
        };
      }

      await this.redis.ping();
      
      return {
        status: 'healthy',
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get cache stats
  async getStats(): Promise<{
    connected: boolean;
    memoryUsage?: string;
    keyCount?: number;
    hitRate?: number;
    uptimeSeconds?: number;
  }> {
    try {
      if (!this.redis || !this.isConnected) {
        return { connected: false };
      }

      const info = await this.redis.info();
      const lines = info.split('\r\n');
      const stats: any = { connected: true };

      for (const line of lines) {
        if (line.includes('used_memory_human:')) {
          stats.memoryUsage = line.split(':')[1];
        }
        if (line.includes('db0:keys=')) {
          const match = line.match(/keys=(\d+)/);
          stats.keyCount = match ? parseInt(match[1], 10) : 0;
        }
        if (line.includes('keyspace_hits:')) {
          const hits = parseInt(line.split(':')[1], 10);
          const misses = parseInt(lines.find(l => l.includes('keyspace_misses:'))?.split(':')[1] || '0', 10);
          stats.hitRate = hits / (hits + misses) * 100;
        }
        if (line.includes('uptime_in_seconds:')) {
          stats.uptimeSeconds = parseInt(line.split(':')[1], 10);
        }
      }

      return stats;
    } catch (error) {
      console.warn('Redis STATS error:', error);
      return { connected: false };
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Auto-connect in non-test environments
if (process.env.NODE_ENV !== 'test') {
  cacheManager.connect().catch(error => {
    console.warn('Failed to initialize cache connection:', error);
  });
}

// Export utilities
export default cacheManager;