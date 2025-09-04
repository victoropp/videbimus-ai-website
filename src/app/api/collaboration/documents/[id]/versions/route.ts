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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

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

    const versions = await prisma.documentVersion.findMany({
      where: {
        documentId: documentId
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        version: 'desc'
      },
      take: limit
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error('Error fetching document versions:', error);
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

    const documentId = params.id;
    const body = await request.json();
    const { content, changeNote } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

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

    // Get the next version number
    const latestVersion = await prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { version: 'desc' }
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    const version = await prisma.documentVersion.create({
      data: {
        documentId,
        content,
        version: nextVersion,
        changeNote,
        createdBy: session.user.id
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Update document version counter
    await prisma.consultationDocument.update({
      where: { id: documentId },
      data: {
        version: nextVersion,
        content,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ version }, { status: 201 });
  } catch (error) {
    console.error('Error creating document version:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}