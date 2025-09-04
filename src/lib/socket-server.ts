import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextApiRequest } from 'next';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
  roomId?: string;
}

interface RoomData {
  participants: Set<string>;
  whiteboard: any;
  document: any;
  cursors: Map<string, any>;
}

class SocketService {
  private io: SocketIOServer | null = null;
  private rooms: Map<string, RoomData> = new Map();

  initialize(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('Socket.IO server initialized');
    return this.io;
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io?.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify session/token here - simplified version
        const session = await this.verifySession(token);
        if (!session?.user) {
          return next(new Error('Invalid authentication'));
        }

        socket.userId = session.user.id;
        socket.userName = session.user.name || 'Anonymous';
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private async verifySession(token: string) {
    // In a real implementation, you'd verify the JWT token or session
    // For now, return a mock session - replace with actual session verification
    try {
      // This is a simplified version - implement proper token verification
      return { user: { id: 'user1', name: 'User' } };
    } catch (error) {
      return null;
    }
  }

  private setupEventHandlers() {
    this.io?.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userName} connected:`, socket.id);

      // Room management
      socket.on('join-room', async (roomId: string) => {
        await this.handleJoinRoom(socket, roomId);
      });

      socket.on('leave-room', (roomId: string) => {
        this.handleLeaveRoom(socket, roomId);
      });

      // Chat events
      socket.on('send-message', async (data) => {
        await this.handleSendMessage(socket, data);
      });

      socket.on('typing-start', (roomId: string) => {
        this.handleTypingStart(socket, roomId);
      });

      socket.on('typing-stop', (roomId: string) => {
        this.handleTypingStop(socket, roomId);
      });

      // Whiteboard events
      socket.on('whiteboard-draw', (data) => {
        this.handleWhiteboardDraw(socket, data);
      });

      socket.on('whiteboard-clear', (roomId: string) => {
        this.handleWhiteboardClear(socket, roomId);
      });

      socket.on('whiteboard-save', async (data) => {
        await this.handleWhiteboardSave(socket, data);
      });

      // Document collaboration events
      socket.on('document-edit', (data) => {
        this.handleDocumentEdit(socket, data);
      });

      socket.on('document-cursor', (data) => {
        this.handleDocumentCursor(socket, data);
      });

      socket.on('document-save', async (data) => {
        await this.handleDocumentSave(socket, data);
      });

      // Presence events
      socket.on('cursor-move', (data) => {
        this.handleCursorMove(socket, data);
      });

      socket.on('user-status', (data) => {
        this.handleUserStatus(socket, data);
      });

      // File sharing events
      socket.on('file-share', async (data) => {
        await this.handleFileShare(socket, data);
      });

      // Notification events
      socket.on('notification-send', async (data) => {
        await this.handleNotificationSend(socket, data);
      });

      // Disconnect handling
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private async handleJoinRoom(socket: AuthenticatedSocket, roomId: string) {
    try {
      // Verify room access
      const room = await prisma.consultationRoom.findFirst({
        where: {
          id: roomId,
          OR: [
            { createdBy: socket.userId },
            { participants: { some: { userId: socket.userId } } }
          ]
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      if (!room) {
        socket.emit('error', { message: 'Room not found or access denied' });
        return;
      }

      socket.join(roomId);
      socket.roomId = roomId;

      // Initialize room data if not exists
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, {
          participants: new Set(),
          whiteboard: null,
          document: null,
          cursors: new Map()
        });
      }

      const roomData = this.rooms.get(roomId)!;
      roomData.participants.add(socket.id);

      // Update user presence
      await this.updateUserPresence(socket.userId!, roomId, true);

      // Notify room participants
      socket.to(roomId).emit('user-joined', {
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id
      });

      // Send room state to new participant
      socket.emit('room-joined', {
        roomId,
        participants: Array.from(roomData.participants),
        whiteboard: roomData.whiteboard,
        document: roomData.document
      });

      console.log(`User ${socket.userName} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  private handleLeaveRoom(socket: AuthenticatedSocket, roomId: string) {
    if (socket.roomId === roomId) {
      socket.leave(roomId);
      socket.roomId = undefined;

      const roomData = this.rooms.get(roomId);
      if (roomData) {
        roomData.participants.delete(socket.id);
        roomData.cursors.delete(socket.id);

        // Clean up empty rooms
        if (roomData.participants.size === 0) {
          this.rooms.delete(roomId);
        }
      }

      // Update user presence
      this.updateUserPresence(socket.userId!, null, false);

      // Notify remaining participants
      socket.to(roomId).emit('user-left', {
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id
      });

      console.log(`User ${socket.userName} left room ${roomId}`);
    }
  }

  private async handleSendMessage(socket: AuthenticatedSocket, data: any) {
    try {
      const { content, type = 'TEXT', roomId, replyToId } = data;

      if (!socket.roomId || socket.roomId !== roomId) {
        socket.emit('error', { message: 'Not in specified room' });
        return;
      }

      // Save message to database
      const message = await prisma.chatMessage.create({
        data: {
          content,
          type,
          roomId,
          senderId: socket.userId!,
          replyToId,
          reactions: {}
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true }
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              sender: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });

      // Broadcast to room
      this.io?.to(roomId).emit('new-message', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleTypingStart(socket: AuthenticatedSocket, roomId: string) {
    if (socket.roomId === roomId) {
      socket.to(roomId).emit('typing-start', {
        userId: socket.userId,
        userName: socket.userName
      });
    }
  }

  private handleTypingStop(socket: AuthenticatedSocket, roomId: string) {
    if (socket.roomId === roomId) {
      socket.to(roomId).emit('typing-stop', {
        userId: socket.userId,
        userName: socket.userName
      });
    }
  }

  private handleWhiteboardDraw(socket: AuthenticatedSocket, data: any) {
    const { roomId, drawingData } = data;
    if (socket.roomId === roomId) {
      const roomData = this.rooms.get(roomId);
      if (roomData) {
        roomData.whiteboard = drawingData;
      }
      
      socket.to(roomId).emit('whiteboard-draw', {
        drawingData,
        userId: socket.userId,
        userName: socket.userName
      });
    }
  }

  private handleWhiteboardClear(socket: AuthenticatedSocket, roomId: string) {
    if (socket.roomId === roomId) {
      const roomData = this.rooms.get(roomId);
      if (roomData) {
        roomData.whiteboard = null;
      }
      
      socket.to(roomId).emit('whiteboard-clear', {
        userId: socket.userId,
        userName: socket.userName
      });
    }
  }

  private async handleWhiteboardSave(socket: AuthenticatedSocket, data: any) {
    try {
      const { roomId, canvasData } = data;
      
      if (socket.roomId !== roomId) {
        socket.emit('error', { message: 'Not in specified room' });
        return;
      }

      // Save whiteboard to database
      await prisma.consultationWhiteboard.upsert({
        where: {
          roomId_createdBy: {
            roomId,
            createdBy: socket.userId!
          }
        },
        create: {
          name: `Whiteboard - ${new Date().toLocaleString()}`,
          data: canvasData,
          roomId,
          createdBy: socket.userId!
        },
        update: {
          data: canvasData,
          updatedAt: new Date()
        }
      });

      socket.emit('whiteboard-saved');
    } catch (error) {
      console.error('Error saving whiteboard:', error);
      socket.emit('error', { message: 'Failed to save whiteboard' });
    }
  }

  private handleDocumentEdit(socket: AuthenticatedSocket, data: any) {
    const { roomId, documentId, operation } = data;
    if (socket.roomId === roomId) {
      socket.to(roomId).emit('document-edit', {
        documentId,
        operation,
        userId: socket.userId,
        userName: socket.userName
      });
    }
  }

  private handleDocumentCursor(socket: AuthenticatedSocket, data: any) {
    const { roomId, documentId, cursor } = data;
    if (socket.roomId === roomId) {
      socket.to(roomId).emit('document-cursor', {
        documentId,
        cursor,
        userId: socket.userId,
        userName: socket.userName
      });
    }
  }

  private async handleDocumentSave(socket: AuthenticatedSocket, data: any) {
    try {
      const { roomId, documentId, content } = data;
      
      if (socket.roomId !== roomId) {
        socket.emit('error', { message: 'Not in specified room' });
        return;
      }

      // Save document version
      await prisma.documentVersion.create({
        data: {
          documentId,
          content,
          version: 1, // Increment version logic needed
          createdBy: socket.userId!
        }
      });

      // Update main document
      await prisma.document.update({
        where: { id: documentId },
        data: {
          content,
          version: { increment: 1 },
          updatedAt: new Date()
        }
      });

      socket.emit('document-saved');
    } catch (error) {
      console.error('Error saving document:', error);
      socket.emit('error', { message: 'Failed to save document' });
    }
  }

  private handleCursorMove(socket: AuthenticatedSocket, data: any) {
    const { roomId, x, y } = data;
    if (socket.roomId === roomId) {
      const roomData = this.rooms.get(roomId);
      if (roomData) {
        roomData.cursors.set(socket.id, { x, y, userId: socket.userId, userName: socket.userName });
      }
      
      socket.to(roomId).emit('cursor-move', {
        userId: socket.userId,
        userName: socket.userName,
        x, y
      });
    }
  }

  private handleUserStatus(socket: AuthenticatedSocket, data: any) {
    const { roomId, status } = data;
    if (socket.roomId === roomId) {
      socket.to(roomId).emit('user-status', {
        userId: socket.userId,
        userName: socket.userName,
        status
      });
    }
  }

  private async handleFileShare(socket: AuthenticatedSocket, data: any) {
    try {
      const { roomId, fileInfo } = data;
      
      if (socket.roomId !== roomId) {
        socket.emit('error', { message: 'Not in specified room' });
        return;
      }

      // Broadcast file share to room
      socket.to(roomId).emit('file-share', {
        fileInfo,
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });

      // Send message about file share
      await this.handleSendMessage(socket, {
        content: `Shared file: ${fileInfo.name}`,
        type: 'FILE',
        roomId
      });
    } catch (error) {
      console.error('Error sharing file:', error);
      socket.emit('error', { message: 'Failed to share file' });
    }
  }

  private async handleNotificationSend(socket: AuthenticatedSocket, data: any) {
    try {
      const { userId, title, content, type = 'SYSTEM' } = data;

      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          title,
          content,
          type,
          userId
        }
      });

      // Find user's socket if online
      const userSockets = await this.io?.in(`user:${userId}`).fetchSockets();
      if (userSockets && userSockets.length > 0) {
        this.io?.to(`user:${userId}`).emit('notification', notification);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  private handleDisconnect(socket: AuthenticatedSocket) {
    console.log(`User ${socket.userName} disconnected:`, socket.id);
    
    if (socket.roomId) {
      this.handleLeaveRoom(socket, socket.roomId);
    }

    // Update user presence
    if (socket.userId) {
      this.updateUserPresence(socket.userId, null, false);
    }
  }

  private async updateUserPresence(userId: string, roomId: string | null, isOnline: boolean) {
    try {
      await prisma.userPresence.upsert({
        where: { userId },
        create: {
          userId,
          isOnline,
          roomId,
          lastSeen: new Date()
        },
        update: {
          isOnline,
          roomId,
          lastSeen: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating user presence:', error);
    }
  }

  // Public methods for external use
  public emitToRoom(roomId: string, event: string, data: any) {
    this.io?.to(roomId).emit(event, data);
  }

  public emitToUser(userId: string, event: string, data: any) {
    this.io?.to(`user:${userId}`).emit(event, data);
  }

  public getRoomParticipants(roomId: string): string[] {
    const roomData = this.rooms.get(roomId);
    return roomData ? Array.from(roomData.participants) : [];
  }

  public isUserInRoom(userId: string, roomId: string): boolean {
    // This is simplified - you'd need to track user-socket mapping
    const roomData = this.rooms.get(roomId);
    return roomData ? roomData.participants.size > 0 : false;
  }
}

export const socketService = new SocketService();