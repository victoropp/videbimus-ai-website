import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createWhiteboardSchema = z.object({
  name: z.string().min(1, 'Whiteboard name is required'),
  data: z.any().default({}), // Fabric.js canvas data
  roomId: z.string(),
});

const updateWhiteboardSchema = z.object({
  name: z.string().optional(),
  data: z.any().optional(),
  isActive: z.boolean().optional(),
});

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

    const whiteboards = await prisma.whiteboard.findMany({
      where: {
        roomId,
        isActive: true,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(whiteboards);
  } catch (error) {
    console.error('Error fetching whiteboards:', error);
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
    const validatedData = createWhiteboardSchema.parse(body);

    // Check if user has access to the room
    const room = await prisma.room.findFirst({
      where: {
        id: validatedData.roomId,
        OR: [
          { createdBy: session.user.id },
          { participants: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    const whiteboard = await prisma.whiteboard.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
        version: 1,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(whiteboard);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Error creating whiteboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}