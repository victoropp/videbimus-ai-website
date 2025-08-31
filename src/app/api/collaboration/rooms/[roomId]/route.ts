import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(['CONSULTATION', 'COLLABORATION', 'TRAINING', 'PRESENTATION', 'MEETING']).optional(),
  maxParticipants: z.number().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: { roomId: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const room = await prisma.room.findFirst({
      where: {
        id: params.roomId,
        OR: [
          { createdBy: session.user.id },
          { participants: { some: { userId: session.user.id } } },
        ],
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
            description: true,
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
          orderBy: {
            scheduledAt: 'desc',
          },
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
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
          },
        },
        whiteboards: {
          orderBy: {
            updatedAt: 'desc',
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
        },
        documents: {
          orderBy: {
            updatedAt: 'desc',
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            lockedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        chatMessages: {
          take: 50,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            replyTo: {
              select: {
                id: true,
                content: true,
                sender: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            attachments: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateRoomSchema.parse(body);

    // Check if user has permission to update room
    const existingRoom = await prisma.room.findFirst({
      where: {
        id: params.roomId,
        OR: [
          { createdBy: session.user.id },
          { 
            participants: { 
              some: { 
                userId: session.user.id,
                role: { in: ['HOST', 'MODERATOR'] }
              } 
            } 
          },
        ],
      },
    });

    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found or insufficient permissions' }, { status: 404 });
    }

    const updatedRoom = await prisma.room.update({
      where: {
        id: params.roomId,
      },
      data: validatedData,
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

    return NextResponse.json(updatedRoom);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is the creator of the room
    const room = await prisma.room.findFirst({
      where: {
        id: params.roomId,
        createdBy: session.user.id,
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or insufficient permissions' }, { status: 404 });
    }

    // Soft delete - mark as inactive
    await prisma.room.update({
      where: {
        id: params.roomId,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}