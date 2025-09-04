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
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const rooms = await prisma.consultationRoom.findMany({
      where: {
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
        _count: {
          select: {
            messages: true,
            documents: true,
            whiteboards: true
          }
        }
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
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
    const {
      name,
      description,
      roomType = 'consultation',
      consultantId,
      scheduledAt,
      durationMinutes = 60
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    const room = await prisma.consultationRoom.create({
      data: {
        name,
        description,
        roomType,
        clientId: session.user.id,
        consultantId: consultantId || session.user.id,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        durationMinutes,
        status: 'SCHEDULED',
        settings: {}
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

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}