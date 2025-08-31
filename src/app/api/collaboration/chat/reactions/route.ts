import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reactionSchema = z.object({
  messageId: z.string(),
  emoji: z.string(),
  roomId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = reactionSchema.parse(body);

    // Verify user has access to the room
    const room = await prisma.room.findFirst({
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

    // Get the message
    const message = await prisma.chatMessage.findFirst({
      where: {
        id: validatedData.messageId,
        roomId: validatedData.roomId,
      },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Update reactions
    const reactions = (message.reactions as any) || {};
    const userIds = reactions[validatedData.emoji] || [];
    
    let updatedReactions;
    if (userIds.includes(session.user.id)) {
      // Remove reaction
      const filteredUserIds = userIds.filter((id: string) => id !== session.user.id);
      if (filteredUserIds.length === 0) {
        delete reactions[validatedData.emoji];
      } else {
        reactions[validatedData.emoji] = filteredUserIds;
      }
      updatedReactions = reactions;
    } else {
      // Add reaction
      reactions[validatedData.emoji] = [...userIds, session.user.id];
      updatedReactions = reactions;
    }

    // Update message with new reactions
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: validatedData.messageId },
      data: { reactions: updatedReactions },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Error handling reaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}