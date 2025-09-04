import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, emoji, roomId } = body;

    if (!messageId || !emoji || !roomId) {
      return NextResponse.json(
        { error: 'Message ID, emoji, and room ID are required' },
        { status: 400 }
      );
    }

    // Verify room access
    const room = await prisma.consultationRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { clientId: session.user.id },
          { consultantId: session.user.id },
          {
            participants: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or access denied' },
        { status: 404 }
      );
    }

    // Get the message and current reactions
    const message = await prisma.consultationMessage.findFirst({
      where: {
        id: messageId,
        roomId: roomId
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Parse current reactions (stored as JSON)
    const reactions = (message.metadata as any)?.reactions || {};
    const userReactions = reactions[emoji] || [];

    let updatedReactions;
    if (userReactions.includes(session.user.id)) {
      // Remove reaction
      updatedReactions = {
        ...reactions,
        [emoji]: userReactions.filter((id: string) => id !== session.user.id)
      };
      
      // Remove empty emoji arrays
      if (updatedReactions[emoji].length === 0) {
        delete updatedReactions[emoji];
      }
    } else {
      // Add reaction
      updatedReactions = {
        ...reactions,
        [emoji]: [...userReactions, session.user.id]
      };
    }

    // Update message metadata with new reactions
    const updatedMessage = await prisma.consultationMessage.update({
      where: { id: messageId },
      data: {
        metadata: {
          ...(message.metadata as object),
          reactions: updatedReactions
        }
      }
    });

    return NextResponse.json({ 
      reactions: updatedReactions,
      success: true 
    });
  } catch (error) {
    console.error('Error updating message reactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}