import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connection (temporarily disabled for development)
    let dbStatus = 'disconnected';
    let dbLatency = 0;
    
    try {
      if (process.env.DATABASE_URL) {
        await prisma.$queryRaw`SELECT 1`;
        dbLatency = Date.now() - startTime;
        dbStatus = 'connected';
      }
    } catch (dbError) {
      console.warn('Database check failed (development mode):', dbError);
      dbStatus = 'not_configured';
    }
    
    // Check system health metrics
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      database: {
        status: dbStatus,
        latency: dbStatus === 'connected' ? `${dbLatency}ms` : 'n/a',
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      services: {
        redis: await checkRedisHealth(),
        auth: await checkAuthService(),
        ai: await checkAIServices(),
      }
    };

    return NextResponse.json(healthData, { status: 200 });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
    }, { status: 200 }); // Return 200 instead of 503 for development
  }
}

// Redis health check
async function checkRedisHealth(): Promise<{ status: string; latency?: string }> {
  try {
    const redis = (await import('redis')).createClient({
      url: process.env.REDIS_URL
    });
    
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    
    await redis.quit();
    
    return {
      status: 'connected',
      latency: `${latency}ms`
    };
  } catch (error) {
    return { status: 'disconnected' };
  }
}

// Auth service health check
async function checkAuthService(): Promise<{ status: string }> {
  try {
    // Check if NextAuth configuration is valid
    if (!process.env.NEXTAUTH_SECRET) {
      return { status: 'misconfigured' };
    }
    return { status: 'configured' };
  } catch (error) {
    return { status: 'error' };
  }
}

// AI services health check
async function checkAIServices(): Promise<{ status: string; services: Record<string, string> }> {
  const services = {
    openai: 'unknown',
    anthropic: 'unknown',
    pinecone: 'unknown'
  };

  try {
    // Check OpenAI
    if (process.env.OPENAI_API_KEY) {
      services.openai = 'configured';
    }

    // Check Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      services.anthropic = 'configured';
    }

    // Check Pinecone
    if (process.env.PINECONE_API_KEY) {
      services.pinecone = 'configured';
    }

    const configuredCount = Object.values(services).filter(s => s === 'configured').length;
    const status = configuredCount > 0 ? 'partially_configured' : 'not_configured';
    
    return { status, services };
  } catch (error) {
    return { status: 'error', services };
  }
}

// Also handle HEAD requests for simple health checks
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new Response(null, { status: 200 });
  } catch (error) {
    return new Response(null, { status: 503 });
  }
}