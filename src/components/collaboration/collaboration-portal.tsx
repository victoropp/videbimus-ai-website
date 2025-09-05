'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Video,
  MessageCircle,
  FileText,
  PenTool,
  Share2,
  Users,
  Calendar,
  Settings,
  Monitor,
  Maximize2,
  Minimize2,
  Bell,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import RealTimeChat from './real-time-chat';
import Whiteboard from './whiteboard';
import DocumentEditor from './document-editor';
import VideoConference from './video-conference';
import FileSharing from './file-sharing';
import NotificationCenter from './notification-center';

interface CollaborationPortalProps {
  roomId: string;
  userId: string;
  userName: string;
  userEmail: string;
  roomData?: {
    name: string;
    description?: string;
    type: string;
    dailyRoomUrl?: string;
    participants: Array<{
      id: string;
      name: string;
      email: string;
      isOnline: boolean;
      role: string;
    }>;
  };
  documents?: Array<{
    id: string;
    title: string;
    language: string;
    content: string;
  }>;
  token?: string;
  className?: string;
}

export default function CollaborationPortal({
  roomId,
  userId,
  userName,
  userEmail,
  roomData,
  documents = [],
  token,
  className = ''
}: CollaborationPortalProps) {
  const [activeTab, setActiveTab] = useState('chat');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [activeDocument, setActiveDocument] = useState(documents[0]?.id || '');
  const [presenceData, setPresenceData] = useState({
    onlineUsers: roomData?.participants?.filter(p => p.isOnline) || [],
    totalParticipants: roomData?.participants?.length || 0
  });

  useEffect(() => {
    // Simulate connection status updates
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Analytics: track tab usage
    if (typeof window !== 'undefined') {
      // Track tab usage for analytics
      console.log(`Switched to ${value} tab`);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handlePresenceUpdate = (presence: any) => {
    setPresenceData(presence);
  };

  const containerClasses = isFullscreen 
    ? 'fixed inset-0 z-50 bg-background' 
    : className;

  if (!roomData) {
    return (
      <Card className={containerClasses}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium">Loading collaboration room...</div>
            <div className="text-sm text-muted-foreground mt-2">
              Setting up your collaborative workspace
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={containerClasses}>
      <Card className="h-full flex flex-col">
        {/* Header */}
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <CardTitle className="text-xl">{roomData.name}</CardTitle>
                {roomData.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {roomData.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
                  className="flex items-center gap-1"
                >
                  {connectionStatus === 'connected' ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  {connectionStatus}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {presenceData.onlineUsers.length} / {presenceData.totalParticipants} online
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationCenter userId={userId} token={token} />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Main Content */}
        <CardContent className="flex-1 p-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
            {/* Tab Navigation */}
            <TabsList className="grid grid-cols-6 w-full mx-4 mt-4">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Video</span>
              </TabsTrigger>
              <TabsTrigger value="whiteboard" className="flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                <span className="hidden sm:inline">Whiteboard</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Files</span>
              </TabsTrigger>
              <TabsTrigger value="participants" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">People</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="chat" className="h-full m-0 p-4">
                <RealTimeChat
                  roomId={roomId}
                  currentUser={{
                    id: userId,
                    name: userName,
                    email: userEmail,
                    isOnline: true
                  }}
                  token={token}
                  className="h-full"
                />
              </TabsContent>

              <TabsContent value="video" className="h-full m-0 p-4">
                <VideoConference
                  roomUrl={roomData.dailyRoomUrl || ''}
                  userName={userName}
                  token={token}
                  className="h-full"
                />
              </TabsContent>

              <TabsContent value="whiteboard" className="h-full m-0 p-4">
                <Whiteboard
                  roomId={roomId}
                  userId={userId}
                  userName={userName}
                  token={token}
                  className="h-full"
                />
              </TabsContent>

              <TabsContent value="documents" className="h-full m-0 p-4">
                {documents.length > 0 ? (
                  <div className="h-full flex gap-4">
                    {/* Document List */}
                    {documents.length > 1 && (
                      <Card className="w-64 shrink-0">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-32">
                            <div className="space-y-2">
                              {documents.map((doc) => (
                                <Button
                                  key={doc.id}
                                  variant={activeDocument === doc.id ? 'secondary' : 'ghost'}
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => setActiveDocument(doc.id)}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  {doc.title}
                                </Button>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Active Document */}
                    <div className="flex-1">
                      {documents.find(doc => doc.id === activeDocument) && (
                        <DocumentEditor
                          roomId={roomId}
                          documentId={activeDocument}
                          userId={userId}
                          userName={userName}
                          initialContent={documents.find(doc => doc.id === activeDocument)?.content}
                          language={documents.find(doc => doc.id === activeDocument)?.language}
                          token={token}
                          className="h-full"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Documents Available</h3>
                      <p className="text-sm text-muted-foreground">
                        Create or upload documents to start collaborating
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="files" className="h-full m-0 p-4">
                <FileSharing
                  roomId={roomId}
                  userId={userId}
                  userName={userName}
                  token={token}
                  className="h-full"
                />
              </TabsContent>

              <TabsContent value="participants" className="h-full m-0 p-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Participants ({presenceData.totalParticipants})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {roomData.participants.map((participant) => (
                          <div key={participant.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                              <div>
                                <div className="font-medium">
                                  {participant.name}
                                  {participant.id === userId && ' (You)'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {participant.email}
                                </div>
                              </div>
                            </div>
                            <Badge variant={participant.role === 'HOST' ? 'default' : 'secondary'}>
                              {participant.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}