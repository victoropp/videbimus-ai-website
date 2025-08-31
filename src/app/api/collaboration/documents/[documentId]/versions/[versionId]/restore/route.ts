import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string; versionId: string } }
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

    // Check if document is locked by another user
    if (document.isLocked && document.lockedBy !== session.user.id) {
      return NextResponse.json({ error: 'Document is locked by another user' }, { status: 423 });
    }

    // Get the version to restore
    const version = await prisma.documentVersion.findFirst({
      where: {
        id: params.versionId,
        documentId: params.documentId
      }
    });

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // Create a new version with current content before restoring
    const currentVersion = await prisma.documentVersion.create({
      data: {
        documentId: params.documentId,
        content: document.content,
        version: document.version + 1,
        createdBy: session.user.id
      }
    });

    // Restore the document to the selected version
    const restoredDocument = await prisma.document.update({
      where: { id: params.documentId },
      data: {
        content: version.content,
        version: { increment: 1 },
        updatedAt: new Date()
      }
    });

    // Create a new version record for the restoration
    await prisma.documentVersion.create({
      data: {
        documentId: params.documentId,
        content: version.content,
        version: restoredDocument.version,
        createdBy: session.user.id
      }
    });

    return NextResponse.json({
      message: 'Document restored successfully',
      document: restoredDocument,
      restoredFromVersion: version.version
    });
  } catch (error) {
    console.error('Error restoring document version:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}