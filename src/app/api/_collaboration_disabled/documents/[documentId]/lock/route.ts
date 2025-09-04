import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  _request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to the document
    const document = await prisma.consultationDocument.findFirst({
      where: {
        id: params.documentId,
        OR: [
          { uploadedBy: session.user.id },
          { 
            room: {
              OR: [
                { clientId: session.user.id },
                { consultantId: session.user.id },
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

    // Document locking not implemented in ConsultationDocument model
    // if (document.isLocked && document.lockedBy !== session.user.id) {
    //   return NextResponse.json({ error: 'Document is already locked by another user' }, { status: 423 });
    // }

    // Document locking fields don't exist in ConsultationDocument model
    // const updatedDocument = await prisma.consultationDocument.update({
    //   where: { id: params.documentId },
    //   data: {
    //     isLocked: true,
    //     lockedBy: session.user.id,
    //     lockedAt: new Date()
    //   }
    // });

    // Return the document as-is since locking isn't implemented
    // const updatedDocument = document;

    return NextResponse.json({
      message: 'Document locking not implemented in current schema',
      documentId: params.documentId,
      // isLocked: updatedDocument.isLocked,
      // lockedBy: updatedDocument.lockedBy,
      // lockedAt: updatedDocument.lockedAt
    });
  } catch (error) {
    console.error('Error locking document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to the document and owns the lock
    const document = await prisma.consultationDocument.findFirst({
      where: {
        id: params.documentId,
        OR: [
          { uploadedBy: session.user.id },
          // { lockedBy: session.user.id }, // lockedBy field doesn't exist
          { 
            room: {
              OR: [
                { clientId: session.user.id },
                { consultantId: session.user.id },
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

    // Document locking not implemented in ConsultationDocument model
    // Only allow unlocking if user owns the lock or is the room creator
    // if (document.isLocked && document.lockedBy !== session.user.id && document.uploadedBy !== session.user.id) {
    //   return NextResponse.json({ error: 'Cannot unlock document locked by another user' }, { status: 403 });
    // }

    // const updatedDocument = await prisma.consultationDocument.update({
    //   where: { id: params.documentId },
    //   data: {
    //     isLocked: false,
    //     lockedBy: null,
    //     lockedAt: null
    //   }
    // });

    return NextResponse.json({
      message: 'Document unlocking not implemented in current schema',
      documentId: params.documentId,
      // isLocked: updatedDocument.isLocked,
      // lockedBy: updatedDocument.lockedBy,
      // lockedAt: updatedDocument.lockedAt
    });
  } catch (error) {
    console.error('Error unlocking document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}