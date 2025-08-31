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
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    // Check if user has access to the room
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        OR: [
          { createdBy: session.user.id },
          { participants: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    // Get presence data for all room participants
    const presence = await prisma.userPresence.findMany({
      where: {
        user: {
          OR: [
            { id: room.createdBy },
            { roomParticipants: { some: { roomId: roomId } } }
          ]
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        lastSeen: 'desc'
      }
    });

    return NextResponse.json({
      presence,
      totalCount: presence.length,
      onlineCount: presence.filter(p => p.isOnline).length
    });
  } catch (error) {
    console.error('Error fetching presence data:', error);
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
    const { roomId, isOnline, status, activity } = body;

    // Update or create user presence
    const presence = await prisma.userPresence.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        isOnline: isOnline ?? true,
        status,
        activity,
        roomId,
        lastSeen: new Date()
      },
      update: {
        isOnline: isOnline ?? true,
        status,
        activity,
        roomId,
        lastSeen: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(presence);
  } catch (error) {
    console.error('Error updating presence:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}