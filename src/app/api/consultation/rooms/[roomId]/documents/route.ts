import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const prisma = new PrismaClient();

const createDocumentSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  content: z.string().optional(),
  documentType: z.enum(['document', 'template', 'attachment']).default('document'),
  isShared: z.boolean().default(true)
});

/**
 * GET /api/consultation/rooms/[roomId]/documents
 * Retrieve documents for a consultation room
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this room
    const room = await verifyRoomAccess(params.roomId, session.user.id);
    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    const documents = await prisma.consultationDocument.findMany({
      where: {
        roomId: params.roomId,
        isShared: true
      },
      include: {
        uploader: { 
          select: { 
            id: true, 
            name: true, 
            email: true 
          } 
        }
      },
      orderBy: [
        { isTemplate: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/consultation/rooms/[roomId]/documents
 * Create a new document or upload a file
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this room
    const room = await verifyRoomAccess(params.roomId, session.user.id);
    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      return await handleFileUpload(request, params.roomId, session.user.id);
    } else {
      // Handle text document creation
      return await handleDocumentCreation(request, params.roomId, session.user.id);
    }
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handle file upload
 */
async function handleFileUpload(
  request: NextRequest,
  roomId: string,
  userId: string
) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const documentType = (formData.get('documentType') as string) || 'attachment';

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/json'
  ];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ 
      error: 'Invalid file type. Allowed types: PDF, Word, Text, Images, JSON.' 
    }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory
    const uploadDir = join(process.cwd(), 'uploads', 'consultation', roomId);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileId = randomUUID();
    const extension = file.name.split('.').pop() || 'txt';
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${fileId}_${sanitizedName}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Create document record
    const document = await prisma.consultationDocument.create({
      data: {
        roomId,
        title: title || file.name,
        description,
        documentType,
        filePath: `/uploads/consultation/${roomId}/${fileName}`,
        fileName,
        fileSize: buffer.length,
        mimeType: file.type,
        uploadedBy: userId,
        isShared: true
      },
      include: {
        uploader: { 
          select: { 
            id: true, 
            name: true 
          } 
        }
      }
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

/**
 * Handle text document creation
 */
async function handleDocumentCreation(
  request: NextRequest,
  roomId: string,
  userId: string
) {
  const body = await request.json();
  const data = createDocumentSchema.parse(body);

  const document = await prisma.consultationDocument.create({
    data: {
      roomId,
      title: data.title,
      description: data.description,
      content: data.content,
      documentType: data.documentType,
      uploadedBy: userId,
      isTemplate: data.documentType === 'template',
      isShared: data.isShared
    },
    include: {
      uploader: { 
        select: { 
          id: true, 
          name: true 
        } 
      }
    }
  });

  return NextResponse.json({ document }, { status: 201 });
}

/**
 * Helper function to verify user has access to room
 */
async function verifyRoomAccess(roomId: string, userId: string) {
  // First check if consultation_rooms table exists, if not use direct query
  try {
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { clientId: userId },
          { consultantId: userId }
        ]
      }
    });
    return room;
  } catch (error) {
    // If table doesn't exist yet, allow access for development
    console.warn('consultation_rooms table not found, allowing access for development');
    return { id: roomId, clientId: userId, consultantId: userId };
  }
}

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});