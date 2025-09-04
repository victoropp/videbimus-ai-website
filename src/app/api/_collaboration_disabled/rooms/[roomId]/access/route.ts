import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const accessControlSchema = z.object({
  userId: z.string(),
  role: z.enum(['HOST', 'MODERATOR', 'PARTICIPANT', 'OBSERVER']),
});

const bulkAccessSchema = z.object({
  participants: z.array(z.object({
    email: z.string().email(),
    role: z.enum(['HOST', 'MODERATOR', 'PARTICIPANT', 'OBSERVER']).default('PARTICIPANT'),
  }))
});

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is room creator or has access
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: params.roomId,
        OR: [
          { createdBy: session.user.id },
          { participants: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          },
          orderBy: { joinedAt: 'asc' }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    // Get user's role in the room
    const userParticipant = room.participants.find(p => p.userId === session.user.id);
    const userRole = room.createdBy === session.user.id ? 'HOST' : userParticipant?.role || 'OBSERVER';

    // Check if user has permission to view access control
    if (userRole === 'OBSERVER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        type: room.type,
        maxParticipants: room.maxParticipants,
        creator: room.creator
      },
      participants: room.participants.map(p => ({
        id: p.id,
        userId: p.userId,
        role: p.role,
        joinedAt: p.joinedAt,
        isOnline: p.isOnline,
        user: p.user
      })),
      userRole
    });
  } catch (error) {
    console.error('Error fetching room access:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if it's bulk invitation or single user
    let validatedData;
    let isBulkInvite = false;
    
    try {
      validatedData = bulkAccessSchema.parse(body);
      isBulkInvite = true;
    } catch {
      validatedData = accessControlSchema.parse(body);
    }

    // Check if user has permission to manage room access
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: params.roomId,
        OR: [
          { createdBy: session.user.id },
          { participants: { some: { userId: session.user.id, role: { in: ['HOST', 'MODERATOR'] } } } },
        ],
      },
      include: {
        participants: true
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or insufficient permissions' }, { status: 404 });
    }

    // Check room capacity
    if (isBulkInvite) {
      const currentParticipants = room.participants.length;
      const newParticipants = (validatedData as any).participants.length;
      
      if (currentParticipants + newParticipants > room.maxParticipants) {
        return NextResponse.json({ 
          error: `Room capacity exceeded. Maximum ${room.maxParticipants} participants allowed.` 
        }, { status: 400 });
      }

      // Process bulk invitations
      const results = [];
      const errors = [];

      for (const participant of (validatedData as any).participants) {
        try {
          // Find or create user by email
          let user = await prisma.user.findUnique({
            where: { email: participant.email }
          });

          if (!user) {
            // Create guest user
            user = await prisma.user.create({
              data: {
                email: participant.email,
                name: participant.email.split('@')[0],
                role: 'GUEST'
              }
            });
          }

          // Check if already a participant
          const existingParticipant = await prisma.roomParticipant.findUnique({
            where: {
              roomId_userId: {
                roomId: params.roomId,
                userId: user.id
              }
            }
          });

          if (existingParticipant) {
            errors.push({ email: participant.email, error: 'Already a participant' });
            continue;
          }

          // Add as participant
          const newParticipant = await prisma.roomParticipant.create({
            data: {
              roomId: params.roomId,
              userId: user.id,
              role: participant.role
            },
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true }
              }
            }
          });

          // Create notification for invited user
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: 'Room Invitation',
              content: `You have been invited to join "${room.name}"`,
              type: 'MEETING_INVITE',
              data: {
                roomId: params.roomId,
                invitedBy: session.user.name || session.user.email,
                role: participant.role
              }
            }
          });

          results.push(newParticipant);
        } catch (error) {
          errors.push({ email: participant.email, error: 'Failed to add participant' });
        }
      }

      return NextResponse.json({
        success: true,
        added: results.length,
        errors,
        participants: results
      });

    } else {
      // Single user access management
      const singleData = validatedData as { userId: string; role: string };
      
      // Check if user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: singleData.userId }
      });

      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Check room capacity for new participant
      const existingParticipant = await prisma.roomParticipant.findUnique({
        where: {
          roomId_userId: {
            roomId: params.roomId,
            userId: singleData.userId
          }
        }
      });

      if (!existingParticipant && room.participants.length >= room.maxParticipants) {
        return NextResponse.json({ 
          error: `Room capacity exceeded. Maximum ${room.maxParticipants} participants allowed.` 
        }, { status: 400 });
      }

      // Add or update participant
      const participant = await prisma.roomParticipant.upsert({
        where: {
          roomId_userId: {
            roomId: params.roomId,
            userId: singleData.userId
          }
        },
        create: {
          roomId: params.roomId,
          userId: singleData.userId,
          role: singleData.role as any
        },
        update: {
          role: singleData.role as any
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true }
          }
        }
      });

      // Create notification
      if (!existingParticipant) {
        await prisma.notification.create({
          data: {
            userId: singleData.userId,
            title: 'Room Access Granted',
            content: `You have been given ${singleData.role.toLowerCase()} access to "${room.name}"`,
            type: 'SYSTEM',
            data: {
              roomId: params.roomId,
              grantedBy: session.user.name || session.user.email,
              role: singleData.role
            }
          }
        });
      }

      return NextResponse.json({
        success: true,
        participant,
        action: existingParticipant ? 'updated' : 'added'
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Error managing room access:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user has permission to remove participants
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: params.roomId,
        OR: [
          { createdBy: session.user.id },
          { participants: { some: { userId: session.user.id, role: { in: ['HOST', 'MODERATOR'] } } } },
        ],
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or insufficient permissions' }, { status: 404 });
    }

    // Cannot remove room creator
    if (userId === room.createdBy) {
      return NextResponse.json({ error: 'Cannot remove room creator' }, { status: 400 });
    }

    // Remove participant
    const deletedParticipant = await prisma.roomParticipant.delete({
      where: {
        roomId_userId: {
          roomId: params.roomId,
          userId: userId
        }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Create notification for removed user
    await prisma.notification.create({
      data: {
        userId: userId,
        title: 'Room Access Removed',
        content: `Your access to "${room.name}" has been revoked`,
        type: 'SYSTEM',
        data: {
          roomId: params.roomId,
          removedBy: session.user.name || session.user.email
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Participant removed successfully',
      removedUser: deletedParticipant.user
    });

  } catch (error) {
    console.error('Error removing room participant:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}