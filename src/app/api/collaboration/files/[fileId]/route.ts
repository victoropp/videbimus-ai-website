import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

export async function DELETE(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the file
    const file = await prisma.consultationFile.findFirst({
      where: {
        id: params.fileId,
        OR: [
          { uploadedBy: session.user.id },
          { 
            room: {
              createdBy: session.user.id
            }
          }
        ]
      }
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 });
    }

    // Delete file from filesystem
    try {
      const filename = file.url.split('/').pop();
      if (filename) {
        const filepath = join(UPLOAD_DIR, filename);
        await unlink(filepath);
      }
    } catch (fsError) {
      console.error('Failed to delete file from filesystem:', fsError);
      // Continue with database deletion even if file system deletion fails
    }

    // Delete from database
    await prisma.consultationFile.delete({
      where: { id: params.fileId }
    });

    return NextResponse.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}