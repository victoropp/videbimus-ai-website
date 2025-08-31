'use client';

import { io, Socket } from 'socket.io-client';

interface SocketEvents {
  // Room events
  'room-joined': (data: any) => void;
  'user-joined': (data: any) => void;
  'user-left': (data: any) => void;
  
  // Chat events
  'new-message': (data: any) => void;
  'typing-start': (data: any) => void;
  'typing-stop': (data: any) => void;
  
  // Whiteboard events
  'whiteboard-draw': (data: any) => void;
  'whiteboard-clear': (data: any) => void;
  'whiteboard-saved': () => void;
  
  // Document events
  'document-edit': (data: any) => void;
  'document-cursor': (data: any) => void;
  'document-saved': () => void;
  
  // Presence events
  'cursor-move': (data: any) => void;
  'user-status': (data: any) => void;
  
  // File sharing events
  'file-share': (data: any) => void;
  
  // Notification events
  'notification': (data: any) => void;
  
  // Error events
  'error': (data: any) => void;
}

class ClientSocketService {
  private socket: Socket | null = null;
  private currentRoomId: string | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  async connect(token: string): Promise<boolean> {
    if (this.socket?.connected) {
      return true;
    }

    try {
      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true
      });

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Failed to create socket'));
          return;
        }

        this.socket.on('connect', () => {
          console.log('Connected to socket server');
          this.setupEventHandlers();
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from socket server:', reason);
          this.currentRoomId = null;
        });
      });
    } catch (error) {
      console.error('Error connecting to socket:', error);
      return false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentRoomId = null;
      this.eventListeners.clear();
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Forward all events to registered listeners
    const eventNames: (keyof SocketEvents)[] = [
      'room-joined', 'user-joined', 'user-left',
      'new-message', 'typing-start', 'typing-stop',
      'whiteboard-draw', 'whiteboard-clear', 'whiteboard-saved',
      'document-edit', 'document-cursor', 'document-saved',
      'cursor-move', 'user-status',
      'file-share', 'notification', 'error'
    ];

    eventNames.forEach(eventName => {
      this.socket?.on(eventName, (data: any) => {
        this.emit(eventName, data);
      });
    });
  }

  // Event management
  on<T extends keyof SocketEvents>(eventName: T, callback: SocketEvents[T]) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)?.push(callback);
  }

  off<T extends keyof SocketEvents>(eventName: T, callback: SocketEvents[T]) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit<T extends keyof SocketEvents>(eventName: T, data: any) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Room management
  async joinRoom(roomId: string): Promise<boolean> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not available'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Join room timeout'));
      }, 10000);

      this.socket.once('room-joined', () => {
        clearTimeout(timeout);
        this.currentRoomId = roomId;
        resolve(true);
      });

      this.socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(error.message || 'Failed to join room'));
      });

      this.socket.emit('join-room', roomId);
    });
  }

  leaveRoom() {
    if (this.socket?.connected && this.currentRoomId) {
      this.socket.emit('leave-room', this.currentRoomId);
      this.currentRoomId = null;
    }
  }

  getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }

  // Chat methods
  sendMessage(content: string, type: string = 'TEXT', replyToId?: string) {
    if (!this.socket?.connected || !this.currentRoomId) {
      throw new Error('Not connected to room');
    }

    this.socket.emit('send-message', {
      content,
      type,
      roomId: this.currentRoomId,
      replyToId
    });
  }

  startTyping() {
    if (this.socket?.connected && this.currentRoomId) {
      this.socket.emit('typing-start', this.currentRoomId);
    }
  }

  stopTyping() {
    if (this.socket?.connected && this.currentRoomId) {
      this.socket.emit('typing-stop', this.currentRoomId);
    }
  }

  // Whiteboard methods
  drawOnWhiteboard(drawingData: any) {
    if (this.socket?.connected && this.currentRoomId) {
      this.socket.emit('whiteboard-draw', {
        roomId: this.currentRoomId,
        drawingData
      });
    }
  }

  clearWhiteboard() {
    if (this.socket?.connected && this.currentRoomId) {
      this.socket.emit('whiteboard-clear', this.currentRoomId);
    }
  }

  saveWhiteboard(canvasData: any) {
    if (!this.socket?.connected || !this.currentRoomId) {
      throw new Error('Not connected to room');
    }

    return new Promise<void>((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not available'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Save timeout'));
      }, 10000);

      this.socket.once('whiteboard-saved', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(error.message || 'Failed to save whiteboard'));
      });

      this.socket.emit('whiteboard-save', {
        roomId: this.currentRoomId,
        canvasData
      });
    });
  }

  // Document collaboration methods
  editDocument(documentId: string, operation: any) {
    if (this.socket?.connected && this.currentRoomId) {
      this.socket.emit('document-edit', {
        roomId: this.currentRoomId,
        documentId,
        operation
      });
    }
  }

  updateDocumentCursor(documentId: string, cursor: any) {
    if (this.socket?.connected && this.currentRoomId) {
      this.socket.emit('document-cursor', {
        roomId: this.currentRoomId,
        documentId,
        cursor
      });
    }
  }

  saveDocument(documentId: string, content: string) {
    if (!this.socket?.connected || !this.currentRoomId) {
      throw new Error('Not connected to room');
    }

    return new Promise<void>((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not available'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Save timeout'));
      }, 10000);

      this.socket.once('document-saved', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(error.message || 'Failed to save document'));
      });

      this.socket.emit('document-save', {
        roomId: this.currentRoomId,
        documentId,
        content
      });
    });
  }

  // Presence methods
  moveCursor(x: number, y: number) {
    if (this.socket?.connected && this.currentRoomId) {
      this.socket.emit('cursor-move', {
        roomId: this.currentRoomId,
        x,
        y
      });
    }
  }

  updateUserStatus(status: string) {
    if (this.socket?.connected && this.currentRoomId) {
      this.socket.emit('user-status', {
        roomId: this.currentRoomId,
        status
      });
    }
  }

  // File sharing methods
  shareFile(fileInfo: any) {
    if (this.socket?.connected && this.currentRoomId) {
      this.socket.emit('file-share', {
        roomId: this.currentRoomId,
        fileInfo
      });
    }
  }

  // Notification methods
  sendNotification(userId: string, title: string, content: string, type: string = 'SYSTEM') {
    if (this.socket?.connected) {
      this.socket.emit('notification-send', {
        userId,
        title,
        content,
        type
      });
    }
  }

  // Utility methods
  getConnectionState(): 'disconnected' | 'connecting' | 'connected' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connecting) return 'connecting';
    if (this.socket.connected) return 'connected';
    return 'disconnected';
  }

  // Typing indicator helpers
  private typingTimer: NodeJS.Timeout | null = null;

  handleTypingStart() {
    this.startTyping();
    
    // Clear existing timer
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    
    // Set timer to stop typing after 3 seconds of inactivity
    this.typingTimer = setTimeout(() => {
      this.stopTyping();
    }, 3000);
  }

  handleTypingStop() {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
    this.stopTyping();
  }
}

// Singleton instance
export const socketClient = new ClientSocketService();

// React hook for using socket in components
export function useSocket() {
  return socketClient;
}

// Types for external use
export type { SocketEvents };
export { ClientSocketService };