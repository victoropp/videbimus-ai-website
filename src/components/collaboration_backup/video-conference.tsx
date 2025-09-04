'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  Phone,
  PhoneOff,
  Settings,
  Users,
  Circle,
  Square,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoConferenceProps {
  roomUrl?: string;
  roomId?: string;
  token?: string;
  userName?: string;
  onLeave?: () => void;
  className?: string;
}

export default function VideoConference({
  roomUrl,
  roomId,
  token,
  userName = 'Guest',
  onLeave,
  className = ''
}: VideoConferenceProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState<string>('');
  const [useExternalWindow, setUseExternalWindow] = useState(false);

  useEffect(() => {
    // Generate Jitsi meeting URL
    const jitsiRoomId = roomId || roomUrl || `consultation-${Date.now()}`;
    const cleanRoomId = jitsiRoomId.replace(/[^a-zA-Z0-9-_]/g, '-');
    
    // Use Jitsi Meet (free, no API key required)
    const jitsiUrl = `https://meet.jit.si/${cleanRoomId}#userInfo.displayName="${encodeURIComponent(userName)}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;
    
    setMeetingUrl(jitsiUrl);
  }, [roomId, roomUrl, userName]);

  const handleJoinRoom = () => {
    if (useExternalWindow) {
      // Open in new window/tab
      window.open(meetingUrl, '_blank', 'noopener,noreferrer');
      toast({
        title: 'Meeting Opened',
        description: 'Video conference opened in a new window',
      });
    } else {
      // Use embedded iframe
      setIsLoading(true);
      setIsConnected(true);
      
      // Simulate loading time
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: 'Connected',
          description: 'You have joined the video conference',
        });
      }, 2000);
    }
  };

  const handleLeaveRoom = () => {
    setIsConnected(false);
    setIsLoading(false);
    
    if (onLeave) {
      onLeave();
    }
    
    toast({
      title: 'Disconnected',
      description: 'You have left the video conference',
    });
  };

  const handleOpenExternal = () => {
    window.open(meetingUrl, '_blank', 'noopener,noreferrer');
    toast({
      title: 'Meeting Opened',
      description: 'Video conference opened in a new window',
    });
  };

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Video Conference</CardTitle>
              <Badge variant="outline" className="text-xs">
                Powered by Jitsi Meet
              </Badge>
            </div>
            {isConnected && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleOpenExternal}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Window
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <Video className="w-12 h-12 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Ready to Join?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join the video conference using Jitsi Meet
              </p>
              
              <div className="flex flex-col gap-3 items-center">
                <Button 
                  onClick={handleJoinRoom}
                  className="min-w-48"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Meeting (Embedded)
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    setUseExternalWindow(true);
                    handleJoinRoom();
                  }}
                  className="min-w-48"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Window
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                <p>📹 Free video conferencing with no time limits</p>
                <p>🔒 End-to-end encrypted for security</p>
                <p>👥 Support for up to 100 participants</p>
              </div>
            </div>
          ) : (
            <div>
              {isLoading && (
                <div className="bg-gray-900 rounded-lg h-[500px] flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading video conference...</p>
                  </div>
                </div>
              )}
              
              {!isLoading && (
                <>
                  {/* Jitsi Meet Iframe */}
                  <iframe
                    ref={iframeRef}
                    src={meetingUrl}
                    className="w-full h-[500px] rounded-lg border-0"
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    allowFullScreen
                    title="Jitsi Meet Video Conference"
                  />
                  
                  {/* Leave Meeting Button */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p>💡 Tip: Use the controls within the video window</p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleLeaveRoom}
                    >
                      <PhoneOff className="w-4 h-4 mr-2" />
                      Leave Meeting
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}