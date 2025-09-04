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

    const documentId = params.id;
    
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
      },
      include: {
        room: {
          select: { id: true, name: true }
        },
        uploader: {
          select: { id: true, name: true, email: true }
        },
        versions: {
          select: {
            id: true,
            version: true,
            content: true,
            changeNote: true,
            createdAt: true,
            creator: {
              select: { id: true, name: true }
            }
          },
          orderBy: {
            version: 'desc'
          },
          take: 10
        }
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documentId = params.id;
    const body = await request.json();
    const { content, title, language } = body;

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

    // Check if document is locked by another user
    if (document.isLocked && document.lockedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Document is locked by another user' },
        { status: 423 }
      );
    }

    const updatedDocument = await prisma.consultationDocument.update({
      where: { id: documentId },
      data: {
        ...(content !== undefined && { content }),
        ...(title && { title }),
        ...(language && { fileName: `${title || document.title}.${language}` }),
        version: { increment: 1 },
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    console.error('Error updating document:', error);
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

    // Verify document ownership
    const document = await prisma.consultationDocument.findFirst({
      where: {
        id: documentId,
        uploadedBy: session.user.id
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    await prisma.consultationDocument.delete({
      where: { id: documentId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}