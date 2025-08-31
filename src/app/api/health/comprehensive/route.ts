import { NextRequest, NextResponse } from 'next/server';
import { monitoringService } from '@/lib/services/monitoring';
import { aiService } from '@/lib/services/ai';
import { emailService } from '@/lib/services/email';
import { storageService } from '@/lib/services/storage';
import { videoService } from '@/lib/services/video';
import { vectorStoreService } from '@/lib/services/vector-store';
import { authService } from '@/lib/services/auth';
import { crmService } from '@/lib/services/crm';
import { calendarService } from '@/lib/services/calendar';
import { getServiceConfig } from '@/lib/config/services';

export async function GET(request: NextRequest) {
  try {
    // Perform comprehensive health check
    const healthCheck = await monitoringService.performSystemHealthCheck();
    
    // Get individual service health checks
    const [aiHealth, emailHealth, videoHealth, crmHealth, calendarHealth] = await Promise.allSettled([
      aiService.healthCheck(),
      emailService.healthCheck(),
      videoService.healthCheck(),
      crmService.healthCheck(),
      calendarService.healthCheck(),
    ]);

    // Get system information
    const systemInfo = monitoringService.getSystemInfo();
    
    // Get usage statistics
    const usageStats = monitoringService.getUsageMetrics();
    const errorStats = monitoringService.getErrorMetrics();
    
    // Get service configuration status
    const config = getServiceConfig();
    const serviceConfiguration = {
      ai: {
        openai: !!(config.ai.openai.apiKey),
        anthropic: !!(config.ai.anthropic.apiKey),
        huggingface: !!(config.ai.huggingface.apiKey),
      },
      storage: {
        aws: !!(config.storage.aws.accessKeyId && config.storage.aws.secretAccessKey),
      },
      email: {
        resend: !!(config.email.resend.apiKey),
        smtp: !!(config.email.smtp?.host),
      },
      video: {
        daily: !!(config.video.daily.apiKey),
      },
      vectorStore: {
        pinecone: !!(config.pinecone.apiKey),
      },
      auth: {
        google: config.auth.providers.google.enabled,
        github: config.auth.providers.github.enabled,
      },
      crm: {
        hubspot: config.crm.hubspot.enabled,
        salesforce: config.crm.salesforce.enabled,
      },
      calendar: {
        google: config.calendar.google.enabled,
        outlook: config.calendar.outlook.enabled,
      },
    };

    const response = {
      timestamp: new Date().toISOString(),
      overall: healthCheck.overall,
      uptime: systemInfo.uptime,
      version: config.appVersion,
      environment: config.nodeEnv,
      services: healthCheck.services,
      detailedHealth: {
        ai: aiHealth.status === 'fulfilled' ? aiHealth.value : { error: 'Failed to check AI services' },
        email: emailHealth.status === 'fulfilled' ? emailHealth.value : { error: 'Failed to check email service' },
        video: videoHealth.status === 'fulfilled' ? videoHealth.value : { error: 'Failed to check video service' },
        crm: crmHealth.status === 'fulfilled' ? crmHealth.value : { error: 'Failed to check CRM service' },
        calendar: calendarHealth.status === 'fulfilled' ? calendarHealth.value : { error: 'Failed to check calendar service' },
      },
      systemInfo: {
        nodeVersion: systemInfo.nodeVersion,
        platform: systemInfo.platform,
        memory: {
          used: Math.round(systemInfo.memory.used / 1024 / 1024),
          total: Math.round(systemInfo.memory.heapTotal / 1024 / 1024),
          external: Math.round(systemInfo.memory.external / 1024 / 1024),
        },
        loadAverage: systemInfo.loadAverage,
      },
      configuration: serviceConfiguration,
      usage: {
        totalRequests: usageStats.reduce((sum, stat) => sum + stat.count, 0),
        averageResponseTime: usageStats.length > 0 
          ? Math.round(usageStats.reduce((sum, stat) => sum + stat.averageDuration, 0) / usageStats.length)
          : 0,
        topServices: usageStats.slice(0, 5).map(stat => ({
          service: stat.service,
          operation: stat.operation,
          requests: stat.count,
          avgDuration: Math.round(stat.averageDuration),
        })),
      },
      errors: {
        totalErrors: errorStats.reduce((sum, error) => sum + error.count, 0),
        recentErrors: errorStats.slice(0, 5).map(error => ({
          service: error.service,
          operation: error.operation,
          errorType: error.errorType,
          count: error.count,
          lastOccurred: error.lastOccurred,
        })),
      },
      alerts: monitoringService.getActiveAlerts().map(alert => ({
        id: alert.id,
        service: alert.service,
        message: alert.message,
        severity: alert.severity,
        triggeredAt: alert.triggeredAt,
        acknowledged: alert.acknowledged,
      })),
    };

    // Set appropriate status code based on health
    const statusCode = healthCheck.overall === 'healthy' ? 200 : 
                      healthCheck.overall === 'degraded' ? 206 : 503;

    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overall: 'unhealthy',
      error: 'Health check system failure',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}
