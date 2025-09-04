import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Verify room access
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { clientId: session.user.id },
          { consultantId: session.user.id },
          {
            participants: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or access denied' },
        { status: 404 }
      );
    }

    const messages = await prisma.consultationMessage.findMany({
      where: {
        roomId: roomId
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: limit,
      skip: offset
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roomId, content, messageType = 'text', metadata = {} } = body;

    if (!roomId || !content) {
      return NextResponse.json(
        { error: 'Room ID and content are required' },
        { status: 400 }
      );
    }

    // Verify room access
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { clientId: session.user.id },
          { consultantId: session.user.id },
          {
            participants: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or access denied' },
        { status: 404 }
      );
    }

    const message = await prisma.consultationMessage.create({
      data: {
        roomId,
        senderId: session.user.id,
        content,
        messageType,
        metadata
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}