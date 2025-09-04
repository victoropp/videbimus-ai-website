'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  BellRing,
  Check,
  X,
  Mail,
  MessageCircle,
  Users,
  Calendar,
  FileText,
  Settings,
  Trash2,
  MoreHorizontal,
  Filter,
  MailOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useSocket } from '@/lib/socket-client';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'MEETING_INVITE' | 'MEETING_STARTED' | 'MEETING_ENDED' | 'DOCUMENT_SHARED' | 'MENTION' | 'SYSTEM' | 'PROJECT_UPDATE';
  isRead: boolean;
  data?: any;
  createdAt: Date;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationCenterProps {
  userId: string;
  className?: string;
  token?: string;
}

export default function NotificationCenter({
  userId,
  className = '',
  token
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all');
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    loadNotifications();
    if (token) {
      initializeSocket();
    }
    
    return () => {
      socket.disconnect();
    };
  }, [userId, token]);

  const initializeSocket = useCallback(async () => {
    try {
      if (!socket.isConnected() && token) {
        await socket.connect(token);
      }
      
      setupSocketListeners();
      
    } catch (error) {
      console.error('Failed to initialize socket for notifications:', error);
    }
  }, [token]);

  const setupSocketListeners = useCallback(() => {
    socket.on('notification', (notification: Notification) => {
      const transformedNotification = {
        ...notification,
        createdAt: new Date(notification.createdAt)
      };
      
      setNotifications(prev => [transformedNotification, ...prev]);
      
      // Show toast for new notification
      toast({
        title: notification.title,
        description: notification.content,
        action: notification.actionUrl ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(notification.actionUrl, '_blank')}
          >
            {notification.actionText || 'View'}
          </Button>
        ) : undefined,
      });
    });
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?userId=${userId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications.map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt)
        })));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/unread`, {
        method: 'POST'
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: false }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as unread',
        variant: 'destructive',
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        toast({
          title: 'Notification Deleted',
          description: 'Notification has been removed',
        });
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        toast({
          title: 'All Marked as Read',
          description: 'All notifications have been marked as read',
        });
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'MEETING_INVITE':
      case 'MEETING_STARTED':
      case 'MEETING_ENDED':
        return <Calendar className="w-4 h-4" />;
      case 'DOCUMENT_SHARED':
        return <FileText className="w-4 h-4" />;
      case 'MENTION':
        return <MessageCircle className="w-4 h-4" />;
      case 'PROJECT_UPDATE':
        return <Users className="w-4 h-4" />;
      case 'SYSTEM':
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'MEETING_INVITE':
        return 'text-blue-600';
      case 'MEETING_STARTED':
        return 'text-green-600';
      case 'MEETING_ENDED':
        return 'text-gray-600';
      case 'DOCUMENT_SHARED':
        return 'text-purple-600';
      case 'MENTION':
        return 'text-orange-600';
      case 'PROJECT_UPDATE':
        return 'text-indigo-600';
      case 'SYSTEM':
      default:
        return 'text-gray-600';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.isRead;
      case 'mentions':
        return notif.type === 'MENTION';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE HH:mm');
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            variant="destructive"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute top-10 right-0 w-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 mt-2">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === 'mentions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('mentions')}
              >
                Mentions
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-sm text-muted-foreground">Loading notifications...</div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Bell className="w-12 h-12 text-muted-foreground opacity-50 mb-2" />
                  <div className="text-sm text-muted-foreground text-center">
                    {filter === 'all' 
                      ? "No notifications yet" 
                      : filter === 'unread' 
                        ? "No unread notifications"
                        : "No mentions"
                    }
                  </div>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                        !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-l-blue-500' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium truncate">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {notification.content}
                          </p>
                          
                          {notification.actionUrl && (
                            <Badge variant="secondary" className="text-xs">
                              {notification.actionText || 'View'}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.isRead ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsUnread(notification.id);
                              }}
                            >
                              <MailOpen className="w-3 h-3" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}