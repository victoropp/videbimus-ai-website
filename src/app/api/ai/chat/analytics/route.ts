import { NextRequest, NextResponse } from 'next/server';
import { enterpriseChatService } from '@/lib/ai/enterprise-chat-service';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    // Await headers before using auth to fix Next.js warnings
    await req.headers;
    const session = await auth();
    
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific session analytics
      const analytics = await enterpriseChatService.getSessionAnalytics(sessionId);
      
      if (!analytics) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      // If user is authenticated, verify ownership
      const chatSession = await enterpriseChatService.getSession(sessionId);
      if (session?.user?.id && chatSession?.userId && chatSession.userId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      return NextResponse.json({
        sessionId,
        analytics,
        timestamp: new Date(),
      });
    } else {
      // Get global analytics (admin only for now, or simplified version for all users)
      const globalAnalytics = await enterpriseChatService.getGlobalAnalytics();
      
      return NextResponse.json({
        global: globalAnalytics,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}