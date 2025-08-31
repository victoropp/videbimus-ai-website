import { NextRequest, NextResponse } from 'next/server';
import { monitoringService } from '@/lib/services/monitoring';
import { aiService } from '@/lib/services/ai';

export async function GET(request: NextRequest) {
  try {
    // Check if user has admin access (you might want to implement proper authorization)
    const searchParams = request.nextUrl.searchParams;
    const service = searchParams.get('service');
    const timeRange = {
      start: searchParams.get('start') ? new Date(searchParams.get('start')!) : new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: searchParams.get('end') ? new Date(searchParams.get('end')!) : new Date(),
    };
    
    // Get performance metrics
    const performanceMetrics = monitoringService.getPerformanceMetrics(
      service || undefined,
      undefined,
      timeRange
    );
    
    // Get error metrics
    const errorMetrics = monitoringService.getErrorMetrics(service || undefined);
    
    // Get usage metrics
    const usageMetrics = monitoringService.getUsageMetrics(service || undefined);
    
    // Get AI service usage if available
    const aiUsageStats = aiService.getUsageStats();
    
    // Calculate summary statistics
    const summaryStats = {
      totalRequests: usageMetrics.reduce((sum, metric) => sum + metric.count, 0),
      totalErrors: errorMetrics.reduce((sum, metric) => sum + metric.count, 0),
      averageResponseTime: performanceMetrics.length > 0 
        ? performanceMetrics.reduce((sum, metric) => sum + metric.duration, 0) / performanceMetrics.length
        : 0,
      errorRate: 0,
      successRate: 0,
    };
    
    const totalOperations = performanceMetrics.length;
    const successfulOperations = performanceMetrics.filter(m => m.status === 'success').length;
    
    summaryStats.errorRate = totalOperations > 0 ? ((totalOperations - successfulOperations) / totalOperations) * 100 : 0;
    summaryStats.successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0;
    
    // Group performance metrics by hour for trending
    const hourlyMetrics = performanceMetrics.reduce((acc, metric) => {
      const hour = new Date(metric.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
      if (!acc[hour]) {
        acc[hour] = {
          timestamp: hour,
          count: 0,
          totalDuration: 0,
          errors: 0,
        };
      }
      acc[hour].count++;
      acc[hour].totalDuration += metric.duration;
      if (metric.status === 'error') {
        acc[hour].errors++;
      }
      return acc;
    }, {} as Record<string, any>);
    
    const trendingData = Object.values(hourlyMetrics).map((hour: any) => ({
      timestamp: hour.timestamp,
      requests: hour.count,
      averageResponseTime: hour.count > 0 ? hour.totalDuration / hour.count : 0,
      errorRate: hour.count > 0 ? (hour.errors / hour.count) * 100 : 0,
    })).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    
    // Service breakdown
    const serviceBreakdown = usageMetrics.reduce((acc, metric) => {
      if (!acc[metric.service]) {
        acc[metric.service] = {
          service: metric.service,
          requests: 0,
          totalDuration: 0,
          operations: {},
        };
      }
      acc[metric.service].requests += metric.count;
      acc[metric.service].totalDuration += metric.totalDuration;
      acc[metric.service].operations[metric.operation] = {
        requests: metric.count,
        averageDuration: metric.averageDuration,
        lastUsed: metric.lastUsed,
      };
      return acc;
    }, {} as Record<string, any>);
    
    const response = {
      timestamp: new Date().toISOString(),
      timeRange,
      filter: service ? { service } : null,
      summary: summaryStats,
      trending: trendingData,
      services: Object.values(serviceBreakdown).map((service: any) => ({
        ...service,
        averageResponseTime: service.requests > 0 ? service.totalDuration / service.requests : 0,
      })),
      errors: errorMetrics.slice(0, 20).map(error => ({
        service: error.service,
        operation: error.operation,
        errorType: error.errorType,
        count: error.count,
        lastOccurred: error.lastOccurred,
        recentSamples: error.samples.slice(-3).map(sample => ({
          message: sample.message,
          timestamp: sample.timestamp,
        })),
      })),
      aiUsage: Object.entries(aiUsageStats).map(([model, stats]) => ({
        model,
        ...stats,
      })),
      performance: {
        slowestOperations: performanceMetrics
          .filter(m => m.status === 'success')
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 10)
          .map(metric => ({
            service: metric.service,
            operation: metric.operation,
            duration: metric.duration,
            timestamp: metric.timestamp,
          })),
        fastestOperations: performanceMetrics
          .filter(m => m.status === 'success')
          .sort((a, b) => a.duration - b.duration)
          .slice(0, 10)
          .map(metric => ({
            service: metric.service,
            operation: metric.operation,
            duration: metric.duration,
            timestamp: metric.timestamp,
          })),
      },
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Enhanced metrics API error:', error);
    
    return NextResponse.json({
      error: 'Failed to retrieve enhanced metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
