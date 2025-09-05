'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Circle, 
  Keyboard, 
  MousePointer, 
  Eye, 
  Coffee,
  Clock
} from 'lucide-react';
import { useSocket } from '@/lib/socket-client';
import { format } from 'date-fns';

interface UserPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  isOnline: boolean;
  status?: string;
  activity?: string;
  lastSeen: Date;
  roomId?: string;
  cursor?: {
    x: number;
    y: number;
  };
  isTyping?: boolean;
}

interface PresenceIndicatorProps {
  roomId: string;
  currentUserId: string;
  token?: string;
  showCursors?: boolean;
  showTypingIndicators?: boolean;
  maxVisibleUsers?: number;
  className?: string;
}

export default function PresenceIndicator({
  roomId,
  currentUserId,
  token,
  showCursors = true,
  showTypingIndicators = true,
  maxVisibleUsers = 5,
  className = ''
}: PresenceIndicatorProps) {
  const [presenceData, setPresenceData] = useState<{ [userId: string]: UserPresence }>({});
  const [isConnected, setIsConnected] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (token) {
      initializePresence();
    }
    
    return () => {
      socket.disconnect();
    };
  }, [roomId, token]);

  const initializePresence = useCallback(async () => {
    try {
      if (!socket.isConnected() && token) {
        await socket.connect(token);
      }
      
      setupPresenceListeners();
      await socket.joinRoom(roomId);
      setIsConnected(true);
      
      // Load initial presence data
      await loadPresenceData();
      
    } catch (error) {
      console.error('Failed to initialize presence:', error);
      setIsConnected(false);
    }
  }, [roomId, token]);

  const setupPresenceListeners = useCallback(() => {
    // User joined/left events
    socket.on('user-joined', ({ userId, userName }) => {
      setPresenceData(prev => ({
        ...prev,
        [userId]: {
          userId,
          userName,
          isOnline: true,
          lastSeen: new Date(),
          roomId
        }
      }));
    });

    socket.on('user-left', ({ userId }) => {
      setPresenceData(prev => {
        const updated = { ...prev };
        if (updated[userId]) {
          updated[userId] = {
            ...updated[userId],
            isOnline: false,
            lastSeen: new Date()
          };
        }
        return updated;
      });
    });

    // Cursor movement
    socket.on('cursor-move', ({ userId, userName, x, y }) => {
      if (showCursors && userId !== currentUserId) {
        setPresenceData(prev => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            userId,
            userName,
            cursor: { x, y },
            isOnline: true,
            lastSeen: new Date()
          }
        }));
      }
    });

    // Typing indicators
    socket.on('typing-start', ({ userId, userName }) => {
      if (showTypingIndicators && userId !== currentUserId) {
        setPresenceData(prev => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            userId,
            userName,
            isTyping: true,
            isOnline: true,
            lastSeen: new Date()
          }
        }));
      }
    });

    socket.on('typing-stop', ({ userId }) => {
      if (showTypingIndicators && userId !== currentUserId) {
        setPresenceData(prev => ({
          ...prev,
          [userId]: prev[userId] ? {
            ...prev[userId],
            isTyping: false
          } : prev[userId]
        }));
      }
    });

    // Status updates
    socket.on('user-status', ({ userId, userName, status }) => {
      setPresenceData(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          userId,
          userName,
          status,
          isOnline: true,
          lastSeen: new Date()
        }
      }));
    });
  }, [roomId, currentUserId, showCursors, showTypingIndicators]);

  const loadPresenceData = async () => {
    try {
      const response = await fetch(`/api/collaboration/presence?roomId=${roomId}`);
      if (response.ok) {
        const data = await response.json();
        const transformedData: { [userId: string]: UserPresence } = {};
        
        data.presence.forEach((user: any) => {
          transformedData[user.userId] = {
            userId: user.userId,
            userName: user.user.name || user.user.email,
            userAvatar: user.user.image,
            isOnline: user.isOnline,
            status: user.status,
            activity: user.activity,
            lastSeen: new Date(user.lastSeen),
            roomId: user.roomId
          };
        });
        
        setPresenceData(transformedData);
      }
    } catch (error) {
      console.error('Failed to load presence data:', error);
    }
  };

  const getStatusColor = (isOnline: boolean, status?: string) => {
    if (!isOnline) return 'bg-gray-400';
    
    switch (status) {
      case 'busy':
        return 'bg-red-500';
      case 'away':
        return 'bg-yellow-500';
      case 'do-not-disturb':
        return 'bg-red-600';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusIcon = (status?: string, isTyping?: boolean) => {
    if (isTyping) return <Keyboard className="w-3 h-3" />;
    
    switch (status) {
      case 'busy':
        return <Coffee className="w-3 h-3" />;
      case 'away':
        return <Clock className="w-3 h-3" />;
      case 'viewing':
        return <Eye className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return format(date, 'MMM dd');
  };

  const onlineUsers = Object.values(presenceData).filter(user => user.isOnline);
  const visibleUsers = onlineUsers.slice(0, maxVisibleUsers);
  const remainingCount = Math.max(0, onlineUsers.length - maxVisibleUsers);

  // Cursor components for real-time cursor tracking
  const CursorIndicators = () => {
    if (!showCursors) return null;
    
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {Object.values(presenceData).map((user) => {
          if (user.userId === currentUserId || !user.cursor || !user.isOnline) return null;
          
          return (
            <div
              key={user.userId}
              className="absolute transition-all duration-100 ease-out"
              style={{
                left: user.cursor.x,
                top: user.cursor.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="flex items-center gap-1">
                <MousePointer className="w-4 h-4 text-blue-500" />
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {user.userName}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Connection status */}
        <Badge 
          variant={isConnected ? 'secondary' : 'destructive'}
          className="flex items-center gap-1 text-xs"
        >
          <Circle className={`w-2 h-2 ${isConnected ? 'fill-current' : ''}`} />
          {isConnected ? 'Live' : 'Offline'}
        </Badge>

        {/* Online users avatars */}
        <div className="flex items-center -space-x-2">
          {visibleUsers.map((user) => (
            <Tooltip key={user.userId}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="w-8 h-8 border-2 border-background">
                    <AvatarImage src={user.userAvatar} alt={user.userName} />
                    <AvatarFallback className="text-xs">
                      {user.userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Status indicator */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.isOnline, user.status)}`}>
                    {getStatusIcon(user.status, user.isTyping) && (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        {getStatusIcon(user.status, user.isTyping)}
                      </div>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="text-center">
                  <div className="font-medium">{user.userName}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.isOnline ? (
                      <>
                        {user.isTyping && 'Typing...'}
                        {user.status && !user.isTyping && user.status}
                        {!user.status && !user.isTyping && 'Online'}
                      </>
                    ) : (
                      `Last seen ${formatLastSeen(user.lastSeen)}`
                    )}
                  </div>
                  {user.activity && (
                    <div className="text-xs text-muted-foreground">
                      {user.activity}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {/* Remaining users count */}
          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{remainingCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div>
                  {remainingCount} more user{remainingCount > 1 ? 's' : ''} online
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Typing indicators */}
        {showTypingIndicators && (
          <div className="flex items-center gap-1">
            {Object.values(presenceData).filter(user => user.isTyping && user.userId !== currentUserId).map((user) => (
              <Badge key={user.userId} variant="outline" className="text-xs animate-pulse">
                <Keyboard className="w-3 h-3 mr-1" />
                {user.userName} typing...
              </Badge>
            ))}
          </div>
        )}

        {/* Cursor indicators */}
        <CursorIndicators />
      </div>
    </TooltipProvider>
  );
}