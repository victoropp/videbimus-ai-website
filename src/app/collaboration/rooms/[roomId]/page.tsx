'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import CollaborationPortal from '@/components/collaboration/collaboration-portal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';


export default function RoomPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const roomId = params.roomId as string;
  const [roomData, setRoomData] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      setError('You must be logged in to access collaboration rooms');
      return;
    }
    
    loadRoomData();
  }, [roomId, session, status]);

  const loadRoomData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load room data
      const roomResponse = await fetch(`/api/consultation/rooms/${roomId}`);
      if (!roomResponse.ok) {
        throw new Error('Failed to load room data');
      }
      const room = await roomResponse.json();
      
      // Load room documents
      const docsResponse = await fetch(`/api/consultation/rooms/${roomId}/documents`);
      if (docsResponse.ok) {
        const docs = await docsResponse.json();
        setDocuments(docs.documents || []);
      }
      
      setRoomData(room);
    } catch (error: any) {
      console.error('Error loading room:', error);
      setError(error.message || 'Failed to load room');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading collaboration room...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Access Error</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'You need to be logged in to access this room'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Room Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The collaboration room you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <CollaborationPortal
        roomId={roomId}
        userId={session.user.id}
        userName={session.user.name || 'Anonymous'}
        userEmail={session.user.email || ''}
        roomData={roomData}
        documents={documents}
        token={session.accessToken} // You might need to implement this
        className="h-full"
      />
    </div>
  );
}