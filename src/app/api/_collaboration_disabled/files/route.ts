import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    // Check if user has access to the room
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { createdBy: session.user.id },
          { participants: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    // Get files shared in this room
    const files = await prisma.consultationFile.findMany({
      where: { roomId },
      include: {
        uploader: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Transform the data
    const transformedFiles = files.map(file => ({
      id: file.id,
      name: file.filename,
      size: file.size,
      type: file.mimeType,
      url: file.url,
      uploadedBy: file.uploadedBy,
      uploadedByName: file.uploader.name || file.uploader.email,
      uploadedAt: file.createdAt,
      downloadCount: 0 // ConsultationFile doesn't have downloadCount field
    }));

    return NextResponse.json({
      files: transformedFiles,
      totalCount: files.length
    });
  } catch (error) {
    console.error('Error fetching shared files:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}