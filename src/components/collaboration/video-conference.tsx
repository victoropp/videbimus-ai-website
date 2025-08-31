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
  Square
} from 'lucide-react';
import { dailyService, type ParticipantData } from '@/lib/daily';
import { toast } from '@/hooks/use-toast';

interface VideoConferenceProps {
  roomUrl: string;
  token?: string;
  userName?: string;
  onLeave?: () => void;
  className?: string;
}

export default function VideoConference({
  roomUrl,
  token,
  userName,
  onLeave,
  className = ''
}: VideoConferenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [participants, setParticipants] = useState<{ [id: string]: ParticipantData }>({});
  const [localParticipant, setLocalParticipant] = useState<ParticipantData | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDaily();
    return () => {
      dailyService.destroy();
    };
  }, [roomUrl, token, userName]);

  const initializeDaily = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      await dailyService.initialize({
        roomUrl,
        token,
        userName,
        userData: { name: userName }
      });

      // Set up event listeners
      dailyService.onParticipantJoined((participant) => {
        setParticipants(prev => ({ ...prev, [participant.session_id]: participant }));
        toast({
          title: 'Participant Joined',
          description: `${participant.user_name} joined the meeting`,
        });
      });

      dailyService.onParticipantLeft((participant) => {
        setParticipants(prev => {
          const newParticipants = { ...prev };
          delete newParticipants[participant.session_id];
          return newParticipants;
        });
        toast({
          title: 'Participant Left',
          description: `${participant.user_name} left the meeting`,
        });
      });

      dailyService.onParticipantUpdated((participant) => {
        if (participant.session_id === localParticipant?.session_id) {
          setLocalParticipant(participant);
          setIsAudioEnabled(participant.audio);
          setIsVideoEnabled(participant.video);
          setIsScreenSharing(participant.screen || false);
        } else {
          setParticipants(prev => ({ ...prev, [participant.session_id]: participant }));
        }
      });

      dailyService.onRecordingStarted(() => {
        setIsRecording(true);
        toast({
          title: 'Recording Started',
          description: 'This meeting is now being recorded',
        });
      });

      dailyService.onRecordingStopped(() => {
        setIsRecording(false);
        toast({
          title: 'Recording Stopped',
          description: 'Meeting recording has ended',
        });
      });

      dailyService.onError((error) => {
        console.error('Daily error:', error);
        setError(error.message || 'An error occurred');
        toast({
          title: 'Connection Error',
          description: error.message || 'An error occurred with the video connection',
          variant: 'destructive',
        });
      });

    } catch (error) {
      console.error('Failed to initialize Daily:', error);
      setError('Failed to initialize video conference');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setIsConnecting(true);
      await dailyService.joinRoom();
      setIsConnected(true);
      setLocalParticipant(dailyService.getLocalParticipant());
      setParticipants(dailyService.getParticipants());
    } catch (error) {
      console.error('Failed to join room:', error);
      setError('Failed to join meeting room');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await dailyService.leaveRoom();
      setIsConnected(false);
      setParticipants({});
      setLocalParticipant(null);
      if (onLeave) onLeave();
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  };

  const handleToggleAudio = async () => {
    try {
      await dailyService.toggleAudio();
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      toast({
        title: 'Audio Error',
        description: 'Failed to toggle audio',
        variant: 'destructive',
      });
    }
  };

  const handleToggleVideo = async () => {
    try {
      await dailyService.toggleVideo();
    } catch (error) {
      console.error('Failed to toggle video:', error);
      toast({
        title: 'Video Error',
        description: 'Failed to toggle video',
        variant: 'destructive',
      });
    }
  };

  const handleToggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await dailyService.stopScreenShare();
      } else {
        await dailyService.startScreenShare();
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
      toast({
        title: 'Screen Share Error',
        description: 'Failed to toggle screen sharing',
        variant: 'destructive',
      });
    }
  };

  const handleToggleRecording = async () => {
    try {
      if (isRecording) {
        await dailyService.stopRecording();
      } else {
        await dailyService.startRecording();
      }
    } catch (error) {
      console.error('Failed to toggle recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Failed to toggle recording',
        variant: 'destructive',
      });
    }
  };

  const participantCount = Object.keys(participants).length + (localParticipant ? 1 : 0);

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-red-600">Connection Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={initializeDaily} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Video Conference</CardTitle>
              {isRecording && (
                <Badge variant="destructive" className="animate-pulse">
                  <Circle className="w-3 h-3 mr-1" />
                  Recording
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" />
                {participantCount} participant{participantCount !== 1 ? 's' : ''}
              </Badge>
            </div>
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
                Click the button below to join the video conference
              </p>
              <Button 
                onClick={handleJoinRoom} 
                disabled={isConnecting}
                className="min-w-32"
              >
                {isConnecting ? 'Connecting...' : 'Join Meeting'}
              </Button>
            </div>
          ) : (
            <div>
              {/* Video container */}
              <div 
                ref={containerRef}
                className="bg-gray-900 rounded-lg mb-4 h-96 flex items-center justify-center text-white"
              >
                <p>Video feed will appear here</p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant={isAudioEnabled ? "default" : "destructive"}
                  size="sm"
                  onClick={handleToggleAudio}
                >
                  {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant={isVideoEnabled ? "default" : "destructive"}
                  size="sm"
                  onClick={handleToggleVideo}
                >
                  {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>

                <Button
                  variant={isScreenSharing ? "secondary" : "outline"}
                  size="sm"
                  onClick={handleToggleScreenShare}
                >
                  {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                </Button>

                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleToggleRecording}
                >
                  {isRecording ? <Square className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                >
                  <Settings className="w-4 h-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLeaveRoom}
                >
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </div>

              {/* Participants list */}
              {participantCount > 1 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Participants ({participantCount})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {localParticipant && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                        <div className="flex gap-1">
                          {localParticipant.audio ? 
                            <Mic className="w-3 h-3 text-green-600" /> : 
                            <MicOff className="w-3 h-3 text-red-600" />
                          }
                          {localParticipant.video ? 
                            <Video className="w-3 h-3 text-green-600" /> : 
                            <VideoOff className="w-3 h-3 text-red-600" />
                          }
                        </div>
                        <span className="truncate">{localParticipant.user_name} (You)</span>
                      </div>
                    )}
                    {Object.values(participants).map((participant) => (
                      <div key={participant.session_id} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                        <div className="flex gap-1">
                          {participant.audio ? 
                            <Mic className="w-3 h-3 text-green-600" /> : 
                            <MicOff className="w-3 h-3 text-red-600" />
                          }
                          {participant.video ? 
                            <Video className="w-3 h-3 text-green-600" /> : 
                            <VideoOff className="w-3 h-3 text-red-600" />
                          }
                        </div>
                        <span className="truncate">{participant.user_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}