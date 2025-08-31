import React from 'react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Palette,
  Code,
  FolderOpen,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react';

// Mock data - in a real app, this would come from your database
const mockData = {
  recentRooms: [
    {
      id: '1',
      name: 'AI Strategy Session',
      type: 'COLLABORATION',
      participantCount: 4,
      lastActivity: new Date('2024-08-27T10:30:00Z'),
      status: 'active'
    },
    {
      id: '2',
      name: 'Client Consultation',
      type: 'CONSULTATION',
      participantCount: 2,
      lastActivity: new Date('2024-08-27T09:15:00Z'),
      status: 'scheduled'
    },
    {
      id: '3',
      name: 'Code Review',
      type: 'TRAINING',
      participantCount: 3,
      lastActivity: new Date('2024-08-26T16:45:00Z'),
      status: 'completed'
    }
  ],
  upcomingMeetings: [
    {
      id: '1',
      title: 'Weekly Stand-up',
      scheduledAt: new Date('2024-08-28T09:00:00Z'),
      duration: 30,
      participantCount: 6
    },
    {
      id: '2',
      title: 'Client Demo',
      scheduledAt: new Date('2024-08-28T14:00:00Z'),
      duration: 60,
      participantCount: 4
    }
  ],
  stats: {
    totalRooms: 8,
    totalMeetings: 24,
    totalDocuments: 15,
    totalWhiteboards: 6
  }
};

export default async function CollaborationPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      scheduled: 'secondary',
      completed: 'outline'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Collaboration Hub</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {session.user?.name}! Manage your projects and collaborate with your team.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/collaboration/rooms/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Room
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
                <p className="text-2xl font-bold">{mockData.stats.totalRooms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meetings</p>
                <p className="text-2xl font-bold">{mockData.stats.totalMeetings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">{mockData.stats.totalDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Palette className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Whiteboards</p>
                <p className="text-2xl font-bold">{mockData.stats.totalWhiteboards}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Rooms */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Rooms</CardTitle>
              <Link href="/collaboration/rooms">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{room.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{room.participantCount} participants</span>
                        <span>•</span>
                        <span>{formatTimeAgo(room.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(room.status)}
                    <Link href={`/collaboration/rooms/${room.id}`}>
                      <Button size="sm">
                        Join
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">{meeting.title}</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{meeting.scheduledAt.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{meeting.participantCount} participants</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    <Video className="w-4 h-4 mr-2" />
                    Join Meeting
                  </Button>
                </div>
              ))}
              
              <Link href="/collaboration/meetings">
                <Button variant="outline" size="sm" className="w-full">
                  View All Meetings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Start collaborating with these common actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/collaboration/rooms/new">
              <Button variant="outline" className="h-20 flex-col">
                <Video className="w-6 h-6 mb-2" />
                Start Meeting
              </Button>
            </Link>
            
            <Link href="/collaboration/scheduler">
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="w-6 h-6 mb-2" />
                Schedule Meeting
              </Button>
            </Link>
            
            <Button variant="outline" className="h-20 flex-col">
              <Code className="w-6 h-6 mb-2" />
              Code Together
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Palette className="w-6 h-6 mb-2" />
              New Whiteboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Video className="w-8 h-8 text-blue-600 mb-2" />
            <CardTitle>Video Conferencing</CardTitle>
            <CardDescription>
              High-quality video calls with screen sharing and recording capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                HD video quality
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Screen sharing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Meeting recording
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Code className="w-8 h-8 text-purple-600 mb-2" />
            <CardTitle>Code Collaboration</CardTitle>
            <CardDescription>
              Real-time code editing with syntax highlighting and live cursors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Multiple languages
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Live collaboration
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Version history
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Palette className="w-8 h-8 text-orange-600 mb-2" />
            <CardTitle>Interactive Whiteboard</CardTitle>
            <CardDescription>
              Collaborative whiteboard with drawing tools and real-time updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Drawing tools
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Real-time sync
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Export options
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}