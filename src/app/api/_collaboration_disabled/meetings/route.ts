import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createMeetingSchema = z.object({
  title: z.string().min(1, 'Meeting title is required'),
  description: z.string().optional(),
  scheduledAt: z.string().datetime('Invalid date format'),
  duration: z.number().min(15).max(480).optional(), // 15 minutes to 8 hours
  roomId: z.string(),
  inviteEmails: z.array(z.string().email()).optional(),
  agenda: z.array(z.object({
    title: z.string(),
    duration: z.number().optional(),
  })).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const meetings = await prisma.meeting.findMany({
      where: {
        AND: [
          {
            OR: [
              { organizerId: session.user.id },
              { participants: { some: { userId: session.user.id } } },
              { room: { participants: { some: { userId: session.user.id } } } },
            ],
          },
          ...(roomId ? [{ roomId }] : []),
          ...(status ? [{ status: status as any }] : []),
        ],
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            dailyRoomUrl: true,
          },
        },
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        invites: {
          select: {
            email: true,
            status: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createMeetingSchema.parse(body);

    // Check if user has access to the room
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: validatedData.roomId,
        OR: [
          { createdBy: session.user.id },
          { participants: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    const scheduledAt = new Date(validatedData.scheduledAt);
    const endDate = validatedData.duration 
      ? new Date(scheduledAt.getTime() + validatedData.duration * 60 * 1000)
      : new Date(scheduledAt.getTime() + 60 * 60 * 1000); // Default 1 hour

    const meeting = await prisma.meeting.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        scheduledAt,
        duration: validatedData.duration,
        roomId: validatedData.roomId,
        organizerId: session.user.id,
        agenda: validatedData.agenda,
        status: 'SCHEDULED',
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            dailyRoomUrl: true,
          },
        },
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create invites if provided
    if (validatedData.inviteEmails && validatedData.inviteEmails.length > 0) {
      const invites = await Promise.all(
        validatedData.inviteEmails.map(email =>
          prisma.meetingInvite.create({
            data: {
              meetingId: meeting.id,
              email,
              status: 'PENDING',
              sentAt: new Date(),
            },
          })
        )
      );

      // TODO: Send email invitations here
      console.log(`Sending invitations for meeting ${meeting.id} to:`, validatedData.inviteEmails);
    }

    return NextResponse.json(meeting);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}