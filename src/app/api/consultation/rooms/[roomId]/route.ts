import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateRoomSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.number().min(15).max(480).optional()
});

/**
 * GET /api/consultation/rooms/[roomId]
 * Get detailed information about a specific consultation room
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

    // For test room, return mock data
    if (params.roomId === 'test-room-001') {
      const mockRoom = {
        id: 'test-room-001',
        name: 'Demo Consultation Room',
        description: 'A test room for demonstrating consultation features',
        roomType: 'consultation',
        clientId: session.user.id,
        consultantId: session.user.id,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        durationMinutes: 60,
        status: 'ACTIVE',
        settings: {
          videoEnabled: true,
          screenShareEnabled: true,
          recordingEnabled: false,
          whiteboardEnabled: true,
          chatEnabled: true
        },
        client: {
          id: session.user.id,
          name: session.user.name || 'Test Client',
          email: session.user.email || 'client@test.com'
        },
        consultant: {
          id: session.user.id,
          name: session.user.name || 'Test Consultant',
          email: session.user.email || 'consultant@test.com'
        },
        participants: [],
        messages: [],
        documents: [],
        whiteboards: [],
        actionItems: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const userRole = 'consultant';
      const permissions = getUserPermissions(userRole);
      
      return NextResponse.json({
        room: mockRoom,
        userRole,
        permissions
      });
    }
    
    // Try to fetch from database
    let room;
    try {
      room = await prisma.consultationRoom.findFirst({
        where: {
          id: params.roomId,
          OR: [
            { clientId: session.user.id },
            { consultantId: session.user.id }
          ]
        },
        include: {
          client: { select: { id: true, name: true, email: true, image: true } },
          consultant: { select: { id: true, name: true, email: true, image: true } }
        }
      });
    } catch (dbError) {
      console.warn('Database query failed, returning test data for room:', params.roomId);
      room = null;
    }

    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    // Determine user permissions
    const userRole = getUserRole(room, session.user.id);
    const permissions = getUserPermissions(userRole);

    return NextResponse.json({
      room,
      userRole,
      permissions
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/consultation/rooms/[roomId]
 * Update consultation room details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = updateRoomSchema.parse(body);

    // Verify user has permission to update this room
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: params.roomId,
        OR: [
          { consultantId: session.user.id }, // Consultant can always update
          { clientId: session.user.id }      // Client can update basic info
        ]
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or permission denied' }, { status: 404 });
    }

    // Update the room
    const updatedRoom = await prisma.consultationRoom.update({
      where: { id: params.roomId },
      data: {
        ...data,
        ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }),
        updatedAt: new Date()
      },
      include: {
        client: { select: { id: true, name: true, email: true, image: true } },
        consultant: { select: { id: true, name: true, email: true, image: true } }
      }
    });

    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error('Error updating room:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/consultation/rooms/[roomId]
 * Delete a consultation room (only consultants can delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is the consultant for this room
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: params.roomId,
        consultantId: session.user.id
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or permission denied' }, { status: 404 });
    }

    // Delete the room (cascade delete will handle related records)
    await prisma.consultationRoom.delete({
      where: { id: params.roomId }
    });

    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Determine user role in the room
 */
function getUserRole(room: any, userId: string): string {
  if (room.consultantId === userId) return 'consultant';
  if (room.clientId === userId) return 'client';
  
  const participant = room.participants.find((p: any) => p.userId === userId);
  return participant?.role || 'observer';
}

/**
 * Get user permissions based on role
 */
function getUserPermissions(role: string) {
  const permissions = {
    canEdit: ['consultant', 'client'].includes(role),
    canShare: ['consultant'].includes(role),
    canManage: ['consultant'].includes(role),
    canInvite: ['consultant', 'client'].includes(role),
    canDelete: ['consultant'].includes(role)
  };

  return permissions;
}

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});