import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  description: z.string().optional(),
  type: z.enum(['CONSULTATION', 'COLLABORATION', 'TRAINING', 'PRESENTATION', 'MEETING']),
  maxParticipants: z.number().min(1).max(50).default(10),
  projectId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const rooms = await prisma.room.findMany({
      where: {
        OR: [
          { createdBy: session.user.id },
          { participants: { some: { userId: session.user.id } } },
          ...(projectId ? [{ projectId }] : [])
        ],
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
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        meetings: {
          where: {
            status: { in: ['SCHEDULED', 'STARTED'] },
          },
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            status: true,
          },
        },
        _count: {
          select: {
            whiteboards: true,
            documents: true,
            chatMessages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
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
    const validatedData = createRoomSchema.parse(body);

    // Generate Daily.co room (in a real implementation, you'd call Daily.co API)
    const dailyRoomName = `vidibemus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const dailyRoomUrl = `https://vidibemus.daily.co/${dailyRoomName}`;

    const room = await prisma.room.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
        dailyRoomName,
        dailyRoomUrl,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Add creator as a participant with HOST role
    await prisma.roomParticipant.create({
      data: {
        roomId: room.id,
        userId: session.user.id,
        role: 'HOST',
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}