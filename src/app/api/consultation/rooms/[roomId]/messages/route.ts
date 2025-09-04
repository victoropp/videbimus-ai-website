import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  messageType: z.enum(['text', 'file', 'system', 'action_item']).default('text'),
  metadata: z.record(z.unknown()).default({})
});

const querySchema = z.object({
  lastId: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  since: z.string().datetime().optional()
});

/**
 * GET /api/consultation/rooms/[roomId]/messages
 * Retrieve messages for a consultation room
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this room
    const room = await verifyRoomAccess(params.roomId, session.user.id);
    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      lastId: searchParams.get('lastId'),
      limit: searchParams.get('limit') || '50',
      since: searchParams.get('since')
    });

    // Build where clause for filtering messages
    const whereClause: any = {
      roomId: params.roomId,
      isDeleted: false
    };

    // If lastId is provided, get messages newer than that message
    if (query.lastId) {
      const lastMessage = await prisma.consultationMessage.findUnique({
        where: { id: query.lastId },
        select: { createdAt: true }
      });
      
      if (lastMessage) {
        whereClause.createdAt = { gt: lastMessage.createdAt };
      }
    }

    // If since timestamp is provided, get messages since that time
    if (query.since) {
      whereClause.createdAt = { gte: new Date(query.since) };
    }

    const messages = await prisma.consultationMessage.findMany({
      where: whereClause,
      include: {
        sender: { 
          select: { 
            id: true, 
            name: true, 
            email: true, 
            image: true 
          } 
        }
      },
      orderBy: { createdAt: 'asc' },
      take: query.limit
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/consultation/rooms/[roomId]/messages
 * Send a new message to the consultation room
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this room
    const room = await verifyRoomAccess(params.roomId, session.user.id);
    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    const body = await request.json();
    const data = createMessageSchema.parse(body);

    // Create the message
    const message = await prisma.consultationMessage.create({
      data: {
        roomId: params.roomId,
        senderId: session.user.id,
        content: data.content.trim(),
        messageType: data.messageType,
        metadata: data.metadata
      },
      include: {
        sender: { 
          select: { 
            id: true, 
            name: true, 
            email: true, 
            image: true 
          } 
        }
      }
    });

    // Update room activity timestamp
    await prisma.consultationRoom.update({
      where: { id: params.roomId },
      data: { updatedAt: new Date() }
    });

    // TODO: Broadcast message to other participants (implement real-time later)
    
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Helper function to verify user has access to room
 */
async function verifyRoomAccess(roomId: string, userId: string) {
  const room = await prisma.consultationRoom.findFirst({
    where: {
      id: roomId,
      OR: [
        { clientId: userId },
        { consultantId: userId },
        {
          participants: {
            some: { userId, isActive: true }
          }
        }
      ]
    }
  });

  return room;
}

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});