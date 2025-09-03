// Optional Sentry import - gracefully handle if not available
let Sentry: any = null;
try {
  Sentry = require('@sentry/nextjs');
} catch (error) {
  console.warn('Sentry not available:', error);
}
import { getAnalyticsConfig, isProduction } from '../config/services';
import { withErrorHandling, ServiceErrorType, CustomServiceError, performHealthCheck } from './error-handler';
import { aiService } from './ai';
import { emailService } from './email';
import { storageService } from './storage-mock'; // Using mock storage for deployment
import { videoService } from './video';
import { vectorStoreService } from './vector-store';
import { authService } from './auth';
import { prisma } from '../prisma';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  error?: string;
  metadata?: Record<string, any>;
  lastChecked: Date;
}

export interface SystemHealth {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: HealthCheckResult[];
  timestamp: Date;
  uptime: number;
}

export interface PerformanceMetrics {
  service: string;
  operation: string;
  duration: number;
  status: 'success' | 'error';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ErrorMetrics {
  service: string;
  operation: string;
  errorType: string;
  count: number;
  lastOccurred: Date;
  samples: {
    message: string;
    stack?: string;
    timestamp: Date;
  }[];
}

export interface UsageMetrics {
  service: string;
  operation: string;
  count: number;
  totalDuration: number;
  averageDuration: number;
  lastUsed: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: {
    service?: string;
    metric: 'response_time' | 'error_rate' | 'uptime' | 'usage_count';
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    timeWindow: number; // in minutes
  };
  actions: {
    type: 'email' | 'webhook' | 'slack';
    target: string;
  }[];
  enabled: boolean;
  cooldown: number; // minutes between alerts
  lastTriggered?: Date;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  service: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggeredAt: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

class MonitoringService {
  private config: ReturnType<typeof getAnalyticsConfig>;
  private performanceMetrics: Map<string, PerformanceMetrics[]> = new Map();
  private errorMetrics: Map<string, ErrorMetrics> = new Map();
  private usageMetrics: Map<string, UsageMetrics> = new Map();
  private healthResults: Map<string, HealthCheckResult> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private startTime: Date = new Date();
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    this.config = getAnalyticsConfig();
    this.initializeSentry();
    this.startHealthChecks();
  }

  private initializeSentry(): void {
    if (this.config.sentry.enabled && Sentry?.init) {
      Sentry.init({
        dsn: this.config.sentry.dsn,
        environment: this.config.sentry.environment,
        tracesSampleRate: this.config.sentry.tracesSampleRate,
        profilesSampleRate: this.config.sentry.profilesSampleRate,
        integrations: [
          ...(Sentry?.Integrations ? [
            new Sentry.Integrations.Http({ tracing: true }),
            new Sentry.Integrations.Prisma({ client: prisma }),
          ] : [])
        ],
        beforeSend(event, hint) {
          // Filter out low-priority errors in production
          if (isProduction() && event.level === 'warning') {
            return null;
          }
          return event;
        },
      });
    }
  }

  // Health checks
  async performSystemHealthCheck(): Promise<SystemHealth> {
    const services = [
      { name: 'database', check: () => this.checkDatabase() },
      { name: 'ai', check: () => aiService.healthCheck() },
      { name: 'email', check: () => emailService.healthCheck() },
      { name: 'storage', check: () => storageService.healthCheck() }, // Using mock storage
      { name: 'video', check: () => videoService.healthCheck() },
      { name: 'vector-store', check: () => vectorStoreService.healthCheck() },
      { name: 'auth', check: () => authService.healthCheck() },
    ];

    const healthChecks = await Promise.all(
      services.map(async (service) => {
        return await performHealthCheck(service.name, service.check);
      })
    );

    // Store results
    healthChecks.forEach(result => {
      this.healthResults.set(result.service, {
        ...result,
        lastChecked: new Date(),
      });
    });

    // Determine overall status
    const unhealthyCount = healthChecks.filter(r => r.status === 'unhealthy').length;
    const degradedCount = healthChecks.filter(r => r.status === 'degraded').length;
    
    let overall: 'healthy' | 'unhealthy' | 'degraded';
    if (unhealthyCount > 0) {
      overall = 'unhealthy';
    } else if (degradedCount > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    const systemHealth: SystemHealth = {
      overall,
      services: healthChecks.map(result => ({
        ...result,
        lastChecked: new Date(),
      })),
      timestamp: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
    };

    // Check alert rules
    await this.checkAlertRules(systemHealth);

    return systemHealth;
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  private startHealthChecks(): void {
    // Perform health checks every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performSystemHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 5 * 60 * 1000);
  }

  // Performance monitoring
  recordPerformanceMetric(metric: Omit<PerformanceMetrics, 'timestamp'>): void {
    const key = `${metric.service}:${metric.operation}`;
    const metrics = this.performanceMetrics.get(key) || [];
    
    metrics.push({
      ...metric,
      timestamp: new Date(),
    });

    // Keep only last 1000 metrics per operation
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }
    
    this.performanceMetrics.set(key, metrics);

    // Update usage metrics
    this.updateUsageMetrics(metric.service, metric.operation, metric.duration);

    // Send to Sentry if enabled
    if (this.config.sentry.enabled && Sentry?.addBreadcrumb) {
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `${metric.service}.${metric.operation}`,
        level: 'info',
        data: {
          duration: metric.duration,
          status: metric.status,
          ...metric.metadata,
        },
      });
    }
  }

  // Error monitoring
  recordError(service: string, operation: string, error: Error): void {
    const key = `${service}:${operation}`;
    const errorType = error.constructor.name;
    const metricKey = `${key}:${errorType}`;
    
    const existing = this.errorMetrics.get(metricKey);
    if (existing) {
      existing.count++;
      existing.lastOccurred = new Date();
      existing.samples.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
      });
      
      // Keep only last 10 samples
      if (existing.samples.length > 10) {
        existing.samples = existing.samples.slice(-10);
      }
    } else {
      this.errorMetrics.set(metricKey, {
        service,
        operation,
        errorType,
        count: 1,
        lastOccurred: new Date(),
        samples: [{
          message: error.message,
          stack: error.stack,
          timestamp: new Date(),
        }],
      });
    }

    // Send to Sentry
    if (this.config.sentry.enabled && Sentry?.withScope) {
      Sentry.withScope(scope => {
        scope.setTag('service', service);
        scope.setTag('operation', operation);
        scope.setLevel('error');
        Sentry.captureException(error);
      });
    }
  }

  private updateUsageMetrics(service: string, operation: string, duration: number): void {
    const key = `${service}:${operation}`;
    const existing = this.usageMetrics.get(key);
    
    if (existing) {
      existing.count++;
      existing.totalDuration += duration;
      existing.averageDuration = existing.totalDuration / existing.count;
      existing.lastUsed = new Date();
    } else {
      this.usageMetrics.set(key, {
        service,
        operation,
        count: 1,
        totalDuration: duration,
        averageDuration: duration,
        lastUsed: new Date(),
      });
    }
  }

  // Analytics
  getPerformanceMetrics(service?: string, operation?: string, timeRange?: {
    start: Date;
    end: Date;
  }): PerformanceMetrics[] {
    let allMetrics: PerformanceMetrics[] = [];
    
    for (const [key, metrics] of this.performanceMetrics.entries()) {
      const [metricService, metricOperation] = key.split(':');
      
      if (service && metricService !== service) continue;
      if (operation && metricOperation !== operation) continue;
      
      let filteredMetrics = metrics;
      if (timeRange) {
        filteredMetrics = metrics.filter(m => 
          m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
        );
      }
      
      allMetrics.push(...filteredMetrics);
    }
    
    return allMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getErrorMetrics(service?: string): ErrorMetrics[] {
    const results: ErrorMetrics[] = [];
    
    for (const [key, metrics] of this.errorMetrics.entries()) {
      if (service && !key.startsWith(`${service}:`)) continue;
      results.push(metrics);
    }
    
    return results.sort((a, b) => b.lastOccurred.getTime() - a.lastOccurred.getTime());
  }

  getUsageMetrics(service?: string): UsageMetrics[] {
    const results: UsageMetrics[] = [];
    
    for (const [key, metrics] of this.usageMetrics.entries()) {
      if (service && !key.startsWith(`${service}:`)) continue;
      results.push(metrics);
    }
    
    return results.sort((a, b) => b.count - a.count);
  }

  // Alerting
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
  }

  removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
  }

  private async checkAlertRules(systemHealth: SystemHealth): Promise<void> {
    for (const [ruleId, rule] of this.alertRules.entries()) {
      if (!rule.enabled) continue;
      
      // Check cooldown
      if (rule.lastTriggered) {
        const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
        if (timeSinceLastTrigger < rule.cooldown * 60 * 1000) {
          continue;
        }
      }

      const shouldTrigger = await this.evaluateAlertRule(rule, systemHealth);
      
      if (shouldTrigger) {
        await this.triggerAlert(rule);
      }
    }
  }

  private async evaluateAlertRule(rule: AlertRule, systemHealth: SystemHealth): Promise<boolean> {
    const { condition } = rule;
    
    if (condition.metric === 'uptime') {
      const uptimePercent = (systemHealth.uptime / (24 * 60 * 60 * 1000)) * 100;
      return this.compareValue(uptimePercent, condition.operator, condition.threshold);
    }
    
    if (condition.service) {
      const serviceHealth = systemHealth.services.find(s => s.service === condition.service);
      if (!serviceHealth) return false;
      
      if (condition.metric === 'response_time') {
        return this.compareValue(serviceHealth.responseTime, condition.operator, condition.threshold);
      }
    }
    
    // Add more condition evaluations as needed
    return false;
  }

  private compareValue(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      default: return false;
    }
  }

  private async triggerAlert(rule: AlertRule): Promise<void> {
    const alert: Alert = {
      id: crypto.randomUUID(),
      ruleId: rule.id,
      ruleName: rule.name,
      service: rule.condition.service || 'system',
      message: `Alert: ${rule.name} triggered`,
      severity: this.determineSeverity(rule),
      triggeredAt: new Date(),
      acknowledged: false,
      resolved: false,
    };

    this.activeAlerts.set(alert.id, alert);
    
    // Update rule last triggered time
    rule.lastTriggered = new Date();
    
    // Execute alert actions
    for (const action of rule.actions) {
      try {
        await this.executeAlertAction(action, alert);
      } catch (error) {
        console.error('Failed to execute alert action:', error);
      }
    }

    // Send to Sentry
    if (this.config.sentry.enabled && Sentry?.withScope) {
      Sentry.withScope(scope => {
        scope.setTag('alert', rule.name);
        scope.setTag('service', alert.service);
        scope.setLevel(alert.severity === 'critical' ? 'error' : 'warning');
        Sentry.captureMessage(`Alert triggered: ${alert.message}`);
      });
    }
  }

  private determineSeverity(rule: AlertRule): Alert['severity'] {
    // Determine severity based on the metric and threshold
    // This is a simplified implementation
    if (rule.condition.metric === 'uptime' && rule.condition.threshold < 95) {
      return 'critical';
    }
    if (rule.condition.metric === 'response_time' && rule.condition.threshold > 5000) {
      return 'high';
    }
    return 'medium';
  }

  private async executeAlertAction(action: AlertRule['actions'][0], alert: Alert): Promise<void> {
    switch (action.type) {
      case 'email':
        // Implementation would depend on your email service
        console.log(`Email alert to ${action.target}:`, alert.message);
        break;
      case 'webhook':
        await fetch(action.target, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert),
        });
        break;
      case 'slack':
        // Implementation would depend on Slack webhook integration
        console.log(`Slack alert to ${action.target}:`, alert.message);
        break;
    }
  }

  // Alert management
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values())
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date();
      alert.acknowledgedBy = acknowledgedBy;
      return true;
    }
    return false;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  // System information
  getSystemInfo(): {
    uptime: number;
    nodeVersion: string;
    platform: string;
    memory: NodeJS.MemoryUsage;
    loadAverage?: number[];
  } {
    return {
      uptime: Date.now() - this.startTime.getTime(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      loadAverage: process.platform !== 'win32' ? process.loadavg() : undefined,
    };
  }

  // Cleanup
  cleanup(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  // Export metrics for external monitoring systems
  exportMetrics(): {
    performance: PerformanceMetrics[];
    errors: ErrorMetrics[];
    usage: UsageMetrics[];
    health: HealthCheckResult[];
    alerts: Alert[];
    system: ReturnType<MonitoringService['getSystemInfo']>;
  } {
    return {
      performance: this.getPerformanceMetrics(),
      errors: this.getErrorMetrics(),
      usage: this.getUsageMetrics(),
      health: Array.from(this.healthResults.values()),
      alerts: this.getActiveAlerts(),
      system: this.getSystemInfo(),
    };
  }
}

// Create wrapped methods with error handling
const rawMonitoringService = new MonitoringService();

export const monitoringService = {
  performSystemHealthCheck: withErrorHandling('monitoring', 'performSystemHealthCheck', rawMonitoringService.performSystemHealthCheck.bind(rawMonitoringService), { maxAttempts: 1 }),
  recordPerformanceMetric: rawMonitoringService.recordPerformanceMetric.bind(rawMonitoringService),
  recordError: rawMonitoringService.recordError.bind(rawMonitoringService),
  getPerformanceMetrics: rawMonitoringService.getPerformanceMetrics.bind(rawMonitoringService),
  getErrorMetrics: rawMonitoringService.getErrorMetrics.bind(rawMonitoringService),
  getUsageMetrics: rawMonitoringService.getUsageMetrics.bind(rawMonitoringService),
  addAlertRule: rawMonitoringService.addAlertRule.bind(rawMonitoringService),
  removeAlertRule: rawMonitoringService.removeAlertRule.bind(rawMonitoringService),
  getActiveAlerts: rawMonitoringService.getActiveAlerts.bind(rawMonitoringService),
  acknowledgeAlert: rawMonitoringService.acknowledgeAlert.bind(rawMonitoringService),
  resolveAlert: rawMonitoringService.resolveAlert.bind(rawMonitoringService),
  getSystemInfo: rawMonitoringService.getSystemInfo.bind(rawMonitoringService),
  exportMetrics: rawMonitoringService.exportMetrics.bind(rawMonitoringService),
  cleanup: rawMonitoringService.cleanup.bind(rawMonitoringService),
};

export { MonitoringService };

// Utility function to instrument async functions with monitoring
export function withMonitoring<T extends any[], R>(
  service: string,
  operation: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      
      monitoringService.recordPerformanceMetric({
        service,
        operation,
        duration: Date.now() - startTime,
        status: 'success',
      });
      
      return result;
    } catch (error) {
      monitoringService.recordPerformanceMetric({
        service,
        operation,
        duration: Date.now() - startTime,
        status: 'error',
      });
      
      monitoringService.recordError(service, operation, error as Error);
      
      throw error;
    }
  };
}
