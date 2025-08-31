'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Send,
  Paperclip,
  Smile,
  Users,
  Circle,
  Reply,
  MoreHorizontal,
  Image as ImageIcon,
  File,
  Code,
  Wifi,
  WifiOff
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useSocket } from '@/lib/socket-client';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'code' | 'system';
  senderId: string;
  senderName: string;
  roomId: string;
  replyToId?: string;
  isEdited: boolean;
  reactions?: { [emoji: string]: string[] }; // emoji -> user IDs
  attachments?: {
    id: string;
    filename: string;
    url: string;
    type: string;
    size: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface RealTimeChatProps {
  roomId: string;
  currentUser: User;
  initialMessages?: Message[];
  onFileUpload?: (file: File) => Promise<string>;
  className?: string;
  token?: string;
}

const commonEmojis = ['👍', '👎', '❤️', '😊', '😂', '😮', '😢', '🎉'];

export default function RealTimeChat({
  roomId,
  currentUser,
  initialMessages = [],
  onFileUpload,
  className = '',
  token
}: RealTimeChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showEmojis, setShowEmojis] = useState<string | null>(null);
  const [showUsersList, setShowUsersList] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socket = useSocket();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeSocket();
    return () => {
      socket.disconnect();
    };
  }, [roomId, token]);

  const initializeSocket = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      
      // Connect to socket if not already connected
      if (!socket.isConnected() && token) {
        await socket.connect(token);
      }
      
      // Set up event listeners
      setupSocketListeners();
      
      // Join room
      await socket.joinRoom(roomId);
      setConnectionStatus('connected');
      
      // Load initial messages
      await loadMessages();
      
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setConnectionStatus('disconnected');
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to chat server',
        variant: 'destructive',
      });
    }
  }, [roomId, token]);

  const setupSocketListeners = useCallback(() => {
    // New message handler
    socket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, {
        ...message,
        createdAt: new Date(message.createdAt),
        updatedAt: new Date(message.updatedAt)
      }]);
    });

    // Typing indicators
    socket.on('typing-start', ({ userId, userName }) => {
      if (userId !== currentUser.id) {
        setTypingUsers(prev => [...prev.filter(u => u !== userName), userName]);
      }
    });

    socket.on('typing-stop', ({ userId, userName }) => {
      if (userId !== currentUser.id) {
        setTypingUsers(prev => prev.filter(u => u !== userName));
      }
    });

    // User presence
    socket.on('user-joined', ({ userId, userName }) => {
      setOnlineUsers(prev => {
        const exists = prev.find(u => u.id === userId);
        if (!exists) {
          return [...prev, { id: userId, name: userName, email: '', isOnline: true }];
        }
        return prev.map(u => u.id === userId ? { ...u, isOnline: true } : u);
      });
      
      toast({
        title: 'User Joined',
        description: `${userName} joined the chat`,
      });
    });

    socket.on('user-left', ({ userId, userName }) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== userId));
      
      toast({
        title: 'User Left',
        description: `${userName} left the chat`,
      });
    });

    // Room joined
    socket.on('room-joined', ({ participants }) => {
      // Update online users based on participants
      console.log('Joined room with participants:', participants);
    });

    // Error handling
    socket.on('error', ({ message }) => {
      toast({
        title: 'Chat Error',
        description: message,
        variant: 'destructive',
      });
    });
  }, [currentUser.id]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/collaboration/chat?roomId=${roomId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
          updatedAt: new Date(msg.updatedAt)
        })));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || connectionStatus !== 'connected') return;

    try {
      socket.sendMessage(trimmedMessage, 'TEXT', replyTo?.id);
      setNewMessage('');
      setReplyTo(null);
      socket.handleTypingStop();
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Send Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (connectionStatus === 'connected') {
      if (e.target.value.trim()) {
        socket.handleTypingStart();
      } else {
        socket.handleTypingStop();
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onFileUpload) return;

    try {
      const url = await onFileUpload(file);
      const messageType = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
      
      socket.sendMessage(`Shared file: ${file.name}`, messageType);
      
      // Share file with other participants
      socket.shareFile({
        name: file.name,
        type: file.type,
        size: file.size,
        url
      });
      
      toast({
        title: 'File Uploaded',
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      // Send reaction to API
      const response = await fetch(`/api/collaboration/chat/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji, roomId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }
      
      // Update local message with reaction
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions } || {};
          const userIds = reactions[emoji] || [];
          
          if (userIds.includes(currentUser.id)) {
            // Remove reaction
            reactions[emoji] = userIds.filter(id => id !== currentUser.id);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          } else {
            // Add reaction
            reactions[emoji] = [...userIds, currentUser.id];
          }
          
          return { ...msg, reactions };
        }
        return msg;
      }));
      
    } catch (error) {
      console.error('Failed to add reaction:', error);
      toast({
        title: 'Reaction Error',
        description: 'Failed to add reaction',
        variant: 'destructive',
      });
    }
    
    setShowEmojis(null);
  };

  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'file':
        return <File className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'code':
        return <Code className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatMessageTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const MessageComponent = ({ message }: { message: Message }) => {
    const isCurrentUser = message.senderId === currentUser.id;
    const replyToMessage = message.replyToId 
      ? messages.find(m => m.id === message.replyToId)
      : null;

    return (
      <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="w-8 h-8">
          <AvatarFallback>
            {message.senderName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex-1 max-w-xs ${isCurrentUser ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium">{message.senderName}</span>
            <span className="text-xs text-muted-foreground">
              {formatMessageTime(message.createdAt)}
            </span>
            {message.isEdited && (
              <Badge variant="outline" className="text-xs px-1 py-0">edited</Badge>
            )}
          </div>

          {replyToMessage && (
            <div className="mb-2 p-2 bg-muted rounded text-xs border-l-2 border-blue-500">
              <div className="font-medium">{replyToMessage.senderName}</div>
              <div className="text-muted-foreground">{replyToMessage.content}</div>
            </div>
          )}

          <div
            className={`p-3 rounded-lg relative group ${
              isCurrentUser 
                ? 'bg-blue-500 text-white' 
                : 'bg-muted'
            }`}
          >
            <div className="flex items-start gap-2">
              {getMessageIcon(message.type)}
              <div className="flex-1">
                {message.type === 'code' ? (
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    <code>{message.content}</code>
                  </pre>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>

            {/* Message actions */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setReplyTo(message)}
                >
                  <Reply className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowEmojis(showEmojis === message.id ? null : message.id)}
                >
                  <Smile className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Emoji picker */}
            {showEmojis === message.id && (
              <div className="absolute top-8 right-0 bg-white border rounded-lg shadow-lg p-2 z-10">
                <div className="grid grid-cols-4 gap-1">
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      className="p-1 hover:bg-muted rounded"
                      onClick={() => handleReaction(message.id, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex gap-1 mt-1">
              {Object.entries(message.reactions).map(([emoji, userIds]) => (
                <button
                  key={emoji}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${
                    userIds.includes(currentUser.id)
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-muted border-muted'
                  }`}
                  onClick={() => handleReaction(message.id, emoji)}
                >
                  <span>{emoji}</span>
                  <span>{userIds.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      <Card className="flex flex-col h-96">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chat</CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
                className="cursor-pointer"
              >
                {connectionStatus === 'connected' ? 
                  <Wifi className="w-3 h-3 mr-1" /> : 
                  <WifiOff className="w-3 h-3 mr-1" />
                }
                {connectionStatus}
              </Badge>
              <Badge 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => setShowUsersList(!showUsersList)}
              >
                <Users className="w-3 h-3 mr-1" />
                {onlineUsers.length + 1} online
              </Badge>
            </div>
          </div>
          
          {/* Online users list */}
          {showUsersList && (
            <div className="mt-2 p-2 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-2">Online Users</div>
              <div className="space-y-1">
                {onlineUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-2 text-sm">
                    <Circle 
                      className={`w-2 h-2 fill-current ${
                        user.isOnline ? 'text-green-500' : 'text-gray-400'
                      }`} 
                    />
                    <span>{user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {messages.map(message => (
                <MessageComponent key={message.id} message={message} />
              ))}
              
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>
                    {typingUsers.length === 1
                      ? `${typingUsers[0]} is typing...`
                      : `${typingUsers.length} people are typing...`
                    }
                  </span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator />

          {/* Reply indicator */}
          {replyTo && (
            <div className="px-4 py-2 bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">Replying to </span>
                  <span className="font-medium">{replyTo.senderName}</span>
                  <div className="text-xs text-muted-foreground truncate max-w-48">
                    {replyTo.content}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          {/* Message input */}
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={connectionStatus === 'connected' ? "Type a message..." : "Connecting..."}
                  disabled={connectionStatus !== 'connected'}
                />
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || connectionStatus !== 'connected'}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt,.json,.js,.ts,.py"
          />
        </CardContent>
      </Card>
    </div>
  );
}