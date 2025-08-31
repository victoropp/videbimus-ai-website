import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Get system metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Get database metrics
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStartTime;
    
    // Get application metrics from database
    const [
      userCount,
      activeUsers,
      projectCount,
      consultationCount,
      todayAnalytics,
      systemErrors,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      prisma.project.count(),
      prisma.consultation.count(),
      prisma.analytics.count({ where: { createdAt: { gte: new Date(new Date().toDateString()) } } }),
      prisma.analytics.count({ 
        where: { 
          event: 'error',
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
        }
      }),
    ]);

    // Format as Prometheus metrics
    const metrics = `
# HELP nodejs_memory_heap_used_bytes Process heap memory used
# TYPE nodejs_memory_heap_used_bytes gauge
nodejs_memory_heap_used_bytes ${memoryUsage.heapUsed}

# HELP nodejs_memory_heap_total_bytes Process heap memory total
# TYPE nodejs_memory_heap_total_bytes gauge
nodejs_memory_heap_total_bytes ${memoryUsage.heapTotal}

# HELP nodejs_memory_external_bytes Process external memory
# TYPE nodejs_memory_external_bytes gauge
nodejs_memory_external_bytes ${memoryUsage.external}

# HELP nodejs_process_uptime_seconds Process uptime in seconds
# TYPE nodejs_process_uptime_seconds gauge
nodejs_process_uptime_seconds ${uptime}

# HELP database_query_duration_seconds Database query duration
# TYPE database_query_duration_seconds gauge
database_query_duration_seconds ${dbLatency / 1000}

# HELP app_users_total Total number of users
# TYPE app_users_total gauge
app_users_total ${userCount}

# HELP app_users_active_24h Active users in last 24 hours
# TYPE app_users_active_24h gauge
app_users_active_24h ${activeUsers}

# HELP app_projects_total Total number of projects
# TYPE app_projects_total gauge
app_projects_total ${projectCount}

# HELP app_consultations_total Total number of consultations
# TYPE app_consultations_total gauge
app_consultations_total ${consultationCount}

# HELP app_analytics_events_today Analytics events today
# TYPE app_analytics_events_today gauge
app_analytics_events_today ${todayAnalytics}

# HELP app_errors_last_hour System errors in last hour
# TYPE app_errors_last_hour gauge
app_errors_last_hour ${systemErrors}

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds gauge
http_request_duration_seconds ${(Date.now() - startTime) / 1000}
    `.trim();

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('Metrics collection failed:', error);
    return NextResponse.json({ error: 'Metrics collection failed' }, { status: 500 });
  }
}