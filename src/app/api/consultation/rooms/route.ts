import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Request validation schema
const createRoomSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  clientId: z.string(),
  scheduledAt: z.string().datetime().optional(),
  roomType: z.enum(['consultation', 'training', 'review']).default('consultation'),
  durationMinutes: z.number().min(15).max(480).default(60)
});

const querySchema = z.object({
  status: z.enum(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).default(10),
  page: z.string().regex(/^\d+$/).transform(Number).default(1)
});

/**
 * GET /api/consultation/rooms
 * Retrieve consultation rooms for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      status: searchParams.get('status'),
      limit: searchParams.get('limit') || '10',
      page: searchParams.get('page') || '1'
    });

    const skip = (query.page - 1) * query.limit;

    const whereClause = {
      OR: [
        { clientId: session.user.id },
        { consultantId: session.user.id }
      ],
      ...(query.status && { status: query.status })
    };

    // Get rooms and count for pagination
    const [rooms, totalCount] = await Promise.all([
      prisma.consultationRoom.findMany({
        where: whereClause,
        include: {
          client: { select: { id: true, name: true, email: true, image: true } },
          consultant: { select: { id: true, name: true, email: true, image: true } },
          messages: { 
            select: { id: true, createdAt: true, senderId: true },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: {
            select: { 
              messages: true, 
              documents: true, 
              actionItems: true,
              participants: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: query.limit,
        skip
      }),
      prisma.consultationRoom.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / query.limit);

    return NextResponse.json({
      rooms,
      pagination: {
        total: totalCount,
        pages: totalPages,
        current: query.page,
        limit: query.limit
      }
    });
  } catch (error) {
    console.error('Error fetching consultation rooms:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/consultation/rooms
 * Create a new consultation room
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createRoomSchema.parse(body);

    // Verify the client exists
    const client = await prisma.user.findUnique({
      where: { id: data.clientId },
      select: { id: true, name: true, email: true }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Create the consultation room
    const room = await prisma.consultationRoom.create({
      data: {
        name: data.name,
        description: data.description,
        roomType: data.roomType,
        clientId: data.clientId,
        consultantId: session.user.id,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        durationMinutes: data.durationMinutes,
        status: 'SCHEDULED'
      },
      include: {
        client: { select: { id: true, name: true, email: true, image: true } },
        consultant: { select: { id: true, name: true, email: true, image: true } }
      }
    });

    // Initialize room with default templates based on room type
    await initializeRoomWithTemplates(room.id, data.roomType);

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error('Error creating consultation room:', error);
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
 * Initialize room with templates based on room type
 */
async function initializeRoomWithTemplates(roomId: string, roomType: string) {
  const templates = {
    'consultation': [
      { 
        title: 'AI Readiness Assessment', 
        content: '# AI Readiness Assessment\n\n## Current State\n- Existing technology infrastructure\n- Team AI knowledge level\n- Data availability and quality\n\n## Goals and Objectives\n- Business problems to solve\n- Expected outcomes\n- Success criteria\n\n## Next Steps\n- Technical requirements\n- Timeline and milestones\n- Investment considerations',
        documentType: 'template'
      },
      { 
        title: 'Meeting Notes', 
        content: '# Consultation Meeting Notes\n\n## Attendees\n- \n\n## Key Discussion Points\n- \n\n## Decisions Made\n- \n\n## Action Items\n- [ ] \n\n## Follow-up Required\n- ',
        documentType: 'document'
      }
    ],
    'training': [
      { 
        title: 'AI Training Session Outline', 
        content: '# AI Training Session\n\n## Learning Objectives\n- Understanding AI fundamentals\n- Practical applications\n- Implementation strategies\n\n## Agenda\n1. AI Overview (30 min)\n2. Use Cases Discussion (30 min)\n3. Hands-on Exercise (60 min)\n4. Q&A Session (30 min)\n\n## Resources\n- Slides and materials\n- Exercise files\n- Additional reading',
        documentType: 'template'
      }
    ],
    'review': [
      { 
        title: 'Technical Architecture Review', 
        content: '# Technical Architecture Review\n\n## Current Architecture\n- System overview\n- Technology stack\n- Data flow\n\n## AI Integration Points\n- ML model integration\n- Data pipeline requirements\n- API interfaces\n\n## Recommendations\n- Architecture improvements\n- Technology suggestions\n- Implementation approach',
        documentType: 'template'
      }
    ]
  };

  const roomTemplates = templates[roomType as keyof typeof templates] || templates.consultation;

  for (const template of roomTemplates) {
    await prisma.consultationDocument.create({
      data: {
        roomId,
        title: template.title,
        content: template.content,
        documentType: template.documentType,
        isTemplate: template.documentType === 'template',
        isShared: true
      }
    });
  }
}

// Clean up Prisma connection on module unload
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});