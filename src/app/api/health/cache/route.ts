import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/lib/cache/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';

    // Basic health check
    const healthResult = await cacheManager.healthCheck();
    
    if (healthResult.status === 'unhealthy') {
      return NextResponse.json(
        {
          status: 'unhealthy',
          cache: {
            ...healthResult,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 503 }
      );
    }

    // Basic response
    const response = {
      status: 'healthy' as const,
      cache: {
        status: healthResult.status,
        latency: healthResult.latency,
        timestamp: new Date().toISOString(),
      },
    };

    // Add detailed information if requested
    if (detailed) {
      try {
        const stats = await cacheManager.getStats();
        
        (response.cache as any).stats = {
          connected: stats.connected,
          memoryUsage: stats.memoryUsage,
          keyCount: stats.keyCount,
          hitRate: stats.hitRate ? `${stats.hitRate.toFixed(2)}%` : 'N/A',
          uptimeSeconds: stats.uptimeSeconds,
        };

      } catch (detailError) {
        console.warn('Failed to get detailed cache info:', detailError);
        (response.cache as any).detailsError = 'Failed to retrieve detailed information';
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Cache health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        cache: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, pattern } = body;

    switch (action) {
      case 'clear':
        if (pattern) {
          const deletedCount = await cacheManager.flushPattern(pattern);
          return NextResponse.json({
            status: 'success',
            message: `Cleared ${deletedCount} keys matching pattern: ${pattern}`,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Clear all cache (dangerous operation)
          const deletedCount = await cacheManager.flushPattern('*');
          return NextResponse.json({
            status: 'success',
            message: `Cleared all cache (${deletedCount} keys)`,
            timestamp: new Date().toISOString(),
          });
        }

      case 'reconnect':
        await cacheManager.disconnect();
        await cacheManager.connect();
        
        return NextResponse.json({
          status: 'success',
          message: 'Cache reconnected successfully',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            status: 'error',
            message: `Unknown action: ${action}`,
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Cache action failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}