# 🗄️ Backend Implementation Plan for Consultation Suite

## Overview

Detailed implementation plan for connecting existing collaboration frontend to a functional backend that supports client consultations with minimal development effort and maximum business value.

---

## 🎯 Implementation Strategy

### Approach: **Progressive Enhancement**
1. **Phase 1**: Basic functionality with mock data replacement
2. **Phase 2**: Real-time features with simple polling
3. **Phase 3**: Advanced features and optimization
4. **Phase 4**: Analytics and business intelligence

### Technology Decisions
- **Database**: PostgreSQL (existing)
- **ORM**: Prisma (existing)
- **API**: Next.js API routes (existing structure)
- **Real-time**: Server-Sent Events → WebSocket (progressive)
- **File Storage**: Local upload → Cloud storage (progressive)
- **Authentication**: NextAuth (existing)

---

## 📊 Database Schema Implementation

### Phase 1: Core Tables

```sql
-- Consultation rooms (main entity)
CREATE TABLE consultation_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  room_type VARCHAR(50) NOT NULL DEFAULT 'consultation', -- 'consultation', 'training', 'review'
  
  -- Participants
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Scheduling
  scheduled_at TIMESTAMP,
  duration_minutes INTEGER DEFAULT 60,
  
  -- Status management
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'active', 'completed', 'cancelled'
  
  -- Settings
  settings JSONB DEFAULT '{}', -- Room configuration
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- Indexes
  INDEX idx_consultation_rooms_client_id (client_id),
  INDEX idx_consultation_rooms_consultant_id (consultant_id),
  INDEX idx_consultation_rooms_status (status),
  INDEX idx_consultation_rooms_scheduled_at (scheduled_at)
);

-- Chat messages
CREATE TABLE consultation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES consultation_rooms(id) ON DELETE CASCADE,
  
  -- Message details  
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'file', 'system', 'action_item'
  
  -- Metadata
  metadata JSONB DEFAULT '{}', -- Attachments, formatting, etc.
  
  -- Status
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_messages_room_id (room_id),
  INDEX idx_messages_sender_id (sender_id),
  INDEX idx_messages_created_at (created_at),
  INDEX idx_messages_type (message_type)
);

-- Documents and files
CREATE TABLE consultation_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES consultation_rooms(id) ON DELETE CASCADE,
  
  -- Document details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  document_type VARCHAR(50) DEFAULT 'document', -- 'document', 'template', 'attachment'
  
  -- Content
  content TEXT, -- For text documents
  file_path VARCHAR(500), -- For uploaded files
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Access control
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_template BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_documents_room_id (room_id),
  INDEX idx_documents_type (document_type),
  INDEX idx_documents_uploaded_by (uploaded_by),
  INDEX idx_documents_is_template (is_template)
);

-- Whiteboard data
CREATE TABLE consultation_whiteboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES consultation_rooms(id) ON DELETE CASCADE,
  
  -- Whiteboard content
  canvas_data JSONB NOT NULL, -- Fabric.js or Excalidraw JSON
  thumbnail_url VARCHAR(500), -- Preview image
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES consultation_whiteboards(id),
  
  -- Metadata
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) DEFAULT 'Whiteboard',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_whiteboards_room_id (room_id),
  INDEX idx_whiteboards_updated_by (updated_by),
  INDEX idx_whiteboards_version (version)
);

-- Action items and follow-ups
CREATE TABLE consultation_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES consultation_rooms(id) ON DELETE CASCADE,
  
  -- Action item details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  -- Assignment
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  due_date TIMESTAMP,
  
  -- Completion
  completed_at TIMESTAMP,
  completion_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_action_items_room_id (room_id),
  INDEX idx_action_items_assigned_to (assigned_to),
  INDEX idx_action_items_status (status),
  INDEX idx_action_items_due_date (due_date)
);
```

### Phase 2: Extended Tables

```sql
-- Room participants (for group consultations)
CREATE TABLE consultation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES consultation_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Role and permissions
  role VARCHAR(50) DEFAULT 'participant', -- 'host', 'consultant', 'client', 'participant', 'observer'
  permissions JSONB DEFAULT '{"can_edit": false, "can_share": false}',
  
  -- Participation tracking
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Activity metrics
  total_time_minutes INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  documents_viewed INTEGER DEFAULT 0,
  
  -- Unique constraint
  UNIQUE(room_id, user_id),
  
  -- Indexes
  INDEX idx_participants_room_id (room_id),
  INDEX idx_participants_user_id (user_id),
  INDEX idx_participants_role (role)
);

-- Session analytics
CREATE TABLE consultation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES consultation_rooms(id) ON DELETE CASCADE,
  
  -- Session metrics
  actual_duration_minutes INTEGER,
  participant_count INTEGER,
  messages_count INTEGER,
  documents_shared INTEGER,
  action_items_created INTEGER,
  
  -- Engagement metrics
  avg_response_time_seconds INTEGER,
  tool_usage JSONB, -- Usage time per tool: video, chat, whiteboard, documents
  client_satisfaction_score DECIMAL(3,2), -- 1.00 to 5.00
  
  -- Technical metrics
  connection_issues INTEGER DEFAULT 0,
  feature_errors INTEGER DEFAULT 0,
  
  -- Business metrics
  follow_up_scheduled BOOLEAN DEFAULT FALSE,
  project_proposed BOOLEAN DEFAULT FALSE,
  contract_signed BOOLEAN DEFAULT FALSE,
  project_value DECIMAL(10,2),
  
  -- Timestamps
  recorded_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_analytics_room_id (room_id),
  INDEX idx_analytics_recorded_at (recorded_at)
);
```

---

## 🔌 API Routes Implementation

### Phase 1: Core Endpoints

#### 1. Room Management
```typescript
// /src/app/api/consultation/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    const rooms = await db.consultationRoom.findMany({
      where: {
        OR: [
          { clientId: session.user.id },
          { consultantId: session.user.id }
        ],
        ...(status && { status })
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        consultant: { select: { id: true, name: true, email: true } },
        messages: { 
          select: { id: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: { messages: true, documents: true, actionItems: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    });

    return NextResponse.json({ rooms, count: rooms.length });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, clientId, scheduledAt, durationType = 'consultation' } = data;

    const room = await db.consultationRoom.create({
      data: {
        name,
        description,
        roomType: durationType,
        clientId,
        consultantId: session.user.id,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'scheduled'
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        consultant: { select: { id: true, name: true, email: true } }
      }
    });

    // Initialize room with default documents if template exists
    await initializeRoomWithTemplate(room.id, durationType);

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to initialize room with templates
async function initializeRoomWithTemplate(roomId: string, roomType: string) {
  const templates = {
    'consultation': [
      { title: 'AI Readiness Assessment', content: '# AI Readiness Assessment\n\n## Current State\n- Existing technology infrastructure\n- Team AI knowledge level\n- Data availability and quality\n\n## Goals and Objectives\n- Business problems to solve\n- Expected outcomes\n- Success criteria\n\n## Next Steps\n- Technical requirements\n- Timeline and milestones\n- Investment considerations' },
      { title: 'Meeting Notes', content: '# Consultation Meeting Notes\n\n## Attendees\n- \n\n## Key Discussion Points\n- \n\n## Decisions Made\n- \n\n## Action Items\n- [ ] \n\n## Follow-up Required\n- ' }
    ],
    'technical-review': [
      { title: 'Technical Architecture Review', content: '# Technical Architecture Review\n\n## Current Architecture\n- System overview\n- Technology stack\n- Data flow\n\n## AI Integration Points\n- ML model integration\n- Data pipeline requirements\n- API interfaces\n\n## Recommendations\n- Architecture improvements\n- Technology suggestions\n- Implementation approach' }
    ],
    'training': [
      { title: 'AI Training Session Outline', content: '# AI Training Session\n\n## Learning Objectives\n- Understanding AI fundamentals\n- Practical applications\n- Implementation strategies\n\n## Agenda\n1. AI Overview (30 min)\n2. Use Cases Discussion (30 min)\n3. Hands-on Exercise (60 min)\n4. Q&A Session (30 min)\n\n## Resources\n- Slides and materials\n- Exercise files\n- Additional reading' }
    ]
  };

  const roomTemplates = templates[roomType as keyof typeof templates] || templates.consultation;

  for (const template of roomTemplates) {
    await db.consultationDocument.create({
      data: {
        roomId,
        title: template.title,
        content: template.content,
        documentType: 'template',
        isTemplate: true,
        isShared: true
      }
    });
  }
}
```

#### 2. Real-time Messages
```typescript
// /src/app/api/consultation/rooms/[roomId]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lastMessageId = searchParams.get('lastId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Verify user has access to room
    const room = await db.consultationRoom.findFirst({
      where: {
        id: params.roomId,
        OR: [
          { clientId: session.user.id },
          { consultantId: session.user.id }
        ]
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    const messages = await db.consultationMessage.findMany({
      where: {
        roomId: params.roomId,
        isDeleted: false,
        ...(lastMessageId && {
          createdAt: { gt: (await db.consultationMessage.findUnique({ 
            where: { id: lastMessageId } 
          }))?.createdAt }
        })
      },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true } }
      },
      orderBy: { createdAt: 'asc' },
      take: limit
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { content, messageType = 'text', metadata = {} } = data;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    // Verify user has access to room
    const room = await db.consultationRoom.findFirst({
      where: {
        id: params.roomId,
        OR: [
          { clientId: session.user.id },
          { consultantId: session.user.id }
        ]
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 404 });
    }

    const message = await db.consultationMessage.create({
      data: {
        roomId: params.roomId,
        senderId: session.user.id,
        content: content.trim(),
        messageType,
        metadata
      },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true } }
      }
    });

    // Update room activity timestamp
    await db.consultationRoom.update({
      where: { id: params.roomId },
      data: { updatedAt: new Date() }
    });

    // Broadcast message to other participants (SSE or WebSocket)
    await broadcastMessage(params.roomId, message, session.user.id);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function for real-time message broadcasting
async function broadcastMessage(roomId: string, message: any, senderId: string) {
  // Implementation depends on chosen real-time strategy:
  // Option 1: Server-Sent Events
  // Option 2: WebSocket
  // Option 3: Database polling (simplest)
  
  // For now, we'll implement simple database flagging for polling
  await db.consultationRoom.update({
    where: { id: roomId },
    data: { 
      updatedAt: new Date(),
      settings: {
        lastMessageId: message.id,
        lastActivityUserId: senderId
      }
    }
  });
}
```

#### 3. Document Management
```typescript
// /src/app/api/consultation/rooms/[roomId]/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify access
    const room = await db.consultationRoom.findFirst({
      where: {
        id: params.roomId,
        OR: [{ clientId: session.user.id }, { consultantId: session.user.id }]
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const documents = await db.consultationDocument.findMany({
      where: {
        roomId: params.roomId,
        isShared: true
      },
      include: {
        uploadedBy: { select: { id: true, name: true } }
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

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const documentType = formData.get('documentType') as string || 'document';

    if (!file && !title) {
      return NextResponse.json({ error: 'File or title required' }, { status: 400 });
    }

    let filePath = null;
    let fileName = null;
    let fileSize = null;
    let mimeType = null;

    // Handle file upload
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create upload directory
      const uploadDir = join(process.cwd(), 'uploads', 'consultation', params.roomId);
      await mkdir(uploadDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      fileName = `${timestamp}_${sanitizedName}`;
      filePath = join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      fileSize = buffer.length;
      mimeType = file.type;
    }

    const document = await db.consultationDocument.create({
      data: {
        roomId: params.roomId,
        title: title || file?.name || 'Untitled Document',
        description,
        documentType,
        filePath: filePath ? `/uploads/consultation/${params.roomId}/${fileName}` : null,
        fileName,
        fileSize,
        mimeType,
        uploadedBy: session.user.id,
        isShared: true
      },
      include: {
        uploadedBy: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### 4. Whiteboard Data
```typescript
// /src/app/api/consultation/rooms/[roomId]/whiteboard/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whiteboard = await db.consultationWhiteboard.findFirst({
      where: { roomId: params.roomId },
      orderBy: { version: 'desc' },
      include: {
        updatedBy: { select: { id: true, name: true } }
      }
    });

    if (!whiteboard) {
      // Return empty whiteboard data
      return NextResponse.json({ 
        whiteboard: {
          id: null,
          roomId: params.roomId,
          canvasData: { objects: [], version: '1.0' },
          version: 1
        }
      });
    }

    return NextResponse.json({ whiteboard });
  } catch (error) {
    console.error('Error fetching whiteboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { canvasData, title = 'Whiteboard' } = await request.json();

    if (!canvasData) {
      return NextResponse.json({ error: 'Canvas data required' }, { status: 400 });
    }

    // Get current version
    const currentWhiteboard = await db.consultationWhiteboard.findFirst({
      where: { roomId: params.roomId },
      orderBy: { version: 'desc' }
    });

    const newVersion = (currentWhiteboard?.version || 0) + 1;

    const whiteboard = await db.consultationWhiteboard.create({
      data: {
        roomId: params.roomId,
        canvasData,
        title,
        version: newVersion,
        parentVersionId: currentWhiteboard?.id,
        updatedBy: session.user.id
      },
      include: {
        updatedBy: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({ whiteboard });
  } catch (error) {
    console.error('Error saving whiteboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 🔄 Real-Time Implementation Strategy

### Phase 1: Simple Polling (Immediate)
```typescript
// /src/hooks/useConsultationPolling.ts
import { useState, useEffect } from 'react';

export const useConsultationPolling = (roomId: string, interval = 5000) => {
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const [messages, documents, whiteboard] = await Promise.all([
          fetch(`/api/consultation/rooms/${roomId}/messages${lastUpdate ? `?lastId=${lastUpdate}` : ''}`).then(r => r.json()),
          fetch(`/api/consultation/rooms/${roomId}/documents`).then(r => r.json()),
          fetch(`/api/consultation/rooms/${roomId}/whiteboard`).then(r => r.json())
        ]);

        setData({ messages: messages.messages, documents: documents.documents, whiteboard: whiteboard.whiteboard });
        if (messages.messages.length > 0) {
          setLastUpdate(messages.messages[messages.messages.length - 1].id);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    poll(); // Initial load
    const intervalId = setInterval(poll, interval);
    return () => clearInterval(intervalId);
  }, [roomId, interval, lastUpdate]);

  return data;
};
```

### Phase 2: Server-Sent Events (Week 2)
```typescript
// /src/app/api/consultation/rooms/[roomId]/events/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', roomId: params.roomId })}\n\n`));

      // Set up database listeners/polling for changes
      const pollForUpdates = setInterval(async () => {
        try {
          // Check for new messages, documents, etc.
          const updates = await checkForUpdates(params.roomId, session.user.id);
          if (updates.length > 0) {
            updates.forEach(update => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
            });
          }
        } catch (error) {
          console.error('SSE polling error:', error);
        }
      }, 2000);

      // Cleanup
      return () => {
        clearInterval(pollForUpdates);
      };
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

async function checkForUpdates(roomId: string, userId: string) {
  // Implementation to check for updates since last check
  // Return array of update events
  return [];
}
```

### Phase 3: WebSocket (Advanced)
```typescript
// /src/lib/websocket-server.ts (separate server or Next.js API route with upgrade)
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: { origin: process.env.NEXTAUTH_URL }
});

io.on('connection', (socket) => {
  socket.on('join-room', async (data) => {
    const { roomId, token } = data;
    
    // Verify user authentication
    const user = await verifyToken(token);
    if (!user) return socket.disconnect();

    // Verify room access
    const hasAccess = await verifyRoomAccess(roomId, user.id);
    if (!hasAccess) return socket.disconnect();

    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { userId: user.id, userName: user.name });
  });

  socket.on('send-message', async (data) => {
    const { roomId, content, messageType } = data;
    
    // Save to database
    const message = await createMessage(roomId, socket.userId, content, messageType);
    
    // Broadcast to room
    io.to(roomId).emit('new-message', message);
  });

  socket.on('update-whiteboard', async (data) => {
    const { roomId, canvasData } = data;
    
    // Save to database
    await saveWhiteboard(roomId, canvasData, socket.userId);
    
    // Broadcast to others in room
    socket.to(roomId).emit('whiteboard-updated', { canvasData, updatedBy: socket.userId });
  });
});
```

---

## 🗂️ File Upload and Storage

### Phase 1: Local File Storage
```typescript
// /src/lib/file-upload.ts
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export const uploadFile = async (file: File, roomId: string): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Create directory structure
  const uploadDir = join(process.cwd(), 'uploads', 'consultation', roomId);
  await mkdir(uploadDir, { recursive: true });
  
  // Generate unique filename
  const fileId = randomUUID();
  const extension = file.name.split('.').pop();
  const fileName = `${fileId}.${extension}`;
  const filePath = join(uploadDir, fileName);
  
  await writeFile(filePath, buffer);
  
  return `/uploads/consultation/${roomId}/${fileName}`;
};

// Serve uploaded files
// /src/app/uploads/consultation/[roomId]/[filename]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string; filename: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Verify user has access to room
  const hasAccess = await verifyRoomAccess(params.roomId, session.user.id);
  if (!hasAccess) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const filePath = join(process.cwd(), 'uploads', 'consultation', params.roomId, params.filename);
  
  try {
    const file = await readFile(filePath);
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${params.filename}"`
      }
    });
  } catch (error) {
    return new NextResponse('File not found', { status: 404 });
  }
}
```

### Phase 2: Cloud Storage (Optional Enhancement)
```typescript
// /src/lib/cloud-storage.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export const uploadToCloud = async (file: File, roomId: string): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `consultation/${roomId}/${Date.now()}-${file.name}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: file.type
  }));

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
```

---

## 🔐 Authentication and Authorization

### Room Access Control
```typescript
// /src/lib/room-access.ts
import { db } from '@/lib/db';

export const verifyRoomAccess = async (roomId: string, userId: string): Promise<boolean> => {
  const room = await db.consultationRoom.findFirst({
    where: {
      id: roomId,
      OR: [
        { clientId: userId },
        { consultantId: userId },
        {
          participants: {
            some: { userId, isActive: true }
          }
        }
      ]
    }
  });

  return !!room;
};

export const getRoomPermissions = async (roomId: string, userId: string) => {
  const room = await db.consultationRoom.findFirst({
    where: { id: roomId },
    include: {
      participants: { where: { userId } }
    }
  });

  if (!room) return null;

  // Determine user role and permissions
  let role = 'observer';
  if (room.consultantId === userId) role = 'consultant';
  else if (room.clientId === userId) role = 'client';
  else if (room.participants[0]) role = room.participants[0].role;

  const permissions = {
    canEdit: ['consultant', 'client'].includes(role),
    canShare: ['consultant'].includes(role),
    canManage: ['consultant'].includes(role),
    canInvite: ['consultant', 'client'].includes(role)
  };

  return { role, permissions };
};
```

---

## 📊 Analytics Implementation

### Session Tracking
```typescript
// /src/lib/analytics.ts
export const trackConsultationEvent = async (
  roomId: string,
  userId: string,
  eventType: string,
  eventData: any = {}
) => {
  await db.consultationAnalytics.upsert({
    where: { roomId },
    create: {
      roomId,
      [eventType]: 1,
      toolUsage: { [eventType]: eventData.duration || 1 }
    },
    update: {
      [eventType]: { increment: 1 },
      toolUsage: {
        ...eventData.previousUsage,
        [eventType]: (eventData.previousUsage?.[eventType] || 0) + (eventData.duration || 1)
      }
    }
  });
};

// Usage in components:
// trackConsultationEvent(roomId, userId, 'whiteboard_used', { duration: 300 });
// trackConsultationEvent(roomId, userId, 'document_shared');
// trackConsultationEvent(roomId, userId, 'video_call_started');
```

---

## 🚀 Implementation Timeline

### Week 1: Foundation
- **Day 1-2**: Database schema creation and Prisma setup
- **Day 3-4**: Core API routes (rooms, messages, documents)
- **Day 5**: Connect frontend components to APIs, remove mock data

### Week 2: Real-time Features
- **Day 1-2**: Implement polling-based real-time updates
- **Day 3**: File upload and storage system
- **Day 4**: Whiteboard data persistence
- **Day 5**: Testing and bug fixes

### Week 3: Enhancement
- **Day 1-2**: Server-Sent Events for better real-time
- **Day 3**: Analytics and tracking implementation
- **Day 4**: Email notifications and follow-up automation
- **Day 5**: Performance optimization and security review

### Week 4: Polish and Launch
- **Day 1-2**: UI/UX improvements based on testing
- **Day 3**: Documentation and onboarding materials
- **Day 4**: Final testing and deployment
- **Day 5**: Soft launch and feedback collection

---

## ✅ Success Criteria

### Technical Success:
- [ ] All API endpoints respond correctly
- [ ] Real-time updates work reliably
- [ ] File uploads and downloads function
- [ ] Database queries are optimized
- [ ] Authentication and authorization secure
- [ ] Error handling comprehensive
- [ ] Performance meets targets (< 2s response time)

### Business Success:
- [ ] First client consultation completed successfully
- [ ] Session data captured and analyzed
- [ ] Follow-up automation working
- [ ] Client satisfaction positive
- [ ] Revenue potential validated

---

*Implementation Plan Created: December 2024*  
*Focus: Practical backend for existing frontend*  
*Goal: Minimal viable product with maximum business value*