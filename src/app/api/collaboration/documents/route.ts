import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createDocumentSchema = z.object({
  title: z.string().min(1, 'Document title is required'),
  content: z.string().default(''),
  language: z.string().default('javascript'),
  type: z.enum(['CODE', 'TEXT', 'MARKDOWN', 'JSON', 'XML', 'HTML', 'CSS']).default('CODE'),
  roomId: z.string(),
});

const updateDocumentSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  language: z.string().optional(),
  type: z.enum(['CODE', 'TEXT', 'MARKDOWN', 'JSON', 'XML', 'HTML', 'CSS']).optional(),
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

    const documents = await prisma.document.findMany({
      where: {
        roomId,
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
        versions: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
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
    const validatedData = createDocumentSchema.parse(body);

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

    const document = await prisma.document.create({
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

    // Create initial version
    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        content: validatedData.content,
        version: 1,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}