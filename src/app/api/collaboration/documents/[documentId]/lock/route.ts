import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to the document
    const document = await prisma.document.findFirst({
      where: {
        id: params.documentId,
        OR: [
          { createdBy: session.user.id },
          { 
            room: {
              OR: [
                { createdBy: session.user.id },
                { participants: { some: { userId: session.user.id } } }
              ]
            }
          }
        ]
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    // Check if document is already locked
    if (document.isLocked && document.lockedBy !== session.user.id) {
      return NextResponse.json({ error: 'Document is already locked by another user' }, { status: 423 });
    }

    const updatedDocument = await prisma.document.update({
      where: { id: params.documentId },
      data: {
        isLocked: true,
        lockedBy: session.user.id,
        lockedAt: new Date()
      }
    });

    return NextResponse.json({
      isLocked: updatedDocument.isLocked,
      lockedBy: updatedDocument.lockedBy,
      lockedAt: updatedDocument.lockedAt
    });
  } catch (error) {
    console.error('Error locking document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to the document and owns the lock
    const document = await prisma.document.findFirst({
      where: {
        id: params.documentId,
        OR: [
          { createdBy: session.user.id },
          { lockedBy: session.user.id },
          { 
            room: {
              OR: [
                { createdBy: session.user.id },
                { participants: { some: { userId: session.user.id } } }
              ]
            }
          }
        ]
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    // Only allow unlocking if user owns the lock or is the room creator
    if (document.isLocked && document.lockedBy !== session.user.id && document.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Cannot unlock document locked by another user' }, { status: 403 });
    }

    const updatedDocument = await prisma.document.update({
      where: { id: params.documentId },
      data: {
        isLocked: false,
        lockedBy: null,
        lockedAt: null
      }
    });

    return NextResponse.json({
      isLocked: updatedDocument.isLocked,
      lockedBy: updatedDocument.lockedBy,
      lockedAt: updatedDocument.lockedAt
    });
  } catch (error) {
    console.error('Error unlocking document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}