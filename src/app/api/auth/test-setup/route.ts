import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * TEST ENDPOINT: Create test users for development
 * This endpoint should be removed in production
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    // Create test consultant user
    const consultantPassword = await hash('consultant123', 10);
    const consultant = await prisma.user.upsert({
      where: { email: 'consultant@test.com' },
      update: {},
      create: {
        email: 'consultant@test.com',
        name: 'Test Consultant',
        password: consultantPassword,
        role: 'CONSULTANT',
        isActive: true,
        emailVerified: new Date(),
      },
    });

    // Create test client user
    const clientPassword = await hash('client123', 10);
    const client = await prisma.user.upsert({
      where: { email: 'client@test.com' },
      update: {},
      create: {
        email: 'client@test.com',
        name: 'Test Client',
        password: clientPassword,
        role: 'CLIENT',
        isActive: true,
        emailVerified: new Date(),
      },
    });

    // Create a sample consultation room
    const room = await prisma.$queryRaw`
      INSERT INTO consultation_rooms (id, name, description, room_type, client_id, consultant_id, scheduled_at, duration_minutes, status, settings)
      VALUES (
        'test-room-001',
        'Demo Consultation Room',
        'A test room for demonstrating consultation features',
        'consultation',
        ${client.id},
        ${consultant.id},
        ${new Date(Date.now() + 24 * 60 * 60 * 1000)},
        60,
        'SCHEDULED',
        ${JSON.stringify({
          videoEnabled: true,
          screenShareEnabled: true,
          recordingEnabled: false,
          whiteboardEnabled: true,
          chatEnabled: true,
        })}::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name
      RETURNING *
    ` as any;
    const roomData = Array.isArray(room) ? room[0] : room;

    return NextResponse.json({
      message: 'Test users and room created successfully',
      users: [
        { 
          email: 'consultant@test.com', 
          password: 'consultant123', 
          role: 'CONSULTANT',
          name: 'Test Consultant'
        },
        { 
          email: 'client@test.com', 
          password: 'client123', 
          role: 'CLIENT',
          name: 'Test Client'
        },
      ],
      room: {
        id: roomData?.id || 'test-room-001',
        name: roomData?.name || 'Demo Consultation Room',
        url: `/collaboration/rooms/${roomData?.id || 'test-room-001'}`
      },
      instructions: [
        '1. Go to /auth/signin',
        '2. Use the credentials above to sign in',
        '3. Navigate to /collaboration to see the dashboard',
        '4. Click on the demo room to test features'
      ]
    });
  } catch (error) {
    console.error('Error creating test users:', error);
    return NextResponse.json({ 
      error: 'Failed to create test users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}