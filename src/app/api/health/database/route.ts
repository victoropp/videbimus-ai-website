import { NextRequest, NextResponse } from 'next/server';
import { prismaManager } from '@/lib/database/prisma';
import { z } from 'zod';

// Request schema for health check parameters
const HealthCheckParamsSchema = z.object({
  detailed: z.boolean().optional().default(false),
  timeout: z.number().min(1000).max(30000).optional().default(5000),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = HealthCheckParamsSchema.parse({
      detailed: searchParams.get('detailed') === 'true',
      timeout: searchParams.get('timeout') ? parseInt(searchParams.get('timeout')!, 10) : undefined,
    });

    // Basic health check
    const healthResult = await prismaManager.healthCheck();
    
    if (healthResult.status === 'unhealthy') {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: {
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
      database: {
        status: healthResult.status,
        latency: healthResult.latency,
        timestamp: new Date().toISOString(),
      },
    };

    // Add detailed information if requested
    if (params.detailed) {
      try {
        const connectionInfo = await prismaManager.getConnectionInfo();
        
        (response.database as any).connections = {
          poolSize: connectionInfo.poolSize,
          isConnected: connectionInfo.isConnected,
          activeConnections: connectionInfo.activeConnections,
          pendingConnections: connectionInfo.pendingConnections,
        };

        // Get database version and basic stats
        const client = prismaManager.getClient();
        const dbStats = await client.$queryRaw<Array<{
          version: string;
          current_database: string;
          current_user: string;
        }>>`
          SELECT version(), current_database(), current_user
        `;

        if (dbStats[0]) {
          (response.database as any).info = {
            version: dbStats[0].version,
            database: dbStats[0].current_database,
            user: dbStats[0].current_user,
          };
        }

        // Get table counts (for basic monitoring)
        const tableCounts = await client.$queryRaw<Array<{
          table_name: string;
          row_count: number;
        }>>`
          SELECT 
            schemaname||'.'||tablename as table_name,
            n_tup_ins - n_tup_del as row_count
          FROM pg_stat_user_tables 
          WHERE schemaname = 'public'
          ORDER BY n_tup_ins - n_tup_del DESC
          LIMIT 10
        `;

        (response.database as any).tables = tableCounts;

      } catch (detailError) {
        console.warn('Failed to get detailed database info:', detailError);
        (response.database as any).detailsError = 'Failed to retrieve detailed information';
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Database health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        database: {
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
    const { action } = body;

    switch (action) {
      case 'reconnect':
        await prismaManager.disconnect();
        await prismaManager.connect();
        
        return NextResponse.json({
          status: 'success',
          message: 'Database reconnected successfully',
          timestamp: new Date().toISOString(),
        });

      case 'disconnect':
        await prismaManager.disconnect();
        
        return NextResponse.json({
          status: 'success',
          message: 'Database disconnected successfully',
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
    console.error('Database action failed:', error);

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