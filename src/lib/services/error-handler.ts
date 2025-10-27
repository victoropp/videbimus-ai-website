import { z } from 'zod';

/**
 * Import Sentry for error tracking
 * If Sentry is not configured, errors will be logged but tracking will fail loudly
 */
let Sentry: any = null;
let sentryAvailable = false;

try {
  Sentry = require('@sentry/nextjs');
  sentryAvailable = true;
} catch (error) {
  // Sentry package not installed - log warning but don't fail silently
  console.error(
    'CRITICAL: Sentry package is not installed. Error tracking is disabled. ' +
    'Install @sentry/nextjs to enable error tracking: npm install @sentry/nextjs'
  );
}

// Validate Sentry configuration if it's enabled
if (sentryAvailable && process.env.NODE_ENV === 'production') {
  const sentryDsn = process.env.SENTRY_DSN;
  if (!sentryDsn || sentryDsn.includes('placeholder') || sentryDsn.includes('disabled')) {
    console.error(
      'CRITICAL: Sentry is installed but SENTRY_DSN is not properly configured. ' +
      'Error tracking will not work in production. Set a valid SENTRY_DSN environment variable.'
    );
    sentryAvailable = false;
  }
}

// Error types
export enum ServiceErrorType {
  RATE_LIMIT = 'RATE_LIMIT',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  VALIDATION = 'VALIDATION',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  DATABASE = 'DATABASE',
  FILE_STORAGE = 'FILE_STORAGE',
  EMAIL = 'EMAIL',
  VIDEO = 'VIDEO',
  AI_SERVICE = 'AI_SERVICE',
  VECTOR_DATABASE = 'VECTOR_DATABASE',
  CRM = 'CRM',
  CALENDAR = 'CALENDAR',
  UNKNOWN = 'UNKNOWN',
}

export interface ServiceError extends Error {
  type: ServiceErrorType;
  service: string;
  operation: string;
  statusCode?: number;
  retryable: boolean;
  metadata?: Record<string, any>;
  originalError?: Error;
}

export class CustomServiceError extends Error implements ServiceError {
  public readonly type: ServiceErrorType;
  public readonly service: string;
  public readonly operation: string;
  public readonly statusCode?: number;
  public readonly retryable: boolean;
  public readonly metadata?: Record<string, any>;
  public readonly originalError?: Error;

  constructor({
    type,
    service,
    operation,
    message,
    statusCode,
    retryable = false,
    metadata,
    originalError,
  }: {
    type: ServiceErrorType;
    service: string;
    operation: string;
    message: string;
    statusCode?: number;
    retryable?: boolean;
    metadata?: Record<string, any>;
    originalError?: Error;
  }) {
    super(message);
    this.name = 'ServiceError';
    this.type = type;
    this.service = service;
    this.operation = operation;
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.metadata = metadata;
    this.originalError = originalError;
  }
}

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors?: ServiceErrorType[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  retryableErrors: [
    ServiceErrorType.NETWORK,
    ServiceErrorType.TIMEOUT,
    ServiceErrorType.RATE_LIMIT,
  ],
};

// Circuit breaker state
interface CircuitBreakerState {
  failures: number;
  lastFailure?: Date;
  nextAttempt?: Date;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

class CircuitBreaker {
  private states = new Map<string, CircuitBreakerState>();
  private readonly failureThreshold: number;
  private readonly recoveryTimeMs: number;

  constructor(failureThreshold = 5, recoveryTimeMs = 60000) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeMs = recoveryTimeMs;
  }

  canExecute(key: string): boolean {
    const state = this.getState(key);
    
    if (state.state === 'CLOSED') {
      return true;
    }
    
    if (state.state === 'OPEN') {
      if (state.nextAttempt && Date.now() >= state.nextAttempt.getTime()) {
        state.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    
    // HALF_OPEN state
    return true;
  }

  onSuccess(key: string): void {
    const state = this.getState(key);
    state.failures = 0;
    state.state = 'CLOSED';
    state.lastFailure = undefined;
    state.nextAttempt = undefined;
  }

  onFailure(key: string): void {
    const state = this.getState(key);
    state.failures++;
    state.lastFailure = new Date();
    
    if (state.failures >= this.failureThreshold) {
      state.state = 'OPEN';
      state.nextAttempt = new Date(Date.now() + this.recoveryTimeMs);
    }
  }

  private getState(key: string): CircuitBreakerState {
    if (!this.states.has(key)) {
      this.states.set(key, {
        failures: 0,
        state: 'CLOSED',
      });
    }
    return this.states.get(key)!;
  }

  getStats(key: string): CircuitBreakerState {
    return { ...this.getState(key) };
  }
}

export const circuitBreaker = new CircuitBreaker();

// Retry with exponential backoff and jitter
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  circuitBreakerKey?: string
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    // Check circuit breaker
    if (circuitBreakerKey && !circuitBreaker.canExecute(circuitBreakerKey)) {
      throw new CustomServiceError({
        type: ServiceErrorType.EXTERNAL_SERVICE,
        service: 'circuit-breaker',
        operation: 'execute',
        message: `Circuit breaker is OPEN for ${circuitBreakerKey}`,
        retryable: false,
      });
    }

    try {
      const result = await operation();
      
      // Success - reset circuit breaker
      if (circuitBreakerKey) {
        circuitBreaker.onSuccess(circuitBreakerKey);
      }
      
      return result;
    } catch (error) {
      const isLastAttempt = attempt === finalConfig.maxAttempts;
      const isRetryable = isErrorRetryable(error, finalConfig.retryableErrors);
      
      // Update circuit breaker on failure
      if (circuitBreakerKey) {
        circuitBreaker.onFailure(circuitBreakerKey);
      }
      
      if (isLastAttempt || !isRetryable) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = calculateDelay(attempt, finalConfig);
      await sleep(delay);
    }
  }
  
  throw new Error('Retry logic error - should not reach here');
}

function isErrorRetryable(error: any, retryableErrors?: ServiceErrorType[]): boolean {
  if (error instanceof CustomServiceError) {
    if (!error.retryable) return false;
    if (retryableErrors) {
      return retryableErrors.includes(error.type);
    }
    return error.retryable;
  }
  
  // Check for common retryable HTTP status codes
  if (error.statusCode || error.status) {
    const statusCode = error.statusCode || error.status;
    return [408, 429, 500, 502, 503, 504].includes(statusCode);
  }
  
  // Check for common retryable error messages
  if (error.message) {
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('econnreset') ||
      message.includes('enotfound') ||
      message.includes('rate limit')
    );
  }
  
  return false;
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  delay = Math.min(delay, config.maxDelay);
  
  if (config.jitter) {
    // Add jitter: ±25% of the delay
    const jitterAmount = delay * 0.25;
    delay += (Math.random() - 0.5) * 2 * jitterAmount;
  }
  
  return Math.max(0, Math.floor(delay));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Error handler class
export class ErrorHandler {
  static logError(error: ServiceError, context?: Record<string, any>): void {
    const logData = {
      error: {
        name: error.name,
        message: error.message,
        type: error.type,
        service: error.service,
        operation: error.operation,
        statusCode: error.statusCode,
        retryable: error.retryable,
        stack: error.stack,
      },
      metadata: error.metadata,
      context,
      timestamp: new Date().toISOString(),
    };

    // Always log to console
    console.error('Service Error:', logData);

    // Send to Sentry if available and properly configured
    if (!sentryAvailable) {
      console.error(
        'ERROR TRACKING UNAVAILABLE: This error was not sent to Sentry because ' +
        'error tracking is not properly configured. Configure Sentry to track errors in production.'
      );
    } else if (Sentry?.withScope) {
      try {
        Sentry.withScope(scope => {
          scope.setTag('service', error.service);
          scope.setTag('operation', error.operation);
          scope.setTag('errorType', error.type);
          scope.setLevel('error');

          if (error.metadata) {
            scope.setContext('metadata', error.metadata);
          }

          if (context) {
            scope.setContext('context', context);
          }

          Sentry.captureException(error.originalError || error);
        });
      } catch (sentryError) {
        console.error('Failed to send error to Sentry:', sentryError);
        console.error('Original error that failed to track:', logData);
      }
    }
  }

  static handleError(error: any, service: string, operation: string): ServiceError {
    if (error instanceof CustomServiceError) {
      return error;
    }

    // Convert common errors to ServiceError
    let type = ServiceErrorType.UNKNOWN;
    let retryable = false;
    let statusCode: number | undefined;

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      type = ServiceErrorType.NETWORK;
      retryable = true;
    } else if (error.code === 'ETIMEDOUT') {
      type = ServiceErrorType.TIMEOUT;
      retryable = true;
    } else if (error.statusCode || error.status) {
      statusCode = error.statusCode || error.status;
      
      if (statusCode === 401) {
        type = ServiceErrorType.AUTHENTICATION;
      } else if (statusCode === 403) {
        type = ServiceErrorType.AUTHORIZATION;
      } else if (statusCode === 429) {
        type = ServiceErrorType.RATE_LIMIT;
        retryable = true;
      } else if (statusCode >= 500) {
        type = ServiceErrorType.EXTERNAL_SERVICE;
        retryable = true;
      }
    }

    const serviceError = new CustomServiceError({
      type,
      service,
      operation,
      message: error.message || 'Unknown error occurred',
      statusCode,
      retryable,
      originalError: error,
    });

    this.logError(serviceError);
    return serviceError;
  }
}

// Utility function to wrap service calls with error handling
export function withErrorHandling<T extends any[], R>(
  service: string,
  operation: string,
  fn: (...args: T) => Promise<R>,
  retryConfig?: Partial<RetryConfig>
) {
  return async (...args: T): Promise<R> => {
    const circuitBreakerKey = `${service}:${operation}`;
    
    return retryWithBackoff(
      () => fn(...args),
      retryConfig,
      circuitBreakerKey
    ).catch(error => {
      throw ErrorHandler.handleError(error, service, operation);
    });
  };
}

// Health check utilities
export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  error?: string;
  metadata?: Record<string, any>;
}

export async function performHealthCheck(
  service: string,
  checkFn: () => Promise<any>
): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    await checkFn();
    const responseTime = Date.now() - startTime;
    
    return {
      service,
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      service,
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
