import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documentId = params.id;

    // Verify document access
    const document = await prisma.consultationDocument.findFirst({
      where: {
        id: documentId,
        room: {
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
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Check if already locked
    if (document.isLocked && document.lockedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Document is already locked by another user' },
        { status: 423 }
      );
    }

    const updatedDocument = await prisma.consultationDocument.update({
      where: { id: documentId },
      data: {
        isLocked: true,
        lockedBy: session.user.id,
        lockedAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      isLocked: true,
      lockedBy: session.user.id,
      lockedAt: updatedDocument.lockedAt
    });
  } catch (error) {
    console.error('Error locking document:', error);
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

    const documentId = params.id;

    // Verify document access and lock ownership
    const document = await prisma.consultationDocument.findFirst({
      where: {
        id: documentId,
        lockedBy: session.user.id,
        room: {
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
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found, access denied, or not locked by you' },
        { status: 404 }
      );
    }

    const updatedDocument = await prisma.consultationDocument.update({
      where: { id: documentId },
      data: {
        isLocked: false,
        lockedBy: null,
        lockedAt: null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      isLocked: false,
      lockedBy: null,
      lockedAt: null
    });
  } catch (error) {
    console.error('Error unlocking document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}