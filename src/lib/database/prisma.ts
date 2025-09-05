import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

// Type-safe database configuration schema
const DatabaseConfigSchema = z.object({
  url: z.string().url(),
  poolSize: z.number().int().min(1).max(100).default(20),
  poolTimeout: z.number().int().min(1000).default(30000),
  connectionTimeout: z.number().int().min(1000).default(60000),
  logLevel: z.enum(['info', 'query', 'warn', 'error']).default('warn'),
  enableQueryLogging: z.boolean().default(false),
});

type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

class PrismaManager {
  private static instance: PrismaManager;
  private prisma: PrismaClient | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): PrismaManager {
    if (!PrismaManager.instance) {
      PrismaManager.instance = new PrismaManager();
    }
    return PrismaManager.instance;
  }

  private getConfig(): DatabaseConfig {
    // Map debug to warn since Prisma doesn't support debug level
    const logLevel = process.env.LOG_LEVEL === 'debug' ? 'warn' : process.env.LOG_LEVEL;
    
    const config = {
      url: process.env.DATABASE_URL || '',
      poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '20', 10),
      poolTimeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '30000', 10),
      connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '60000', 10),
      logLevel: logLevel || 'warn',
      enableQueryLogging: process.env.ENABLE_QUERY_LOGGING === 'true',
    };

    return DatabaseConfigSchema.parse(config);
  }

  private createPrismaClient(): PrismaClient {
    const config = this.getConfig();
    
    // Determine log levels based on environment and configuration
    const logLevels: Prisma.LogLevel[] = [];
    
    if (process.env.NODE_ENV === 'development' || config.enableQueryLogging) {
      logLevels.push('query');
    }
    
    if (config.logLevel === 'info') {
      logLevels.push('info');
    }
    
    logLevels.push('warn', 'error');

    return new PrismaClient({
      log: logLevels.map(level => ({
        emit: 'stdout',
        level,
      })),
      datasources: {
        db: {
          url: config.url,
        },
      },
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
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
      if (!this.prisma) {
        this.prisma = this.createPrismaClient();
      }

      // Test the connection
      await this.prisma.$connect();
      
      // Run a simple query to ensure database is accessible
      await this.prisma.$queryRaw`SELECT 1 as test`;
      
      this.isConnected = true;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Database connected successfully');
        console.log('📊 Connection pool configured with:', {
          poolSize: this.getConfig().poolSize,
          poolTimeout: this.getConfig().poolTimeout,
          connectionTimeout: this.getConfig().connectionTimeout,
        });
      }

      // Setup graceful shutdown handlers
      this.setupShutdownHandlers();
      
    } catch (error) {
      this.isConnected = false;
      this.connectionPromise = null;
      console.error('❌ Database connection failed:', error);
      throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private setupShutdownHandlers(): void {
    const cleanup = async () => {
      if (this.prisma) {
        await this.disconnect();
      }
    };

    process.on('beforeExit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('SIGUSR2', cleanup); // nodemon restart
  }

  async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
      this.isConnected = false;
      this.connectionPromise = null;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔌 Database disconnected');
      }
    }
  }

  getClient(): PrismaClient {
    if (!this.prisma) {
      throw new Error('Prisma client not initialized. Call connect() first.');
    }
    return this.prisma;
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
    details?: string;
  }> {
    const startTime = Date.now();
    
    try {
      if (!this.isConnected || !this.prisma) {
        await this.connect();
      }

      await this.prisma!.$queryRaw`SELECT 1 as health_check`;
      
      const latency = Date.now() - startTime;
      
      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      
      return {
        status: 'unhealthy',
        latency,
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getConnectionInfo(): Promise<{
    isConnected: boolean;
    poolSize: number;
    activeConnections?: number;
    pendingConnections?: number;
  }> {
    const config = this.getConfig();
    
    try {
      if (!this.prisma) {
        return {
          isConnected: false,
          poolSize: config.poolSize,
        };
      }

      // Get database connection stats (PostgreSQL specific)
      const stats = await this.prisma.$queryRaw<Array<{
        active: number;
        idle: number;
        waiting: number;
      }>>`
        SELECT 
          count(*) FILTER (WHERE state = 'active') as active,
          count(*) FILTER (WHERE state = 'idle') as idle,
          count(*) FILTER (WHERE wait_event IS NOT NULL) as waiting
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `;

      const connectionStats = stats[0];

      return {
        isConnected: this.isConnected,
        poolSize: config.poolSize,
        activeConnections: Number(connectionStats?.active || 0),
        pendingConnections: Number(connectionStats?.waiting || 0),
      };
    } catch (error) {
      console.warn('Failed to get connection info:', error);
      return {
        isConnected: this.isConnected,
        poolSize: config.poolSize,
      };
    }
  }

  // Transaction wrapper with retry logic
  async withTransaction<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
    options: {
      maxAttempts?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      timeout = 30000,
      isolationLevel = Prisma.TransactionIsolationLevel.ReadCommitted,
    } = options;

    if (!this.prisma) {
      await this.connect();
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.prisma!.$transaction(
          operation,
          {
            timeout,
            isolationLevel,
          }
        );
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }

        // Check if error is retryable (serialization failures, deadlocks, etc.)
        if (this.isRetryableError(error)) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw new Error('Transaction retry logic error');
  }

  private isRetryableError(error: any): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const message = error.message?.toLowerCase() || '';
    const code = error.code || '';

    // PostgreSQL specific retry conditions
    return (
      code === 'P2034' || // Transaction conflict
      code === '40001' || // Serialization failure
      code === '40P01' || // Deadlock detected
      message.includes('serialization') ||
      message.includes('deadlock') ||
      message.includes('timeout')
    );
  }
}

// Export singleton instance
export const prismaManager = PrismaManager.getInstance();

// Export the prisma client getter for convenience
export const getPrismaClient = () => prismaManager.getClient();

// Auto-connect in non-test and non-build environments
if (process.env.NODE_ENV !== 'test' && process.env.NEXT_PHASE !== 'phase-production-build') {
  prismaManager.connect().catch(error => {
    console.error('Failed to initialize database connection:', error);
  });
}

// Export types for convenience
export type { Prisma };
export { PrismaClient };