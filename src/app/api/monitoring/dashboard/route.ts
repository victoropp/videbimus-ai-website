import { NextRequest, NextResponse } from 'next/server';
import { prismaManager } from '@/lib/database/prisma';
import { metricsCollector } from '@/lib/monitoring/metrics';
import { logger } from '@/lib/monitoring/logger';
import { z } from 'zod';

// Request parameters schema
const DashboardParamsSchema = z.object({
  period: z.enum(['1h', '6h', '24h', '7d', '30d']).nullable().optional().default('24h'),
  category: z.string().nullable().optional(),
  detailed: z.boolean().optional().default(false),
});

// Helper function to get time range
function getTimeRange(period: string): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();

  switch (period) {
    case '1h':
      from.setHours(from.getHours() - 1);
      break;
    case '6h':
      from.setHours(from.getHours() - 6);
      break;
    case '24h':
      from.setDate(from.getDate() - 1);
      break;
    case '7d':
      from.setDate(from.getDate() - 7);
      break;
    case '30d':
      from.setDate(from.getDate() - 30);
      break;
  }

  return { from, to };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const params = DashboardParamsSchema.parse({
      period: searchParams.get('period') as any,
      category: searchParams.get('category'),
      detailed: searchParams.get('detailed') === 'true',
    });

    const { from, to } = getTimeRange(params.period);

    logger.info('Dashboard data requested', {
      metadata: { params, timeRange: { from, to } },
    });

    // Get system health status
    const systemHealth = await getSystemHealth();
    
    // Get performance metrics
    const performanceMetrics = await getPerformanceMetrics(from, to, params.category);
    
    // Get API metrics
    const apiMetrics = await getAPIMetrics(from, to);
    
    // Get database metrics
    const databaseMetrics = await getDatabaseMetrics(from, to);
    
    // Get user activity metrics
    const userMetrics = await getUserActivityMetrics(from, to);
    
    // Get business metrics
    const businessMetrics = await getBusinessMetrics(from, to);

    // Get real-time metrics summary
    const realTimeMetrics = metricsCollector.getMetricsSummary();

    const dashboard = {
      timestamp: new Date().toISOString(),
      timeRange: { from: from.toISOString(), to: to.toISOString() },
      period: params.period,
      systemHealth,
      performance: performanceMetrics,
      api: apiMetrics,
      database: databaseMetrics,
      users: userMetrics,
      business: businessMetrics,
      realTime: realTimeMetrics,
    };

    // Add detailed information if requested
    if (params.detailed) {
      dashboard.detailed = await getDetailedMetrics(from, to, params.category);
    }

    const duration = Date.now() - startTime;
    metricsCollector.recordAPICall('GET', '/api/monitoring/dashboard', 200, duration);
    
    logger.info('Dashboard data generated', {
      metadata: { duration, metricsCount: Object.keys(dashboard).length },
    });

    return NextResponse.json(dashboard);

  } catch (error) {
    const duration = Date.now() - startTime;
    metricsCollector.recordAPICall('GET', '/api/monitoring/dashboard', 500, duration);
    
    logger.error('Dashboard data generation failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { duration },
    });

    return NextResponse.json(
      {
        error: 'Failed to generate dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

async function getSystemHealth() {
  try {
    const prisma = prismaManager.getClient();
    
    // Get latest health records
    const healthRecords = await prisma.systemHealth.findMany({
      orderBy: { lastCheck: 'desc' },
      take: 10,
    });

    // Get database health
    const dbHealth = await prismaManager.healthCheck();
    
    const services = {
      database: {
        status: dbHealth.status,
        responseTime: dbHealth.latency,
        lastCheck: new Date().toISOString(),
      },
      api: {
        status: 'healthy' as const,
        responseTime: 0,
        lastCheck: new Date().toISOString(),
      },
    };

    // Process health records
    healthRecords.forEach(record => {
      services[record.service] = {
        status: record.status,
        responseTime: record.responseTime || 0,
        lastCheck: record.lastCheck.toISOString(),
        uptime: record.uptime,
      };
    });

    const overallStatus = Object.values(services).every(s => s.status === 'healthy') 
      ? 'healthy' 
      : 'degraded';

    return {
      overall: overallStatus,
      services,
      lastUpdate: new Date().toISOString(),
    };

  } catch (error) {
    logger.error('Failed to get system health', { error });
    return {
      overall: 'unhealthy',
      services: {},
      error: 'Failed to retrieve health data',
      lastUpdate: new Date().toISOString(),
    };
  }
}

async function getPerformanceMetrics(from: Date, to: Date, category?: string) {
  try {
    const prisma = prismaManager.getClient();
    
    const where: any = {
      timestamp: { gte: from, lte: to },
      category: 'performance',
    };
    
    if (category) {
      where.name = { contains: category };
    }

    const metrics = await prisma.performanceMetric.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });

    // Aggregate metrics
    const aggregated = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = {
          name: metric.name,
          type: metric.type,
          category: metric.category,
          unit: metric.unit,
          values: [],
          latest: null,
          avg: 0,
          min: Infinity,
          max: -Infinity,
        };
      }

      const value = typeof metric.value === 'number' ? metric.value : (metric.value as any)?.value || 0;
      acc[metric.name].values.push({ value, timestamp: metric.timestamp });
      acc[metric.name].latest = value;
      acc[metric.name].avg = acc[metric.name].values.reduce((sum, v) => sum + v.value, 0) / acc[metric.name].values.length;
      acc[metric.name].min = Math.min(acc[metric.name].min, value);
      acc[metric.name].max = Math.max(acc[metric.name].max, value);

      return acc;
    }, {} as any);

    return {
      summary: {
        totalMetrics: metrics.length,
        uniqueMetrics: Object.keys(aggregated).length,
        timeRange: { from, to },
      },
      metrics: Object.values(aggregated),
    };

  } catch (error) {
    logger.error('Failed to get performance metrics', { error });
    return {
      summary: { totalMetrics: 0, uniqueMetrics: 0, timeRange: { from, to } },
      metrics: [],
      error: 'Failed to retrieve performance metrics',
    };
  }
}

async function getAPIMetrics(from: Date, to: Date) {
  try {
    const metrics = await metricsCollector.getMetricsFromDatabase(
      'api',
      'api',
      from,
      to,
      1000
    );

    const requestMetrics = metrics.filter(m => m.name.includes('requests.total'));
    const errorMetrics = metrics.filter(m => m.name.includes('errors.total'));
    const durationMetrics = metrics.filter(m => m.name.includes('duration'));

    const totalRequests = requestMetrics.reduce((sum, m) => sum + (typeof m.value === 'number' ? m.value : 0), 0);
    const totalErrors = errorMetrics.reduce((sum, m) => sum + (typeof m.value === 'number' ? m.value : 0), 0);
    const avgDuration = durationMetrics.length > 0
      ? durationMetrics.reduce((sum, m) => sum + (typeof m.value === 'number' ? m.value : 0), 0) / durationMetrics.length
      : 0;

    return {
      summary: {
        totalRequests,
        totalErrors,
        errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
        avgResponseTime: avgDuration,
      },
      endpoints: getTopEndpoints(requestMetrics),
      errors: getTopErrors(errorMetrics),
      responseTimes: durationMetrics.slice(0, 50),
    };

  } catch (error) {
    logger.error('Failed to get API metrics', { error });
    return {
      summary: { totalRequests: 0, totalErrors: 0, errorRate: 0, avgResponseTime: 0 },
      endpoints: [],
      errors: [],
      responseTimes: [],
      error: 'Failed to retrieve API metrics',
    };
  }
}

async function getDatabaseMetrics(from: Date, to: Date) {
  try {
    const metrics = await metricsCollector.getMetricsFromDatabase(
      'database',
      'database',
      from,
      to,
      1000
    );

    const queryMetrics = metrics.filter(m => m.name.includes('queries.total'));
    const durationMetrics = metrics.filter(m => m.name.includes('duration'));

    const totalQueries = queryMetrics.reduce((sum, m) => sum + (typeof m.value === 'number' ? m.value : 0), 0);
    const avgDuration = durationMetrics.length > 0
      ? durationMetrics.reduce((sum, m) => sum + (typeof m.value === 'number' ? m.value : 0), 0) / durationMetrics.length
      : 0;

    // Get connection info
    const connectionInfo = await prismaManager.getConnectionInfo();

    return {
      summary: {
        totalQueries,
        avgQueryTime: avgDuration,
        connectionPool: {
          size: connectionInfo.poolSize,
          active: connectionInfo.activeConnections || 0,
          idle: connectionInfo.poolSize - (connectionInfo.activeConnections || 0),
        },
      },
      slowQueries: durationMetrics
        .filter(m => typeof m.value === 'number' && m.value > 100)
        .slice(0, 20),
      queryTypes: getQueryTypeDistribution(queryMetrics),
    };

  } catch (error) {
    logger.error('Failed to get database metrics', { error });
    return {
      summary: { totalQueries: 0, avgQueryTime: 0, connectionPool: { size: 0, active: 0, idle: 0 } },
      slowQueries: [],
      queryTypes: {},
      error: 'Failed to retrieve database metrics',
    };
  }
}

async function getUserActivityMetrics(from: Date, to: Date) {
  try {
    const metrics = await metricsCollector.getMetricsFromDatabase(
      'user',
      'user',
      from,
      to,
      1000
    );

    const activityMetrics = metrics.filter(m => m.name.includes('activities.total'));
    const totalActivities = activityMetrics.reduce((sum, m) => sum + (typeof m.value === 'number' ? m.value : 0), 0);

    // Get unique users from database
    const prisma = prismaManager.getClient();
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: { gte: from },
      },
    });

    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: from, lte: to },
      },
    });

    return {
      summary: {
        totalActivities,
        activeUsers,
        newUsers,
      },
      topActions: getTopUserActions(activityMetrics),
      activityTimeline: activityMetrics.slice(0, 100),
    };

  } catch (error) {
    logger.error('Failed to get user activity metrics', { error });
    return {
      summary: { totalActivities: 0, activeUsers: 0, newUsers: 0 },
      topActions: [],
      activityTimeline: [],
      error: 'Failed to retrieve user metrics',
    };
  }
}

async function getBusinessMetrics(from: Date, to: Date) {
  try {
    const prisma = prismaManager.getClient();

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalConsultations,
      completedConsultations,
      totalContacts,
      newContacts,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.project.count({ 
        where: { 
          status: 'COMPLETED',
          updatedAt: { gte: from, lte: to },
        },
      }),
      prisma.consultation.count(),
      prisma.consultation.count({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: from, lte: to },
        },
      }),
      prisma.contact.count(),
      prisma.contact.count({
        where: { createdAt: { gte: from, lte: to } },
      }),
    ]);

    return {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
      },
      consultations: {
        total: totalConsultations,
        completed: completedConsultations,
      },
      leads: {
        total: totalContacts,
        new: newContacts,
      },
    };

  } catch (error) {
    logger.error('Failed to get business metrics', { error });
    return {
      projects: { total: 0, active: 0, completed: 0 },
      consultations: { total: 0, completed: 0 },
      leads: { total: 0, new: 0 },
      error: 'Failed to retrieve business metrics',
    };
  }
}

async function getDetailedMetrics(from: Date, to: Date, category?: string) {
  try {
    const allMetrics = await metricsCollector.getMetricsFromDatabase(
      undefined,
      category,
      from,
      to,
      2000
    );

    return {
      total: allMetrics.length,
      categories: [...new Set(allMetrics.map(m => m.category))],
      types: [...new Set(allMetrics.map(m => m.type))],
      rawMetrics: allMetrics.slice(0, 100), // Limit for response size
    };

  } catch (error) {
    logger.error('Failed to get detailed metrics', { error });
    return {
      total: 0,
      categories: [],
      types: [],
      rawMetrics: [],
      error: 'Failed to retrieve detailed metrics',
    };
  }
}

// Helper functions
function getTopEndpoints(metrics: any[]): any[] {
  const endpoints = new Map();
  
  metrics.forEach(metric => {
    const endpoint = metric.metadata?.labels?.path || 'unknown';
    const count = typeof metric.value === 'number' ? metric.value : 1;
    endpoints.set(endpoint, (endpoints.get(endpoint) || 0) + count);
  });

  return Array.from(endpoints.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function getTopErrors(metrics: any[]): any[] {
  const errors = new Map();
  
  metrics.forEach(metric => {
    const error = `${metric.metadata?.labels?.method || 'UNKNOWN'} ${metric.metadata?.labels?.path || 'unknown'} (${metric.metadata?.labels?.status || '500'})`;
    const count = typeof metric.value === 'number' ? metric.value : 1;
    errors.set(error, (errors.get(error) || 0) + count);
  });

  return Array.from(errors.entries())
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function getQueryTypeDistribution(metrics: any[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  metrics.forEach(metric => {
    const operation = metric.metadata?.labels?.operation || 'unknown';
    const count = typeof metric.value === 'number' ? metric.value : 1;
    distribution[operation] = (distribution[operation] || 0) + count;
  });

  return distribution;
}

function getTopUserActions(metrics: any[]): any[] {
  const actions = new Map();
  
  metrics.forEach(metric => {
    const action = metric.metadata?.labels?.action || 'unknown';
    const count = typeof metric.value === 'number' ? metric.value : 1;
    actions.set(action, (actions.get(action) || 0) + count);
  });

  return Array.from(actions.entries())
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}