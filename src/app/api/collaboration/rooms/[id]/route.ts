import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomId = params.id;
    
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
      },
      include: {
        client: {
          select: { id: true, name: true, email: true, image: true }
        },
        consultant: {
          select: { id: true, name: true, email: true, image: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        documents: {
          select: {
            id: true,
            title: true,
            documentType: true,
            content: true,
            fileName: true,
            version: true,
            isLocked: true,
            createdAt: true,
            updatedAt: true
          }
        },
        whiteboards: {
          select: {
            id: true,
            title: true,
            version: true,
            canvasData: true,
            thumbnailUrl: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            updatedAt: 'desc'
          }
        },
        _count: {
          select: {
            messages: true,
            documents: true,
            whiteboards: true,
            actionItems: true
          }
        }
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomId = params.id;
    const body = await request.json();
    const {
      name,
      description,
      status,
      scheduledAt,
      durationMinutes,
      settings
    } = body;

    // Verify room ownership/access
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { clientId: session.user.id },
          { consultantId: session.user.id }
        ]
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or access denied' },
        { status: 404 }
      );
    }

    const updatedRoom = await prisma.consultationRoom.update({
      where: { id: roomId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(durationMinutes && { durationMinutes }),
        ...(settings && { settings }),
        updatedAt: new Date()
      },
      include: {
        client: {
          select: { id: true, name: true, email: true, image: true }
        },
        consultant: {
          select: { id: true, name: true, email: true, image: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomId = params.id;

    // Verify room ownership
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { clientId: session.user.id },
          { consultantId: session.user.id }
        ]
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or access denied' },
        { status: 404 }
      );
    }

    await prisma.consultationRoom.delete({
      where: { id: roomId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}