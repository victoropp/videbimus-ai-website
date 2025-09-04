import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  type: z.enum(['TEXT', 'FILE', 'IMAGE', 'CODE', 'SYSTEM']).default('TEXT'),
  roomId: z.string(),
  replyToId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor');

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    // Check if user has access to the consultation room
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { clientId: session.user.id },
          { consultantId: session.user.id },
          { participants: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    const messages = await prisma.consultationMessage.findMany({
      where: {
        roomId,
        ...(cursor ? {
          createdAt: {
            lt: new Date(cursor),
          },
        } : {}),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        // replyTo relation doesn't exist in ConsultationMessage model
        // attachments relation doesn't exist in ConsultationMessage model
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Return messages in chronological order
    const reversedMessages = messages.reverse();

    return NextResponse.json({
      messages: reversedMessages,
      hasMore: messages.length === limit,
      nextCursor: messages.length > 0 ? messages[0].createdAt.toISOString() : null,
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
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
    const validatedData = sendMessageSchema.parse(body);

    // Check if user has access to the room
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: validatedData.roomId,
        OR: [
          { clientId: session.user.id },
          { consultantId: session.user.id },
          { participants: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    // Validate reply-to message if provided
    if (validatedData.replyToId) {
      const replyToMessage = await prisma.consultationMessage.findFirst({
        where: {
          id: validatedData.replyToId,
          roomId: validatedData.roomId,
        },
      });

      if (!replyToMessage) {
        return NextResponse.json({ error: 'Reply-to message not found' }, { status: 404 });
      }
    }

    const message = await prisma.consultationMessage.create({
      data: {
        content: validatedData.content,
        messageType: validatedData.type,
        roomId: validatedData.roomId,
        senderId: session.user.id,
        // replyToId field doesn't exist in ConsultationMessage model
        // reactions stored in metadata field
        metadata: { reactions: {} },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        // replyTo relation doesn't exist in ConsultationMessage model
        // attachments relation doesn't exist in ConsultationMessage model
      },
    });

    // TODO: Emit real-time message to room participants via Socket.io
    // socketService.emitToRoom(validatedData.roomId, 'new_message', message);

    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}