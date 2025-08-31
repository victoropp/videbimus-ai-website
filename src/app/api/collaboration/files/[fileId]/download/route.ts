import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to the file
    const file = await prisma.sharedFile.findFirst({
      where: {
        id: params.fileId,
        room: {
          OR: [
            { createdBy: session.user.id },
            { participants: { some: { userId: session.user.id } } },
          ],
        },
      }
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 });
    }

    // Increment download count
    await prisma.sharedFile.update({
      where: { id: params.fileId },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ message: 'Download tracked successfully' });

  } catch (error) {
    console.error('Error tracking download:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}