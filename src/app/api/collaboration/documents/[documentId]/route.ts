import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateDocumentSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  language: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        lockedByUser: {
          select: { id: true, name: true }
        },
        room: {
          select: { id: true, name: true }
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateDocumentSchema.parse(body);

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

    const updatedDocument = await prisma.document.update({
      where: { id: params.documentId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        lockedByUser: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}