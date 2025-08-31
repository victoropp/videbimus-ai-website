import { z } from 'zod';
import { prismaManager } from '@/lib/database/prisma';
import { logger } from './logger';

// Metric types enum
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
}

// Metric value schema
const MetricValueSchema = z.union([
  z.number(),
  z.object({
    value: z.number(),
    labels: z.record(z.string()),
  }),
  z.object({
    count: z.number(),
    sum: z.number(),
    buckets: z.record(z.number()),
  }),
  z.object({
    count: z.number(),
    sum: z.number(),
    quantiles: z.record(z.number()),
  }),
]);

type MetricValue = z.infer<typeof MetricValueSchema>;

// Metric definition
interface Metric {
  name: string;
  type: MetricType;
  value: MetricValue;
  labels?: Record<string, string>;
  timestamp: Date;
  category?: string;
  unit?: string;
  metadata?: Record<string, any>;
}

// Metrics collector configuration
interface MetricsCollectorConfig {
  enabled: boolean;
  collectionInterval: number; // milliseconds
  retentionPeriod: number; // days
  batchSize: number;
  enableSystemMetrics: boolean;
  enableCustomMetrics: boolean;
  enablePerformanceMetrics: boolean;
}

class MetricsCollector {
  private static instance: MetricsCollector;
  private config: MetricsCollectorConfig;
  private metrics: Map<string, Metric> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, { buckets: Map<number, number>; sum: number; count: number }> = new Map();
  private collectionTimer?: NodeJS.Timeout;
  private isCollecting = false;

  private constructor(config?: Partial<MetricsCollectorConfig>) {
    this.config = {
      enabled: process.env.ENABLE_METRICS === 'true' || process.env.NODE_ENV === 'production',
      collectionInterval: 30000, // 30 seconds
      retentionPeriod: 30, // 30 days
      batchSize: 100,
      enableSystemMetrics: true,
      enableCustomMetrics: true,
      enablePerformanceMetrics: true,
      ...config,
    };

    if (this.config.enabled) {
      this.startCollection();
    }
  }

  static getInstance(config?: Partial<MetricsCollectorConfig>): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector(config);
    }
    return MetricsCollector.instance;
  }

  private startCollection(): void {
    if (this.isCollecting) {
      return;
    }

    this.isCollecting = true;
    logger.info('Metrics collection started', {
      metadata: { collectionInterval: this.config.collectionInterval },
    });

    this.collectionTimer = setInterval(() => {
      this.collectSystemMetrics();
      this.persistMetrics();
    }, this.config.collectionInterval);

    // Cleanup old metrics on startup
    this.cleanupOldMetrics();
  }

  private async collectSystemMetrics(): Promise<void> {
    if (!this.config.enableSystemMetrics) {
      return;
    }

    try {
      // Memory metrics
      const memoryUsage = process.memoryUsage();
      this.gauge('system.memory.heap_used', memoryUsage.heapUsed, { unit: 'bytes' });
      this.gauge('system.memory.heap_total', memoryUsage.heapTotal, { unit: 'bytes' });
      this.gauge('system.memory.external', memoryUsage.external, { unit: 'bytes' });
      this.gauge('system.memory.rss', memoryUsage.rss, { unit: 'bytes' });

      // CPU metrics
      const cpuUsage = process.cpuUsage();
      this.gauge('system.cpu.user', cpuUsage.user, { unit: 'microseconds' });
      this.gauge('system.cpu.system', cpuUsage.system, { unit: 'microseconds' });

      // Process metrics
      this.gauge('system.process.pid', process.pid);
      this.gauge('system.process.uptime', process.uptime(), { unit: 'seconds' });

      // Event loop lag (simple estimation)
      const start = process.hrtime.bigint();
      setImmediate(() => {
        const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds
        this.gauge('system.eventloop.lag', lag, { unit: 'milliseconds' });
      });

      // Node.js version info
      this.gauge('system.node.version', parseFloat(process.version.substring(1)));

    } catch (error) {
      logger.error('Failed to collect system metrics', { error });
    }
  }

  private async persistMetrics(): Promise<void> {
    if (this.metrics.size === 0) {
      return;
    }

    try {
      const metricsToSave: Metric[] = Array.from(this.metrics.values()).slice(0, this.config.batchSize);
      
      // Clear saved metrics from memory
      metricsToSave.forEach(metric => this.metrics.delete(metric.name));

      // Save to database
      const prisma = prismaManager.getClient();
      
      await Promise.all(
        metricsToSave.map(metric =>
          prisma.performanceMetric.create({
            data: {
              name: metric.name,
              value: metric.value as any,
              type: metric.type.toUpperCase() as any,
              category: metric.category || 'custom',
              unit: metric.unit,
              timestamp: metric.timestamp,
              metadata: metric.metadata,
            },
          })
        )
      );

      logger.debug(`Persisted ${metricsToSave.length} metrics`);

    } catch (error) {
      logger.error('Failed to persist metrics', { error });
    }
  }

  private async cleanupOldMetrics(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - this.config.retentionPeriod * 24 * 60 * 60 * 1000);
      
      const prisma = prismaManager.getClient();
      const deleted = await prisma.performanceMetric.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      logger.info(`Cleaned up ${deleted.count} old metrics`);

    } catch (error) {
      logger.error('Failed to cleanup old metrics', { error });
    }
  }

  // Core metric methods
  counter(name: string, increment: number = 1, options: { labels?: Record<string, string>; category?: string; unit?: string } = {}): void {
    if (!this.config.enabled || !this.config.enableCustomMetrics) {
      return;
    }

    const currentValue = this.counters.get(name) || 0;
    const newValue = currentValue + increment;
    this.counters.set(name, newValue);

    this.recordMetric({
      name,
      type: MetricType.COUNTER,
      value: newValue,
      labels: options.labels,
      category: options.category,
      unit: options.unit,
      timestamp: new Date(),
    });
  }

  gauge(name: string, value: number, options: { labels?: Record<string, string>; category?: string; unit?: string } = {}): void {
    if (!this.config.enabled || !this.config.enableCustomMetrics) {
      return;
    }

    this.gauges.set(name, value);

    this.recordMetric({
      name,
      type: MetricType.GAUGE,
      value,
      labels: options.labels,
      category: options.category,
      unit: options.unit,
      timestamp: new Date(),
    });
  }

  histogram(name: string, value: number, buckets: number[] = [0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0], options: { labels?: Record<string, string>; category?: string; unit?: string } = {}): void {
    if (!this.config.enabled || !this.config.enableCustomMetrics) {
      return;
    }

    let histogram = this.histograms.get(name);
    if (!histogram) {
      histogram = { buckets: new Map(), sum: 0, count: 0 };
      this.histograms.set(name, histogram);
    }

    histogram.sum += value;
    histogram.count += 1;

    // Update buckets
    for (const bucket of buckets) {
      if (value <= bucket) {
        histogram.buckets.set(bucket, (histogram.buckets.get(bucket) || 0) + 1);
      }
    }

    this.recordMetric({
      name,
      type: MetricType.HISTOGRAM,
      value: {
        count: histogram.count,
        sum: histogram.sum,
        buckets: Object.fromEntries(histogram.buckets),
      },
      labels: options.labels,
      category: options.category,
      unit: options.unit,
      timestamp: new Date(),
    });
  }

  // Business metrics
  recordAPICall(method: string, path: string, statusCode: number, duration: number, labels?: Record<string, string>): void {
    this.counter('api.requests.total', 1, { 
      labels: { method, path, status: statusCode.toString(), ...labels },
      category: 'api',
    });
    
    this.histogram('api.request.duration', duration, [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000], {
      labels: { method, path, ...labels },
      category: 'api',
      unit: 'milliseconds',
    });

    if (statusCode >= 400) {
      this.counter('api.errors.total', 1, {
        labels: { method, path, status: statusCode.toString(), ...labels },
        category: 'api',
      });
    }
  }

  recordDatabaseQuery(operation: string, table: string, duration: number, success: boolean, labels?: Record<string, string>): void {
    this.counter('database.queries.total', 1, {
      labels: { operation, table, success: success.toString(), ...labels },
      category: 'database',
    });

    this.histogram('database.query.duration', duration, [1, 5, 10, 25, 50, 100, 250, 500, 1000], {
      labels: { operation, table, ...labels },
      category: 'database',
      unit: 'milliseconds',
    });
  }

  recordCacheOperation(operation: 'get' | 'set' | 'del', hit: boolean, duration: number, labels?: Record<string, string>): void {
    this.counter('cache.operations.total', 1, {
      labels: { operation, hit: hit.toString(), ...labels },
      category: 'cache',
    });

    this.histogram('cache.operation.duration', duration, [0.1, 0.5, 1, 2.5, 5, 10, 25, 50], {
      labels: { operation, ...labels },
      category: 'cache',
      unit: 'milliseconds',
    });

    if (operation === 'get') {
      this.counter(hit ? 'cache.hits.total' : 'cache.misses.total', 1, {
        labels,
        category: 'cache',
      });
    }
  }

  recordUserActivity(action: string, userId?: string, labels?: Record<string, string>): void {
    this.counter('user.activities.total', 1, {
      labels: { action, ...(userId && { user_type: 'authenticated' }), ...labels },
      category: 'user',
    });

    if (userId) {
      this.gauge('user.active.last_seen', Date.now(), {
        labels: { userId, ...labels },
        category: 'user',
        unit: 'timestamp',
      });
    }
  }

  recordBusinessEvent(event: string, value?: number, labels?: Record<string, string>): void {
    this.counter('business.events.total', 1, {
      labels: { event, ...labels },
      category: 'business',
    });

    if (value !== undefined) {
      this.gauge(`business.event.${event}.value`, value, {
        labels,
        category: 'business',
      });
    }
  }

  recordSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', labels?: Record<string, string>): void {
    this.counter('security.events.total', 1, {
      labels: { event, severity, ...labels },
      category: 'security',
    });
  }

  // Health metrics
  recordHealthCheck(service: string, healthy: boolean, responseTime: number, labels?: Record<string, string>): void {
    this.gauge('health.service.status', healthy ? 1 : 0, {
      labels: { service, ...labels },
      category: 'health',
    });

    this.histogram('health.service.response_time', responseTime, [10, 25, 50, 100, 250, 500, 1000, 2000], {
      labels: { service, ...labels },
      category: 'health',
      unit: 'milliseconds',
    });
  }

  // Performance metrics
  recordPerformanceMetric(operation: string, duration: number, metadata?: Record<string, any>): void {
    if (!this.config.enablePerformanceMetrics) {
      return;
    }

    this.histogram('performance.operation.duration', duration, [10, 50, 100, 250, 500, 1000, 2500, 5000], {
      labels: { operation },
      category: 'performance',
      unit: 'milliseconds',
    });

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (typeof value === 'number') {
          this.gauge(`performance.${operation}.${key}`, value, {
            category: 'performance',
          });
        }
      });
    }
  }

  // Internal methods
  private recordMetric(metric: Metric): void {
    this.metrics.set(`${metric.name}_${Date.now()}_${Math.random()}`, metric);
  }

  // Utility methods
  getMetricsSummary(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, any>;
    totalMetrics: number;
  } {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(
        Array.from(this.histograms.entries()).map(([name, hist]) => [
          name,
          {
            count: hist.count,
            sum: hist.sum,
            buckets: Object.fromEntries(hist.buckets),
          },
        ])
      ),
      totalMetrics: this.metrics.size,
    };
  }

  async getMetricsFromDatabase(
    name?: string,
    category?: string,
    from?: Date,
    to?: Date,
    limit: number = 1000
  ): Promise<any[]> {
    try {
      const prisma = prismaManager.getClient();
      
      const where: any = {};
      if (name) where.name = { contains: name };
      if (category) where.category = category;
      if (from || to) {
        where.timestamp = {};
        if (from) where.timestamp.gte = from;
        if (to) where.timestamp.lte = to;
      }

      const metrics = await prisma.performanceMetric.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return metrics;

    } catch (error) {
      logger.error('Failed to fetch metrics from database', { error });
      return [];
    }
  }

  // Configuration methods
  enable(): void {
    this.config.enabled = true;
    if (!this.isCollecting) {
      this.startCollection();
    }
    logger.info('Metrics collection enabled');
  }

  disable(): void {
    this.config.enabled = false;
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = undefined;
    }
    this.isCollecting = false;
    logger.info('Metrics collection disabled');
  }

  setConfig(config: Partial<MetricsCollectorConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Metrics collector configuration updated', { metadata: config });
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    logger.info('Metrics collector shutting down...');
    this.disable();
    await this.persistMetrics();
    logger.info('Metrics collector shutdown complete');
  }
}

// Create and export singleton instance
export const metricsCollector = MetricsCollector.getInstance();

// Export types and utilities
export type { Metric, MetricsCollectorConfig };
export { MetricsCollector };

// Convenience functions
export const recordAPICall = (method: string, path: string, statusCode: number, duration: number, labels?: Record<string, string>) =>
  metricsCollector.recordAPICall(method, path, statusCode, duration, labels);

export const recordDatabaseQuery = (operation: string, table: string, duration: number, success: boolean, labels?: Record<string, string>) =>
  metricsCollector.recordDatabaseQuery(operation, table, duration, success, labels);

export const recordCacheOperation = (operation: 'get' | 'set' | 'del', hit: boolean, duration: number, labels?: Record<string, string>) =>
  metricsCollector.recordCacheOperation(operation, hit, duration, labels);

export const recordUserActivity = (action: string, userId?: string, labels?: Record<string, string>) =>
  metricsCollector.recordUserActivity(action, userId, labels);

export const recordBusinessEvent = (event: string, value?: number, labels?: Record<string, string>) =>
  metricsCollector.recordBusinessEvent(event, value, labels);

export const recordSecurityEvent = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', labels?: Record<string, string>) =>
  metricsCollector.recordSecurityEvent(event, severity, labels);

export const recordHealthCheck = (service: string, healthy: boolean, responseTime: number, labels?: Record<string, string>) =>
  metricsCollector.recordHealthCheck(service, healthy, responseTime, labels);

export const recordPerformanceMetric = (operation: string, duration: number, metadata?: Record<string, any>) =>
  metricsCollector.recordPerformanceMetric(operation, duration, metadata);

// Development helper
if (process.env.NODE_ENV === 'development') {
  (global as any).metricsCollector = metricsCollector;
}