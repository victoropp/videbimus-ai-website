'use client';

import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  Plus,
  Edit,
  Trash2,
  Send,
  Copy
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Meeting {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  status: 'scheduled' | 'started' | 'ended' | 'cancelled';
  type: 'consultation' | 'collaboration' | 'training' | 'presentation' | 'meeting';
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  participants: {
    id: string;
    name: string;
    email: string;
    status: 'pending' | 'accepted' | 'declined';
  }[];
  roomId?: string;
  recordingUrl?: string;
  isRecording: boolean;
}

interface MeetingSchedulerProps {
  meetings: Meeting[];
  onCreateMeeting?: (meeting: Partial<Meeting>) => void;
  onUpdateMeeting?: (id: string, meeting: Partial<Meeting>) => void;
  onDeleteMeeting?: (id: string) => void;
  onJoinMeeting?: (meeting: Meeting) => void;
  currentUserId: string;
  className?: string;
}

export default function MeetingScheduler({
  meetings = [],
  onCreateMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
  onJoinMeeting,
  currentUserId,
  className = ''
}: MeetingSchedulerProps) {
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('week');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'meeting' as Meeting['type'],
    date: '',
    startTime: '',
    endTime: '',
    participants: [] as string[]
  });

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setFormData({
      ...formData,
      date: format(start, 'yyyy-MM-dd'),
      startTime: format(start, 'HH:mm'),
      endTime: format(end, 'HH:mm')
    });
    setIsCreateDialogOpen(true);
  };

  const handleSelectEvent = (event: Meeting) => {
    setSelectedMeeting(event);
  };

  const handleCreateMeeting = () => {
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      toast({
        title: 'Validation Error',
        description: 'End time must be after start time',
        variant: 'destructive',
      });
      return;
    }

    const newMeeting: Partial<Meeting> = {
      title: formData.title,
      description: formData.description,
      start: startDateTime,
      end: endDateTime,
      type: formData.type,
      status: 'scheduled',
      isRecording: false,
      participants: formData.participants.map(email => ({
        id: '',
        name: '',
        email,
        status: 'pending' as const
      }))
    };

    if (onCreateMeeting) {
      onCreateMeeting(newMeeting);
    }

    setIsCreateDialogOpen(false);
    resetForm();
    
    toast({
      title: 'Meeting Created',
      description: 'Your meeting has been scheduled successfully',
    });
  };

  const handleUpdateMeeting = () => {
    if (!selectedMeeting) return;

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    const updatedMeeting: Partial<Meeting> = {
      title: formData.title,
      description: formData.description,
      start: startDateTime,
      end: endDateTime,
      type: formData.type,
      participants: formData.participants.map(email => ({
        id: '',
        name: '',
        email,
        status: 'pending' as const
      }))
    };

    if (onUpdateMeeting) {
      onUpdateMeeting(selectedMeeting.id, updatedMeeting);
    }

    setIsEditDialogOpen(false);
    setSelectedMeeting(null);
    resetForm();
    
    toast({
      title: 'Meeting Updated',
      description: 'Your meeting has been updated successfully',
    });
  };

  const handleDeleteMeeting = (meetingId: string) => {
    if (onDeleteMeeting) {
      onDeleteMeeting(meetingId);
    }
    
    toast({
      title: 'Meeting Deleted',
      description: 'The meeting has been deleted',
    });
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    if (onJoinMeeting) {
      onJoinMeeting(meeting);
    }
  };

  const handleCopyMeetingLink = (meeting: Meeting) => {
    const link = `${window.location.origin}/collaboration/room/${meeting.roomId}`;
    navigator.clipboard.writeText(link);
    
    toast({
      title: 'Link Copied',
      description: 'Meeting link copied to clipboard',
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'meeting',
      date: '',
      startTime: '',
      endTime: '',
      participants: []
    });
  };

  const editMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      type: meeting.type,
      date: format(meeting.start, 'yyyy-MM-dd'),
      startTime: format(meeting.start, 'HH:mm'),
      endTime: format(meeting.end, 'HH:mm'),
      participants: meeting.participants.map(p => p.email)
    });
    setIsEditDialogOpen(true);
  };

  const getEventStyle = (event: Meeting) => {
    const statusColors = {
      scheduled: '#3B82F6',
      started: '#10B981',
      ended: '#6B7280',
      cancelled: '#EF4444'
    };

    return {
      backgroundColor: statusColors[event.status],
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
  };

  const eventPropGetter = (event: Meeting) => ({
    style: getEventStyle(event)
  });

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Meeting Scheduler</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={view} onValueChange={(value: any) => setView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="agenda">Agenda</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Schedule New Meeting</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Meeting title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Meeting description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value: Meeting['type']) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="collaboration">Collaboration</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="startTime">Start Time *</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time *</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="participants">Participants (Email addresses, one per line)</Label>
                      <Textarea
                        id="participants"
                        value={formData.participants.join('\n')}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          participants: e.target.value.split('\n').filter(email => email.trim())
                        })}
                        placeholder="participant1@example.com&#10;participant2@example.com"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateMeeting}>
                        Schedule Meeting
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ height: 600 }}>
            <Calendar
              localizer={localizer}
              events={meetings}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={(newView: View) => {
                if (newView === 'work_week') {
                  setView('week');
                } else if (['month', 'week', 'day', 'agenda'].includes(newView)) {
                  setView(newView as 'month' | 'week' | 'day' | 'agenda');
                }
              }}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventPropGetter}
              components={{
                event: ({ event }: { event: Meeting }) => (
                  <div className="text-xs">
                    <div className="font-medium">{event.title}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                    </div>
                  </div>
                )
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Meeting Details Dialog */}
      <Dialog open={selectedMeeting !== null} onOpenChange={() => setSelectedMeeting(null)}>
        <DialogContent className="max-w-2xl">
          {selectedMeeting && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{selectedMeeting.title}</DialogTitle>
                  <Badge variant={
                    selectedMeeting.status === 'scheduled' ? 'default' :
                    selectedMeeting.status === 'started' ? 'default' :
                    selectedMeeting.status === 'ended' ? 'secondary' :
                    'destructive'
                  }>
                    {selectedMeeting.status}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                {selectedMeeting.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedMeeting.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Date & Time</Label>
                    <div className="text-sm text-muted-foreground mt-1">
                      {format(selectedMeeting.start, 'PPP')}
                      <br />
                      {format(selectedMeeting.start, 'p')} - {format(selectedMeeting.end, 'p')}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-sm text-muted-foreground mt-1 capitalize">{selectedMeeting.type}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Participants</Label>
                  <div className="mt-2 space-y-2">
                    {selectedMeeting.participants.map(participant => (
                      <div key={participant.email} className="flex items-center justify-between">
                        <span className="text-sm">{participant.email}</span>
                        <Badge variant={
                          participant.status === 'accepted' ? 'default' :
                          participant.status === 'declined' ? 'destructive' :
                          'secondary'
                        }>
                          {participant.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => editMeeting(selectedMeeting)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => handleDeleteMeeting(selectedMeeting.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {selectedMeeting.roomId && (
                      <Button variant="outline" onClick={() => handleCopyMeetingLink(selectedMeeting)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    )}
                    <Button onClick={() => handleJoinMeeting(selectedMeeting)}>
                      <Video className="w-4 h-4 mr-2" />
                      Join Meeting
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Meeting title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Meeting description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select value={formData.type} onValueChange={(value: Meeting['type']) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Date *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-startTime">Start Time *</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-endTime">End Time *</Label>
              <Input
                id="edit-endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-participants">Participants (Email addresses, one per line)</Label>
              <Textarea
                id="edit-participants"
                value={formData.participants.join('\n')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  participants: e.target.value.split('\n').filter(email => email.trim())
                })}
                placeholder="participant1@example.com&#10;participant2@example.com"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMeeting}>
                Update Meeting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}