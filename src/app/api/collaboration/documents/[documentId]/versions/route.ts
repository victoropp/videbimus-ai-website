import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Document versioning not implemented
    return NextResponse.json({ versions: [], total: 0 });

    /* TODO: Implement versioning after adding DocumentVersion model
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check if user has access to the document
    const document = await prisma.consultationDocument.findFirst({
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

    const versions = await prisma.documentVersion.findMany({
      where: {
        documentId: params.documentId
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Transform data to include creator name
    const transformedVersions = versions.map(version => ({
      ...version,
      createdByName: version.creator.name || version.creator.email
    }));

    return NextResponse.json({
      versions: transformedVersions,
      totalCount: versions.length
    });
    */
  } catch (error) {
    console.error('Error fetching document versions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}