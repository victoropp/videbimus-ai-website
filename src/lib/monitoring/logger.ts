import pino from 'pino';
import { z } from 'zod';

// Log level schema
const LogLevelSchema = z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);
type LogLevel = z.infer<typeof LogLevelSchema>;

// Log context schema
const LogContextSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
  service: z.string().optional(),
  operation: z.string().optional(),
  version: z.string().optional(),
  environment: z.string().optional(),
  timestamp: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

type LogContext = z.infer<typeof LogContextSchema>;

// Performance metrics schema
const PerformanceMetricsSchema = z.object({
  duration: z.number(),
  memoryUsage: z.number().optional(),
  cpuUsage: z.number().optional(),
  dbQueries: z.number().optional(),
  cacheHits: z.number().optional(),
  cacheMisses: z.number().optional(),
  apiCalls: z.number().optional(),
});

type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

// Error context schema
const ErrorContextSchema = z.object({
  error: z.instanceof(Error),
  stack: z.string().optional(),
  code: z.string().optional(),
  statusCode: z.number().optional(),
  context: LogContextSchema.optional(),
  metadata: z.record(z.any()).optional(),
});

type ErrorContext = z.infer<typeof ErrorContextSchema>;

// Logger configuration
interface LoggerConfig {
  level: LogLevel;
  service: string;
  version: string;
  environment: string;
  enableConsole: boolean;
  enableFile: boolean;
  enableStructured: boolean;
  enablePerformanceLogging: boolean;
  fileOptions?: {
    filename: string;
    maxSize: string;
    maxFiles: string;
  };
  excludeFields?: string[];
  sensitiveFields?: string[];
}

class Logger {
  private static instance: Logger;
  private pino: pino.Logger;
  private config: LoggerConfig;
  private performanceMetrics: Map<string, { startTime: number; context: LogContext }> = new Map();

  private constructor(config?: Partial<LoggerConfig>) {
    this.config = this.buildConfig(config);
    this.pino = this.createPinoLogger();
  }

  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  private buildConfig(config?: Partial<LoggerConfig>): LoggerConfig {
    return {
      level: (process.env.LOG_LEVEL as LogLevel) || 'info',
      service: process.env.APP_NAME || 'vidibemus-ai',
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      enableConsole: true,
      enableFile: process.env.NODE_ENV === 'production',
      enableStructured: process.env.NODE_ENV === 'production',
      enablePerformanceLogging: process.env.ENABLE_PERFORMANCE_LOGGING === 'true',
      fileOptions: {
        filename: './logs/app.log',
        maxSize: '100MB',
        maxFiles: '30',
      },
      excludeFields: ['password', 'token', 'secret', 'key', 'authorization'],
      sensitiveFields: ['email', 'phone', 'address', 'ssn', 'credit_card'],
      ...config,
    };
  }

  private createPinoLogger(): pino.Logger {
    const { level, enableConsole, enableStructured, service, version, environment } = this.config;

    const baseConfig: pino.LoggerOptions = {
      level,
      name: service,
      formatters: {
        level: (label) => ({ level: label }),
        log: (object) => this.sanitizeLogObject(object),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      base: {
        service,
        version,
        environment,
        pid: process.pid,
        hostname: process.env.HOSTNAME || 'localhost',
      },
    };

    // Configure transport based on environment
    if (enableConsole && !enableStructured) {
      return pino({
        ...baseConfig,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            singleLine: false,
            ignore: 'pid,hostname',
            messageFormat: '[{service}:{version}] {msg}',
          },
        },
      });
    }

    return pino(baseConfig);
  }

  private sanitizeLogObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized = { ...obj };
    const { excludeFields, sensitiveFields } = this.config;

    // Remove excluded fields
    excludeFields?.forEach(field => {
      delete sanitized[field];
    });

    // Mask sensitive fields
    sensitiveFields?.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = this.maskSensitiveValue(sanitized[field]);
      }
    });

    // Recursively sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] && typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeLogObject(sanitized[key]);
      }
    });

    return sanitized;
  }

  private maskSensitiveValue(value: any): string {
    if (typeof value !== 'string') {
      return '[MASKED]';
    }

    if (value.length <= 4) {
      return '*'.repeat(value.length);
    }

    return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
  }

  private enrichContext(context: LogContext = {}): LogContext {
    return {
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      service: this.config.service,
      version: this.config.version,
      ...context,
    };
  }

  // Core logging methods
  trace(message: string, context?: LogContext): void {
    this.pino.trace(this.enrichContext(context), message);
  }

  debug(message: string, context?: LogContext): void {
    this.pino.debug(this.enrichContext(context), message);
  }

  info(message: string, context?: LogContext): void {
    this.pino.info(this.enrichContext(context), message);
  }

  warn(message: string, context?: LogContext): void {
    this.pino.warn(this.enrichContext(context), message);
  }

  error(message: string, errorContext?: ErrorContext): void {
    const enrichedContext = this.enrichContext(errorContext?.context);
    
    if (errorContext?.error) {
      this.pino.error(
        {
          ...enrichedContext,
          error: {
            name: errorContext.error.name,
            message: errorContext.error.message,
            stack: errorContext.error.stack,
          },
          errorCode: errorContext.code,
          statusCode: errorContext.statusCode,
          metadata: errorContext.metadata,
        },
        message
      );
    } else {
      this.pino.error(enrichedContext, message);
    }
  }

  fatal(message: string, errorContext?: ErrorContext): void {
    const enrichedContext = this.enrichContext(errorContext?.context);
    
    if (errorContext?.error) {
      this.pino.fatal(
        {
          ...enrichedContext,
          error: {
            name: errorContext.error.name,
            message: errorContext.error.message,
            stack: errorContext.error.stack,
          },
          errorCode: errorContext.code,
          statusCode: errorContext.statusCode,
          metadata: errorContext.metadata,
        },
        message
      );
    } else {
      this.pino.fatal(enrichedContext, message);
    }
  }

  // Performance logging
  startPerformanceTimer(operationId: string, context?: LogContext): void {
    if (!this.config.enablePerformanceLogging) {
      return;
    }

    this.performanceMetrics.set(operationId, {
      startTime: performance.now(),
      context: this.enrichContext(context),
    });

    this.debug(`Performance timer started: ${operationId}`, context);
  }

  endPerformanceTimer(operationId: string, additionalMetrics?: Partial<PerformanceMetrics>): void {
    if (!this.config.enablePerformanceLogging) {
      return;
    }

    const timerData = this.performanceMetrics.get(operationId);
    if (!timerData) {
      this.warn(`Performance timer not found: ${operationId}`);
      return;
    }

    const duration = performance.now() - timerData.startTime;
    const memoryUsage = process.memoryUsage().heapUsed;
    
    const metrics: PerformanceMetrics = {
      duration,
      memoryUsage,
      ...additionalMetrics,
    };

    this.info(`Performance timer completed: ${operationId}`, {
      ...timerData.context,
      metadata: {
        performance: metrics,
      },
    });

    this.performanceMetrics.delete(operationId);
  }

  // Structured logging for specific events
  logAPICall(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
    this.info(`API ${method} ${path}`, {
      ...context,
      metadata: {
        http: {
          method,
          path,
          statusCode,
          duration,
        },
      },
    });
  }

  logDatabaseQuery(query: string, duration: number, affectedRows?: number, context?: LogContext): void {
    this.debug('Database query executed', {
      ...context,
      metadata: {
        database: {
          query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
          duration,
          affectedRows,
        },
      },
    });
  }

  logCacheOperation(operation: 'get' | 'set' | 'del', key: string, hit: boolean, duration: number, context?: LogContext): void {
    this.debug(`Cache ${operation}`, {
      ...context,
      metadata: {
        cache: {
          operation,
          key: key.substring(0, 50) + (key.length > 50 ? '...' : ''),
          hit,
          duration,
        },
      },
    });
  }

  logUserAction(userId: string, action: string, resource?: string, context?: LogContext): void {
    this.info(`User action: ${action}`, {
      ...context,
      userId,
      metadata: {
        user: {
          action,
          resource,
        },
      },
    });
  }

  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void {
    const logMethod = severity === 'critical' ? 'fatal' : severity === 'high' ? 'error' : 'warn';
    
    this[logMethod](`Security event: ${event}`, {
      ...context,
      metadata: {
        security: {
          event,
          severity,
        },
      },
    } as any);
  }

  logBusinessEvent(event: string, data: Record<string, any>, context?: LogContext): void {
    this.info(`Business event: ${event}`, {
      ...context,
      metadata: {
        business: {
          event,
          data,
        },
      },
    });
  }

  // Health check logging
  logHealthCheck(service: string, status: 'healthy' | 'unhealthy', details?: Record<string, any>, context?: LogContext): void {
    const logMethod = status === 'healthy' ? 'info' : 'error';
    
    this[logMethod](`Health check: ${service} is ${status}`, {
      ...context,
      metadata: {
        healthCheck: {
          service,
          status,
          details,
        },
      },
    } as any);
  }

  // Correlation ID utilities
  createCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  withCorrelationId<T>(correlationId: string, fn: (logger: Logger) => T): T {
    const contextualLogger = this.createContextualLogger({ requestId: correlationId });
    return fn(contextualLogger);
  }

  createContextualLogger(context: LogContext): Logger {
    const contextualLogger = Object.create(this);
    const baseEnrichContext = this.enrichContext.bind(this);
    
    contextualLogger.enrichContext = (additionalContext: LogContext = {}) => {
      return baseEnrichContext({ ...context, ...additionalContext });
    };
    
    return contextualLogger;
  }

  // Configuration updates
  setLogLevel(level: LogLevel): void {
    this.config.level = level;
    this.pino.level = level;
    this.info(`Log level changed to: ${level}`);
  }

  getLogLevel(): LogLevel {
    return this.config.level;
  }

  // Flush logs (useful for testing and shutdown)
  flush(): Promise<void> {
    return new Promise((resolve) => {
      this.pino.flush(() => {
        resolve();
      });
    });
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    this.info('Logger shutting down...');
    await this.flush();
  }
}

// Create and export the singleton instance
export const logger = Logger.getInstance();

// Export types and utilities
export type { LogContext, ErrorContext, PerformanceMetrics, LogLevel };
export { Logger };

// Export convenience functions
export const createLogger = (config?: Partial<LoggerConfig>) => Logger.getInstance(config);

export const withCorrelationId = <T>(correlationId: string, fn: (logger: Logger) => T): T => {
  return logger.withCorrelationId(correlationId, fn);
};

export const createCorrelationId = (): string => logger.createCorrelationId();

// Development helper for debugging
if (process.env.NODE_ENV === 'development') {
  // Make logger available globally for debugging
  (global as any).logger = logger;
}