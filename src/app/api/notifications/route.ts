import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Ensure user can only access their own notifications (unless admin)
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const whereClause: any = {
      userId: userId
    };

    if (type) {
      whereClause.type = type;
    }

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const totalCount = await prisma.notification.count({
      where: whereClause
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false
      }
    });

    return NextResponse.json({
      notifications,
      totalCount,
      unreadCount,
      hasMore: totalCount > offset + limit
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, title, content, type = 'SYSTEM', data } = body;

    // Validate required fields
    if (!userId || !title || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, title, content' 
      }, { status: 400 });
    }

    // Validate notification type
    const validTypes = ['MEETING_INVITE', 'MEETING_STARTED', 'MEETING_ENDED', 'DOCUMENT_SHARED', 'MENTION', 'SYSTEM', 'PROJECT_UPDATE'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid notification type' 
      }, { status: 400 });
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        content,
        type,
        data: data || {},
        isRead: false
      }
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}