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
  _request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      },
      include: {
        // creator relation doesn't exist - use uploadedBy field instead
        // lockedByUser relation doesn't exist - locking not implemented
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

    // Document locking not implemented - skip lock check

    const updateData: any = { updatedAt: new Date() };
    
    // Only add fields that are defined to avoid exactOptionalPropertyTypes issues
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.content !== undefined) updateData.content = validatedData.content;
    if (validatedData.language !== undefined) updateData.language = validatedData.language;
    
    const updatedDocument = await prisma.consultationDocument.update({
      where: { id: params.documentId },
      data: updateData,
      include: {
        room: {
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