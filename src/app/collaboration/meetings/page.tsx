import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import MeetingScheduler from '@/components/collaboration/meeting-scheduler';

// Mock data - in a real app, this would come from your database
const mockMeetings = [
  {
    id: '1',
    title: 'Weekly Team Standup',
    description: 'Regular team sync to discuss progress, blockers, and upcoming priorities.',
    start: new Date('2024-08-28T09:00:00Z'),
    end: new Date('2024-08-28T09:30:00Z'),
    status: 'scheduled' as const,
    type: 'meeting' as const,
    organizer: {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@vidibemus.com',
    },
    participants: [
      {
        id: '1',
        name: 'Mike Chen',
        email: 'mike.chen@vidibemus.com',
        status: 'accepted' as const,
      },
      {
        id: '2',
        name: 'Dr. Lisa Park',
        email: 'lisa.park@vidibemus.com',
        status: 'accepted' as const,
      },
      {
        id: '3',
        name: 'Emily Davis',
        email: 'emily.davis@vidibemus.com',
        status: 'pending' as const,
      },
    ],
    roomId: 'room-1',
    isRecording: false,
  },
  {
    id: '2',
    title: 'Client Demo & Feedback Session',
    description: 'Present MVP to client stakeholders and gather feedback for next iteration.',
    start: new Date('2024-08-28T14:00:00Z'),
    end: new Date('2024-08-28T15:30:00Z'),
    status: 'scheduled' as const,
    type: 'presentation' as const,
    organizer: {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@vidibemus.com',
    },
    participants: [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@client.com',
        status: 'accepted' as const,
      },
      {
        id: '2',
        name: 'Mary Wilson',
        email: 'mary.wilson@client.com',
        status: 'accepted' as const,
      },
      {
        id: '3',
        name: 'David Brown',
        email: 'david.brown@client.com',
        status: 'pending' as const,
      },
    ],
    roomId: 'room-2',
    isRecording: true,
  },
  {
    id: '3',
    title: 'ML Model Architecture Review',
    description: 'Technical deep-dive on machine learning model architecture and performance optimization.',
    start: new Date('2024-08-29T11:00:00Z'),
    end: new Date('2024-08-29T12:30:00Z'),
    status: 'scheduled' as const,
    type: 'training' as const,
    organizer: {
      id: '3',
      name: 'Dr. Lisa Park',
      email: 'lisa.park@vidibemus.com',
    },
    participants: [
      {
        id: '1',
        name: 'Mike Chen',
        email: 'mike.chen@vidibemus.com',
        status: 'accepted' as const,
      },
      {
        id: '2',
        name: 'Alex Rivera',
        email: 'alex.rivera@vidibemus.com',
        status: 'accepted' as const,
      },
      {
        id: '3',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@vidibemus.com',
        status: 'accepted' as const,
      },
    ],
    roomId: 'room-3',
    isRecording: false,
  },
  {
    id: '4',
    title: 'Code Review Session',
    description: 'Collaborative code review for the new analytics dashboard components.',
    start: new Date('2024-08-30T10:00:00Z'),
    end: new Date('2024-08-30T11:00:00Z'),
    status: 'scheduled' as const,
    type: 'collaboration' as const,
    organizer: {
      id: '2',
      name: 'Mike Chen',
      email: 'mike.chen@vidibemus.com',
    },
    participants: [
      {
        id: '1',
        name: 'Alex Rivera',
        email: 'alex.rivera@vidibemus.com',
        status: 'accepted' as const,
      },
      {
        id: '2',
        name: 'Emily Davis',
        email: 'emily.davis@vidibemus.com',
        status: 'pending' as const,
      },
    ],
    roomId: 'room-4',
    isRecording: false,
  },
  {
    id: '5',
    title: 'Sprint Planning Meeting',
    description: 'Plan upcoming sprint tasks, estimate story points, and assign responsibilities.',
    start: new Date('2024-09-02T09:00:00Z'),
    end: new Date('2024-09-02T11:00:00Z'),
    status: 'scheduled' as const,
    type: 'meeting' as const,
    organizer: {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@vidibemus.com',
    },
    participants: [
      {
        id: '1',
        name: 'Mike Chen',
        email: 'mike.chen@vidibemus.com',
        status: 'pending' as const,
      },
      {
        id: '2',
        name: 'Dr. Lisa Park',
        email: 'lisa.park@vidibemus.com',
        status: 'pending' as const,
      },
      {
        id: '3',
        name: 'Emily Davis',
        email: 'emily.davis@vidibemus.com',
        status: 'pending' as const,
      },
      {
        id: '4',
        name: 'Alex Rivera',
        email: 'alex.rivera@vidibemus.com',
        status: 'pending' as const,
      },
    ],
    roomId: 'room-5',
    isRecording: false,
  },
  {
    id: '6',
    title: 'Client Consultation - Phase 4 Planning',
    description: 'Discuss requirements and timeline for Phase 4 development with client stakeholders.',
    start: new Date('2024-09-05T15:00:00Z'),
    end: new Date('2024-09-05T16:00:00Z'),
    status: 'scheduled' as const,
    type: 'consultation' as const,
    organizer: {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@vidibemus.com',
    },
    participants: [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@client.com',
        status: 'pending' as const,
      },
      {
        id: '2',
        name: 'Mary Wilson',
        email: 'mary.wilson@client.com',
        status: 'pending' as const,
      },
    ],
    roomId: 'room-6',
    isRecording: true,
  },
];

export default async function MeetingsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  const handleCreateMeeting = async (meetingData: any) => {
    // In a real app, this would make an API call
    console.log('Creating meeting:', meetingData);
    // TODO: Implement meeting creation API call
  };

  const handleUpdateMeeting = async (meetingId: string, meetingData: any) => {
    // In a real app, this would make an API call
    console.log('Updating meeting:', meetingId, meetingData);
    // TODO: Implement meeting update API call
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    // In a real app, this would make an API call
    console.log('Deleting meeting:', meetingId);
    // TODO: Implement meeting deletion API call
  };

  const handleJoinMeeting = async (meeting: any) => {
    // In a real app, this would redirect to the meeting room
    console.log('Joining meeting:', meeting);
    window.location.href = `/collaboration/rooms/${meeting.roomId}`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Meeting Scheduler</h1>
        <p className="text-muted-foreground mt-2">
          Schedule and manage your team meetings, client consultations, and collaboration sessions.
        </p>
      </div>

      <MeetingScheduler
        meetings={mockMeetings}
        onCreateMeeting={handleCreateMeeting}
        onUpdateMeeting={handleUpdateMeeting}
        onDeleteMeeting={handleDeleteMeeting}
        onJoinMeeting={handleJoinMeeting}
        currentUserId={session.user?.id || '1'}
      />
    </div>
  );
}