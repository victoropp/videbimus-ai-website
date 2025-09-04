import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    roomId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomId = params.roomId;

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

    const whiteboard = await prisma.consultationWhiteboard.findFirst({
      where: {
        roomId: roomId
      },
      include: {
        updater: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({ whiteboard });
  } catch (error) {
    console.error('Error fetching whiteboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomId = params.roomId;
    const body = await request.json();
    const { canvasData, title = 'Whiteboard' } = body;

    if (!canvasData) {
      return NextResponse.json(
        { error: 'Canvas data is required' },
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

    // Get the current version or start with 1
    const existingWhiteboard = await prisma.consultationWhiteboard.findFirst({
      where: { roomId },
      orderBy: { version: 'desc' }
    });

    const nextVersion = (existingWhiteboard?.version || 0) + 1;

    const whiteboard = await prisma.consultationWhiteboard.create({
      data: {
        roomId,
        title,
        canvasData,
        version: nextVersion,
        updatedBy: session.user.id
      },
      include: {
        updater: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({ whiteboard }, { status: 201 });
  } catch (error) {
    console.error('Error saving whiteboard:', error);
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

    const roomId = params.roomId;
    const body = await request.json();
    const { canvasData, title } = body;

    if (!canvasData) {
      return NextResponse.json(
        { error: 'Canvas data is required' },
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

    // Find existing whiteboard
    const existingWhiteboard = await prisma.consultationWhiteboard.findFirst({
      where: { roomId },
      orderBy: { updatedAt: 'desc' }
    });

    if (existingWhiteboard) {
      // Update existing whiteboard
      const updatedWhiteboard = await prisma.consultationWhiteboard.update({
        where: { id: existingWhiteboard.id },
        data: {
          canvasData,
          ...(title && { title }),
          version: { increment: 1 },
          updatedBy: session.user.id,
          updatedAt: new Date()
        },
        include: {
          updater: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      return NextResponse.json({ whiteboard: updatedWhiteboard });
    } else {
      // Create new whiteboard if none exists
      const whiteboard = await prisma.consultationWhiteboard.create({
        data: {
          roomId,
          title: title || 'Whiteboard',
          canvasData,
          version: 1,
          updatedBy: session.user.id
        },
        include: {
          updater: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      return NextResponse.json({ whiteboard }, { status: 201 });
    }
  } catch (error) {
    console.error('Error updating whiteboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}