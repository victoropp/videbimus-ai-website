import { NextRequest, NextResponse } from 'next/server';
import { enterpriseChatService } from '@/lib/ai/enterprise-chat-service';

export async function GET(req: NextRequest) {
  try {
    // Await headers to fix Next.js warnings
    await req.headers;
    
    const stats = enterpriseChatService.getCacheStats();
    
    return NextResponse.json({
      cache: stats,
      message: `Cache is reducing costs! ${stats.totalHits} cache hits with $${stats.estimatedSavings.toFixed(2)} saved.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cache statistics' },
      { status: 500 }
    );
  }
}