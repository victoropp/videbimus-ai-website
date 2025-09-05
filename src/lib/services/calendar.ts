import { getServiceConfig } from '../config/services';
import { withErrorHandling, ServiceErrorType, CustomServiceError } from './error-handler';
import { getErrorMessage, toError } from '../utils';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: {
    email: string;
    name?: string;
    responseStatus?: 'accepted' | 'declined' | 'tentative' | 'pending';
  }[];
  organizer?: {
    email: string;
    name?: string;
  };
  meetingUrl?: string;
  timezone?: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    until?: Date;
    count?: number;
    daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  };
  reminders?: {
    method: 'email' | 'popup';
    minutes: number;
  }[];
  visibility?: 'public' | 'private';
  status?: 'confirmed' | 'tentative' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarAvailability {
  date: string;
  timeSlots: {
    start: string;
    end: string;
    available: boolean;
  }[];
}

export interface CalendarBookingSlot {
  start: Date;
  end: Date;
  duration: number; // minutes
  available: boolean;
  conflicting?: CalendarEvent[];
}

export interface CalendarSettings {
  workingHours: {
    start: string; // HH:MM format
    end: string; // HH:MM format
    days: number[]; // 0 = Sunday, 1 = Monday, etc.
  };
  bufferTime: number; // minutes between meetings
  maxBookingAdvance: number; // days ahead
  minBookingNotice: number; // minutes ahead
  timezone: string;
}

interface GoogleCalendarAPI {
  baseUrl: string;
  accessToken: string;
  refreshToken?: string;
  calendarId?: string;
}

interface OutlookCalendarAPI {
  baseUrl: string;
  accessToken: string;
  refreshToken?: string;
}

class CalendarService {
  private config: ReturnType<typeof getServiceConfig>['calendar'];
  private googleAPI?: GoogleCalendarAPI;
  private outlookAPI?: OutlookCalendarAPI;
  private defaultSettings: CalendarSettings = {
    workingHours: {
      start: '09:00',
      end: '17:00',
      days: [1, 2, 3, 4, 5], // Monday to Friday
    },
    bufferTime: 15,
    maxBookingAdvance: 30,
    minBookingNotice: 60,
    timezone: 'UTC',
  };

  constructor() {
    this.config = getServiceConfig().calendar;
    
    // Initialize Google Calendar if configured
    if (this.config.google.enabled && this.config.google.clientId) {
      this.googleAPI = {
        baseUrl: 'https://www.googleapis.com/calendar/v3',
        accessToken: '', // This would be set after OAuth flow
        calendarId: 'primary',
      };
    }
    
    // Initialize Outlook Calendar if configured
    if (this.config.outlook.enabled && this.config.outlook.clientId) {
      this.outlookAPI = {
        baseUrl: 'https://graph.microsoft.com/v1.0',
        accessToken: '', // This would be set after OAuth flow
      };
    }
  }

  // Event Management
  async createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    if (this.googleAPI) {
      return await this.createGoogleEvent(event);
    } else if (this.outlookAPI) {
      return await this.createOutlookEvent(event);
    } else {
      throw new CustomServiceError({
        type: ServiceErrorType.CALENDAR,
        service: 'calendar',
        operation: 'createEvent',
        message: 'No calendar provider configured',
        retryable: false,
      });
    }
  }

  private async createGoogleEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    if (!this.googleAPI) throw new Error('Google Calendar not configured');
    
    try {
      const googleEvent = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: event.timezone || this.defaultSettings.timezone,
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: event.timezone || this.defaultSettings.timezone,
        },
        attendees: event.attendees?.map(attendee => ({
          email: attendee.email,
          displayName: attendee.name,
        })),
        reminders: {
          useDefault: false,
          overrides: event.reminders?.map(reminder => ({
            method: reminder.method,
            minutes: reminder.minutes,
          })),
        },
        visibility: event.visibility,
        status: event.status,
      };

      if ((event as any).recurrence) {
        (googleEvent as any).recurrence = this.buildGoogleRecurrence((event as any).recurrence);
      }

      const response = await fetch(`${this.googleAPI.baseUrl}/calendars/${this.googleAPI.calendarId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.googleAPI.accessToken}`,
        },
        body: JSON.stringify(googleEvent),
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      
      return this.convertGoogleEvent(result);
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CALENDAR,
        service: 'calendar',
        operation: 'createGoogleEvent',
        message: `Failed to create Google Calendar event: ${getErrorMessage(error)}`,
        retryable: true,
        originalError: toError(error),
        metadata: { title: event.title, startTime: event.startTime },
      });
    }
  }

  private async createOutlookEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    if (!this.outlookAPI) throw new Error('Outlook Calendar not configured');
    
    try {
      const outlookEvent = {
        subject: event.title,
        body: {
          contentType: 'text',
          content: event.description || '',
        },
        location: {
          displayName: event.location,
        },
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: event.timezone || this.defaultSettings.timezone,
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: event.timezone || this.defaultSettings.timezone,
        },
        attendees: event.attendees?.map(attendee => ({
          emailAddress: {
            address: attendee.email,
            name: attendee.name,
          },
        })),
      };

      const response = await fetch(`${this.outlookAPI.baseUrl}/me/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.outlookAPI.accessToken}`,
        },
        body: JSON.stringify(outlookEvent),
      });

      if (!response.ok) {
        throw new Error(`Outlook Calendar API error: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      
      return this.convertOutlookEvent(result);
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CALENDAR,
        service: 'calendar',
        operation: 'createOutlookEvent',
        message: `Failed to create Outlook Calendar event: ${getErrorMessage(error)}`,
        retryable: true,
        originalError: toError(error),
        metadata: { title: event.title, startTime: event.startTime },
      });
    }
  }

  async getEvent(id: string): Promise<CalendarEvent | null> {
    if (this.googleAPI) {
      return await this.getGoogleEvent(id);
    } else if (this.outlookAPI) {
      return await this.getOutlookEvent(id);
    } else {
      return null;
    }
  }

  private async getGoogleEvent(id: string): Promise<CalendarEvent | null> {
    if (!this.googleAPI) return null;
    
    try {
      const response = await fetch(`${this.googleAPI.baseUrl}/calendars/${this.googleAPI.calendarId}/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.googleAPI.accessToken}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      return this.convertGoogleEvent(result);
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CALENDAR,
        service: 'calendar',
        operation: 'getGoogleEvent',
        message: `Failed to get Google Calendar event: ${getErrorMessage(error)}`,
        retryable: true,
        originalError: toError(error),
        metadata: { eventId: id },
      });
    }
  }

  private async getOutlookEvent(id: string): Promise<CalendarEvent | null> {
    if (!this.outlookAPI) return null;
    
    try {
      const response = await fetch(`${this.outlookAPI.baseUrl}/me/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.outlookAPI.accessToken}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Outlook Calendar API error: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      return this.convertOutlookEvent(result);
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CALENDAR,
        service: 'calendar',
        operation: 'getOutlookEvent',
        message: `Failed to get Outlook Calendar event: ${getErrorMessage(error)}`,
        retryable: true,
        originalError: toError(error),
        metadata: { eventId: id },
      });
    }
  }

  async updateEvent(id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CalendarEvent> {
    if (this.googleAPI) {
      // TODO: Implement updateGoogleEvent method
      throw new Error('updateGoogleEvent not implemented');
    } else if (this.outlookAPI) {
      // TODO: Implement updateOutlookEvent method
      throw new Error('updateOutlookEvent not implemented');
    } else {
      throw new CustomServiceError({
        type: ServiceErrorType.CALENDAR,
        service: 'calendar',
        operation: 'updateEvent',
        message: 'No calendar provider configured',
        retryable: false,
      });
    }
  }

  async deleteEvent(id: string): Promise<void> {
    if (this.googleAPI) {
      // TODO: Implement deleteGoogleEvent method
      throw new Error('deleteGoogleEvent not implemented');
    } else if (this.outlookAPI) {
      // TODO: Implement deleteOutlookEvent method  
      throw new Error('deleteOutlookEvent not implemented');
    } else {
      throw new CustomServiceError({
        type: ServiceErrorType.CALENDAR,
        service: 'calendar',
        operation: 'deleteEvent',
        message: 'No calendar provider configured',
        retryable: false,
      });
    }
  }

  // Availability checking
  async getAvailability(startDate: Date, endDate: Date, settings?: Partial<CalendarSettings>): Promise<CalendarBookingSlot[]> {
    const mergedSettings = { ...this.defaultSettings, ...settings };
    const events = await this.getEvents(startDate, endDate);
    
    const slots: CalendarBookingSlot[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      // Check if it's a working day
      if (mergedSettings.workingHours.days.includes(dayOfWeek)) {
        const daySlots = this.generateDaySlotsWithAvailability(
          new Date(currentDate),
          mergedSettings,
          events
        );
        slots.push(...daySlots);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return slots;
  }

  private generateDaySlotsWithAvailability(
    date: Date,
    settings: CalendarSettings,
    events: CalendarEvent[]
  ): CalendarBookingSlot[] {
    const slots: CalendarBookingSlot[] = [];
    const [startHour, startMinute] = settings.workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = settings.workingHours.end.split(':').map(Number);
    
    const dayStart = new Date(date);
    dayStart.setHours(startHour, startMinute, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(endHour, endMinute, 0, 0);
    
    // Generate 30-minute slots (you can make this configurable)
    const slotDuration = 30;
    const current = new Date(dayStart);
    
    while (current < dayEnd) {
      const slotEnd = new Date(current);
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);
      
      if (slotEnd <= dayEnd) {
        const conflictingEvents = events.filter(event => 
          this.isTimeSlotConflicting(current, slotEnd, event.startTime, event.endTime, settings.bufferTime)
        );
        
        slots.push({
          start: new Date(current),
          end: new Date(slotEnd),
          duration: slotDuration,
          available: conflictingEvents.length === 0,
          conflicting: conflictingEvents,
        });
      }
      
      current.setMinutes(current.getMinutes() + slotDuration);
    }
    
    return slots;
  }

  private isTimeSlotConflicting(
    slotStart: Date,
    slotEnd: Date,
    eventStart: Date,
    eventEnd: Date,
    bufferMinutes: number
  ): boolean {
    const bufferedEventStart = new Date(eventStart);
    bufferedEventStart.setMinutes(bufferedEventStart.getMinutes() - bufferMinutes);
    
    const bufferedEventEnd = new Date(eventEnd);
    bufferedEventEnd.setMinutes(bufferedEventEnd.getMinutes() + bufferMinutes);
    
    return slotStart < bufferedEventEnd && slotEnd > bufferedEventStart;
  }

  // Get events in date range
  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (this.googleAPI) {
      return await this.getGoogleEvents(startDate, endDate);
    } else if (this.outlookAPI) {
      return await this.getOutlookEvents(startDate, endDate);
    } else {
      return [];
    }
  }

  private async getGoogleEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.googleAPI) return [];
    
    try {
      const params = new URLSearchParams({
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '2500',
      });

      const response = await fetch(`${this.googleAPI.baseUrl}/calendars/${this.googleAPI.calendarId}/events?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.googleAPI.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      return result.items?.map(this.convertGoogleEvent.bind(this)) || [];
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CALENDAR,
        service: 'calendar',
        operation: 'getGoogleEvents',
        message: `Failed to get Google Calendar events: ${getErrorMessage(error)}`,
        retryable: true,
        originalError: toError(error),
        metadata: { startDate, endDate },
      });
    }
  }

  private async getOutlookEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.outlookAPI) return [];
    
    try {
      const params = new URLSearchParams({
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        $orderby: 'start/dateTime',
        $top: '1000',
      });

      const response = await fetch(`${this.outlookAPI.baseUrl}/me/calendarview?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.outlookAPI.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Outlook Calendar API error: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      return result.value?.map(this.convertOutlookEvent.bind(this)) || [];
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CALENDAR,
        service: 'calendar',
        operation: 'getOutlookEvents',
        message: `Failed to get Outlook Calendar events: ${getErrorMessage(error)}`,
        retryable: true,
        originalError: toError(error),
        metadata: { startDate, endDate },
      });
    }
  }

  // Booking helpers
  async findNextAvailableSlot(
    duration: number = 30,
    daysAhead: number = 7,
    settings?: Partial<CalendarSettings>
  ): Promise<CalendarBookingSlot | null> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);
    
    const slots = await this.getAvailability(startDate, endDate, settings);
    
    return slots.find(slot => 
      slot.available && 
      slot.duration >= duration &&
      slot.start.getTime() > Date.now() + (settings?.minBookingNotice || this.defaultSettings.minBookingNotice) * 60 * 1000
    ) || null;
  }

  // Meeting URL integration
  async createMeetingWithVideoConference(
    event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>,
    videoProvider: 'daily' | 'zoom' | 'meet' = 'daily'
  ): Promise<CalendarEvent & { meetingUrl: string }> {
    let meetingUrl = '';
    
    // Generate meeting URL based on provider
    if (videoProvider === 'daily') {
      // Integration with Daily.co would go here
      meetingUrl = `https://videbimus.daily.co/${crypto.randomUUID()}`;
    } else if (videoProvider === 'meet') {
      // Google Meet integration
      meetingUrl = 'https://meet.google.com/new';
    }
    
    const eventWithMeeting = {
      ...event,
      description: `${event.description || ''}\n\nJoin meeting: ${meetingUrl}`,
      meetingUrl,
    };
    
    const createdEvent = await this.createEvent(eventWithMeeting);
    
    return {
      ...createdEvent,
      meetingUrl,
    };
  }

  // Health check
  async healthCheck(): Promise<{ google?: boolean; outlook?: boolean }> {
    const results: { google?: boolean; outlook?: boolean } = {};
    
    if (this.googleAPI && this.googleAPI.accessToken) {
      try {
        const response = await fetch(`${this.googleAPI.baseUrl}/calendars/${this.googleAPI.calendarId}`, {
          headers: {
            'Authorization': `Bearer ${this.googleAPI.accessToken}`,
          },
        });
        results.google = response.ok;
      } catch (error) {
        results.google = false;
      }
    }
    
    if (this.outlookAPI && this.outlookAPI.accessToken) {
      try {
        const response = await fetch(`${this.outlookAPI.baseUrl}/me/calendar`, {
          headers: {
            'Authorization': `Bearer ${this.outlookAPI.accessToken}`,
          },
        });
        results.outlook = response.ok;
      } catch (error) {
        results.outlook = false;
      }
    }
    
    return results;
  }

  // Helper methods for conversion
  private convertGoogleEvent(googleEvent: any): CalendarEvent {
    return {
      id: googleEvent.id,
      title: googleEvent.summary,
      description: googleEvent.description,
      startTime: new Date(googleEvent.start.dateTime || googleEvent.start.date),
      endTime: new Date(googleEvent.end.dateTime || googleEvent.end.date),
      location: googleEvent.location,
      attendees: googleEvent.attendees?.map((attendee: any) => ({
        email: attendee.email,
        name: attendee.displayName,
        responseStatus: attendee.responseStatus,
      })),
      organizer: googleEvent.organizer ? {
        email: googleEvent.organizer.email,
        name: googleEvent.organizer.displayName,
      } : undefined,
      timezone: googleEvent.start.timeZone,
      visibility: googleEvent.visibility,
      status: googleEvent.status,
      createdAt: new Date(googleEvent.created),
      updatedAt: new Date(googleEvent.updated),
    };
  }

  private convertOutlookEvent(outlookEvent: any): CalendarEvent {
    return {
      id: outlookEvent.id,
      title: outlookEvent.subject,
      description: outlookEvent.body?.content,
      startTime: new Date(outlookEvent.start.dateTime),
      endTime: new Date(outlookEvent.end.dateTime),
      location: outlookEvent.location?.displayName,
      attendees: outlookEvent.attendees?.map((attendee: any) => ({
        email: attendee.emailAddress.address,
        name: attendee.emailAddress.name,
        responseStatus: attendee.status?.response,
      })),
      organizer: outlookEvent.organizer ? {
        email: outlookEvent.organizer.emailAddress.address,
        name: outlookEvent.organizer.emailAddress.name,
      } : undefined,
      timezone: outlookEvent.start.timeZone,
      createdAt: new Date(outlookEvent.createdDateTime),
      updatedAt: new Date(outlookEvent.lastModifiedDateTime),
    };
  }

  private buildGoogleRecurrence(recurrence: CalendarEvent['recurrence']): string[] {
    if (!recurrence) return [];
    
    let rrule = `FREQ=${recurrence.frequency.toUpperCase()}`;
    
    if (recurrence.interval > 1) {
      rrule += `;INTERVAL=${recurrence.interval}`;
    }
    
    if (recurrence.until) {
      rrule += `;UNTIL=${recurrence.until.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    }
    
    if (recurrence.count) {
      rrule += `;COUNT=${recurrence.count}`;
    }
    
    if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const daysList = recurrence.daysOfWeek.map(day => days[day]).join(',');
      rrule += `;BYDAY=${daysList}`;
    }
    
    return [`RRULE:${rrule}`];
  }

  // OAuth helper methods (would be implemented based on your auth flow)
  async setGoogleAccessToken(accessToken: string, refreshToken?: string): Promise<void> {
    if (this.googleAPI) {
      this.googleAPI.accessToken = accessToken;
      this.googleAPI.refreshToken = refreshToken;
    }
  }

  async setOutlookAccessToken(accessToken: string, refreshToken?: string): Promise<void> {
    if (this.outlookAPI) {
      this.outlookAPI.accessToken = accessToken;
      this.outlookAPI.refreshToken = refreshToken;
    }
  }
}

// Create wrapped methods with error handling and retry logic
const rawCalendarService = new CalendarService();

export const calendarService = {
  createEvent: withErrorHandling('calendar', 'createEvent', rawCalendarService.createEvent.bind(rawCalendarService)),
  getEvent: withErrorHandling('calendar', 'getEvent', rawCalendarService.getEvent.bind(rawCalendarService)),
  updateEvent: withErrorHandling('calendar', 'updateEvent', rawCalendarService.updateEvent.bind(rawCalendarService)),
  deleteEvent: withErrorHandling('calendar', 'deleteEvent', rawCalendarService.deleteEvent.bind(rawCalendarService)),
  getAvailability: withErrorHandling('calendar', 'getAvailability', rawCalendarService.getAvailability.bind(rawCalendarService)),
  getEvents: withErrorHandling('calendar', 'getEvents', rawCalendarService.getEvents.bind(rawCalendarService)),
  findNextAvailableSlot: withErrorHandling('calendar', 'findNextAvailableSlot', rawCalendarService.findNextAvailableSlot.bind(rawCalendarService)),
  createMeetingWithVideoConference: withErrorHandling('calendar', 'createMeetingWithVideoConference', rawCalendarService.createMeetingWithVideoConference.bind(rawCalendarService)),
  setGoogleAccessToken: rawCalendarService.setGoogleAccessToken.bind(rawCalendarService),
  setOutlookAccessToken: rawCalendarService.setOutlookAccessToken.bind(rawCalendarService),
  healthCheck: withErrorHandling('calendar', 'healthCheck', rawCalendarService.healthCheck.bind(rawCalendarService), { maxAttempts: 1 }),
};

export { CalendarService };
