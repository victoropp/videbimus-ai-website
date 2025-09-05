import DailyIframe, { DailyCall, DailyEvent, DailyEventObject } from '@daily-co/daily-js';
import { getServiceConfig } from '../config/services';
import { withErrorHandling, ServiceErrorType, CustomServiceError } from './error-handler';
import { getErrorMessage, toError } from '../utils';

export interface VideoRoomConfig {
  name?: string;
  privacy?: 'public' | 'private';
  properties?: {
    max_participants?: number;
    enable_screenshare?: boolean;
    enable_chat?: boolean;
    enable_knocking?: boolean;
    start_video_off?: boolean;
    start_audio_off?: boolean;
    enable_recording?: boolean;
    recording_bucket?: {
      bucket_name: string;
      bucket_region: string;
    };
    enable_live_streaming?: boolean;
    exp?: number; // Unix timestamp for room expiration
    eject_at_room_exp?: boolean;
    enable_prejoin_ui?: boolean;
    enable_network_ui?: boolean;
    enable_people_ui?: boolean;
    lang?: string;
  };
}

export interface MeetingToken {
  token: string;
  room_name: string;
  user_name?: string;
  user_id?: string;
  is_owner?: boolean;
  exp?: number;
  enable_screenshare?: boolean;
  enable_recording?: boolean;
  start_video_off?: boolean;
  start_audio_off?: boolean;
}

export interface ParticipantInfo {
  session_id: string;
  user_id?: string;
  user_name?: string;
  joined_at: Date;
  permissions: {
    hasPresence: boolean;
    canSend: string[];
  };
  tracks: {
    audio: boolean;
    video: boolean;
    screenVideo?: boolean;
    screenAudio?: boolean;
  };
  local: boolean;
}

export interface RecordingInfo {
  recordingId: string;
  status: 'recording' | 'stopped' | 'finished';
  startedAt: Date;
  stoppedAt?: Date;
  duration?: number;
  downloadUrl?: string;
}

export interface LiveStreamInfo {
  streamId: string;
  status: 'streaming' | 'stopped';
  startedAt: Date;
  stoppedAt?: Date;
  rtmpUrl: string;
  streamKey: string;
}

class VideoService {
  private config: ReturnType<typeof getServiceConfig>['video']['daily'];
  private apiBaseUrl = 'https://api.daily.co/v1';
  private activeRooms: Map<string, DailyCall> = new Map();

  constructor() {
    this.config = getServiceConfig().video.daily;
  }

  // Create a new room
  async createRoom(config: VideoRoomConfig = {}): Promise<{
    name: string;
    url: string;
    api_created: boolean;
    privacy: string;
    properties: any;
    id: string;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          name: config.name,
          privacy: config.privacy || 'private',
          properties: {
            max_participants: 50,
            enable_screenshare: true,
            enable_chat: true,
            enable_knocking: true,
            start_video_off: false,
            start_audio_off: false,
            enable_recording: true,
            enable_prejoin_ui: true,
            enable_network_ui: true,
            enable_people_ui: true,
            ...config.properties,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'createRoom',
        message: `Failed to create room: ${getErrorMessage(error)}`,
        retryable: this.isRetryableError(toError(error)),
        originalError: toError(error),
        metadata: { config },
      });
    }
  }

  // Get room info
  async getRoomInfo(roomName: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/rooms/${roomName}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new CustomServiceError({
            type: ServiceErrorType.VALIDATION,
            service: 'video',
            operation: 'getRoomInfo',
            message: `Room not found: ${roomName}`,
            retryable: false,
            metadata: { roomName },
          });
        }
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof CustomServiceError) {
        throw error;
      }

      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'getRoomInfo',
        message: `Failed to get room info: ${getErrorMessage(error)}`,
        retryable: this.isRetryableError(toError(error)),
        originalError: toError(error),
        metadata: { roomName },
      });
    }
  }

  // Delete a room
  async deleteRoom(roomName: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/rooms/${roomName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'deleteRoom',
        message: `Failed to delete room: ${getErrorMessage(error)}`,
        retryable: this.isRetryableError(toError(error)),
        originalError: toError(error),
        metadata: { roomName },
      });
    }
  }

  // Create meeting token
  async createMeetingToken(roomName: string, tokenConfig: Partial<MeetingToken> = {}): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/meeting-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            user_name: tokenConfig.user_name,
            user_id: tokenConfig.user_id,
            is_owner: tokenConfig.is_owner || false,
            exp: tokenConfig.exp || Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
            enable_screenshare: tokenConfig.enable_screenshare ?? true,
            enable_recording: tokenConfig.enable_recording ?? false,
            start_video_off: tokenConfig.start_video_off ?? false,
            start_audio_off: tokenConfig.start_audio_off ?? false,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      return result.token;
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'createMeetingToken',
        message: `Failed to create meeting token: ${getErrorMessage(error)}`,
        retryable: this.isRetryableError(toError(error)),
        originalError: toError(error),
        metadata: { roomName, tokenConfig },
      });
    }
  }

  // Initialize Daily call object
  async initializeCall(roomUrl: string, token?: string, options: any = {}): Promise<DailyCall> {
    try {
      const callObject = DailyIframe.createCallObject({
        url: roomUrl,
        token,
        userName: options.userName,
        userData: options.userData,
        startVideoOff: options.startVideoOff,
        startAudioOff: options.startAudioOff,
        activeSpeakerMode: options.activeSpeakerMode,
        showLeaveButton: options.showLeaveButton ?? true,
        showFullscreenButton: options.showFullscreenButton ?? true,
        showLocalVideo: options.showLocalVideo ?? true,
        showParticipantsBar: options.showParticipantsBar ?? true,
      });

      // Store the call object
      this.activeRooms.set(roomUrl, callObject);

      return callObject;
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'initializeCall',
        message: `Failed to initialize call: ${getErrorMessage(error)}`,
        retryable: false,
        originalError: toError(error),
        metadata: { roomUrl, hasToken: !!token },
      });
    }
  }

  // Join a room
  async joinRoom(roomUrl: string, token?: string, options: any = {}): Promise<{
    callObject: DailyCall;
    participants: Record<string, ParticipantInfo>;
  }> {
    try {
      const callObject = await this.initializeCall(roomUrl, token, options);
      
      // Set up event listeners
      this.setupEventListeners(callObject, roomUrl);
      
      // Join the call
      await callObject.join();
      
      // Get initial participants
      const participants = this.formatParticipants(callObject.participants());
      
      return { callObject, participants };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'joinRoom',
        message: `Failed to join room: ${getErrorMessage(error)}`,
        retryable: this.isRetryableError(toError(error)),
        originalError: toError(error),
        metadata: { roomUrl, hasToken: !!token },
      });
    }
  }

  // Leave room
  async leaveRoom(roomUrl: string): Promise<void> {
    try {
      const callObject = this.activeRooms.get(roomUrl);
      if (callObject) {
        await callObject.leave();
        callObject.destroy();
        this.activeRooms.delete(roomUrl);
      }
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'leaveRoom',
        message: `Failed to leave room: ${getErrorMessage(error)}`,
        retryable: false,
        originalError: toError(error),
        metadata: { roomUrl },
      });
    }
  }

  // Start recording
  async startRecording(roomUrl: string, options: {
    layout?: any;
    instanceId?: string;
  } = {}): Promise<RecordingInfo> {
    try {
      const callObject = this.activeRooms.get(roomUrl);
      if (!callObject) {
        throw new Error('Call not found. Must join room first.');
      }

      await callObject.startRecording({
        layout: options.layout,
        instanceId: options.instanceId,
      });

      // Note: Daily doesn't immediately return recording info
      // You'd typically listen for recording events
      return {
        recordingId: options.instanceId || 'unknown',
        status: 'recording',
        startedAt: new Date(),
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'startRecording',
        message: `Failed to start recording: ${getErrorMessage(error)}`,
        retryable: this.isRetryableError(toError(error)),
        originalError: toError(error),
        metadata: { roomUrl, options },
      });
    }
  }

  // Stop recording
  async stopRecording(roomUrl: string): Promise<void> {
    try {
      const callObject = this.activeRooms.get(roomUrl);
      if (!callObject) {
        throw new Error('Call not found. Must join room first.');
      }

      await callObject.stopRecording();
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'stopRecording',
        message: `Failed to stop recording: ${getErrorMessage(error)}`,
        retryable: this.isRetryableError(toError(error)),
        originalError: toError(error),
        metadata: { roomUrl },
      });
    }
  }

  // Get recordings for a room
  async getRecordings(roomName: string): Promise<RecordingInfo[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/recordings?room_name=${roomName}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      return data.data?.map((recording: any) => ({
        recordingId: recording.id,
        status: recording.status,
        startedAt: new Date(recording.start_ts * 1000),
        stoppedAt: recording.end_ts ? new Date(recording.end_ts * 1000) : undefined,
        duration: recording.duration,
        downloadUrl: recording.download_link,
      })) || [];
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'getRecordings',
        message: `Failed to get recordings: ${getErrorMessage(error)}`,
        retryable: this.isRetryableError(toError(error)),
        originalError: toError(error),
        metadata: { roomName },
      });
    }
  }

  // Control participant media
  async updateParticipant(roomUrl: string, sessionId: string, updates: {
    setAudio?: boolean;
    setVideo?: boolean;
    eject?: true;
  }): Promise<void> {
    try {
      const callObject = this.activeRooms.get(roomUrl);
      if (!callObject) {
        throw new Error('Call not found. Must join room first.');
      }

      await callObject.updateParticipant(sessionId, updates);
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'updateParticipant',
        message: `Failed to update participant: ${getErrorMessage(error)}`,
        retryable: this.isRetryableError(toError(error)),
        originalError: toError(error),
        metadata: { roomUrl, sessionId, updates },
      });
    }
  }

  // Toggle local audio/video
  async toggleLocalAudio(roomUrl: string): Promise<boolean> {
    try {
      const callObject = this.activeRooms.get(roomUrl);
      if (!callObject) {
        throw new Error('Call not found. Must join room first.');
      }

      const currentState = callObject.localAudio();
      await callObject.setLocalAudio(!currentState);
      return !currentState;
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'toggleLocalAudio',
        message: `Failed to toggle audio: ${getErrorMessage(error)}`,
        retryable: false,
        originalError: toError(error),
        metadata: { roomUrl },
      });
    }
  }

  async toggleLocalVideo(roomUrl: string): Promise<boolean> {
    try {
      const callObject = this.activeRooms.get(roomUrl);
      if (!callObject) {
        throw new Error('Call not found. Must join room first.');
      }

      const currentState = callObject.localVideo();
      await callObject.setLocalVideo(!currentState);
      return !currentState;
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'toggleLocalVideo',
        message: `Failed to toggle video: ${getErrorMessage(error)}`,
        retryable: false,
        originalError: toError(error),
        metadata: { roomUrl },
      });
    }
  }

  // Screen sharing
  async startScreenShare(roomUrl: string, options: {
    mediaStream?: MediaStream;
    audio?: boolean;
  } = {}): Promise<void> {
    try {
      const callObject = this.activeRooms.get(roomUrl);
      if (!callObject) {
        throw new Error('Call not found. Must join room first.');
      }

      await callObject.startScreenShare(options);
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'startScreenShare',
        message: `Failed to start screen share: ${getErrorMessage(error)}`,
        retryable: false,
        originalError: toError(error),
        metadata: { roomUrl, options },
      });
    }
  }

  async stopScreenShare(roomUrl: string): Promise<void> {
    try {
      const callObject = this.activeRooms.get(roomUrl);
      if (!callObject) {
        throw new Error('Call not found. Must join room first.');
      }

      await callObject.stopScreenShare();
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VIDEO,
        service: 'video',
        operation: 'stopScreenShare',
        message: `Failed to stop screen share: ${getErrorMessage(error)}`,
        retryable: false,
        originalError: toError(error),
        metadata: { roomUrl },
      });
    }
  }

  // Get call object for direct access
  getCallObject(roomUrl: string): DailyCall | undefined {
    return this.activeRooms.get(roomUrl);
  }

  // Get all active rooms
  getActiveRooms(): string[] {
    return Array.from(this.activeRooms.keys());
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/rooms`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Video service health check failed:', error);
      return false;
    }
  }

  // Private helper methods
  private setupEventListeners(callObject: DailyCall, roomUrl: string): void {
    // Log important events
    callObject.on('joined-meeting', (event) => {
      console.log('Joined meeting:', roomUrl, event);
    });

    callObject.on('left-meeting', (event) => {
      console.log('Left meeting:', roomUrl, event);
      this.activeRooms.delete(roomUrl);
    });

    callObject.on('participant-joined', (event) => {
      console.log('Participant joined:', event.participant);
    });

    callObject.on('participant-left', (event) => {
      console.log('Participant left:', event.participant);
    });

    callObject.on('error', (event) => {
      console.error('Daily error:', event);
    });

    callObject.on('recording-started', (event) => {
      console.log('Recording started:', event);
    });

    callObject.on('recording-stopped', (event) => {
      console.log('Recording stopped:', event);
    });
  }

  private formatParticipants(participants: any): Record<string, ParticipantInfo> {
    const formatted: Record<string, ParticipantInfo> = {};
    
    for (const [sessionId, participant] of Object.entries(participants)) {
      const p = participant as any;
      formatted[sessionId] = {
        session_id: sessionId,
        user_id: p.user_id,
        user_name: p.user_name,
        joined_at: new Date(p.joined_at),
        permissions: p.permissions || { hasPresence: true, canSend: [] },
        tracks: {
          audio: !!p.audio,
          video: !!p.video,
          screenVideo: !!p.screen,
          screenAudio: !!p.screenAudio,
        },
        local: p.local || false,
      };
    }
    
    return formatted;
  }

  private isRetryableError(error: Error): boolean {
    const errorObj = error as any;
    if (errorObj.status || errorObj.statusCode) {
      const status = errorObj.status || errorObj.statusCode;
      return [408, 429, 500, 502, 503, 504].includes(status);
    }
    
    const message = getErrorMessage(error).toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('rate limit') ||
      message.includes('service unavailable')
    );
  }
}

// Create wrapped methods with error handling and retry logic
const rawVideoService = new VideoService();

export const videoService = {
  createRoom: withErrorHandling('video', 'createRoom', rawVideoService.createRoom.bind(rawVideoService)),
  getRoomInfo: withErrorHandling('video', 'getRoomInfo', rawVideoService.getRoomInfo.bind(rawVideoService)),
  deleteRoom: withErrorHandling('video', 'deleteRoom', rawVideoService.deleteRoom.bind(rawVideoService)),
  createMeetingToken: withErrorHandling('video', 'createMeetingToken', rawVideoService.createMeetingToken.bind(rawVideoService)),
  joinRoom: withErrorHandling('video', 'joinRoom', rawVideoService.joinRoom.bind(rawVideoService), { maxAttempts: 2 }),
  leaveRoom: withErrorHandling('video', 'leaveRoom', rawVideoService.leaveRoom.bind(rawVideoService), { maxAttempts: 1 }),
  startRecording: withErrorHandling('video', 'startRecording', rawVideoService.startRecording.bind(rawVideoService)),
  stopRecording: withErrorHandling('video', 'stopRecording', rawVideoService.stopRecording.bind(rawVideoService)),
  getRecordings: withErrorHandling('video', 'getRecordings', rawVideoService.getRecordings.bind(rawVideoService)),
  updateParticipant: withErrorHandling('video', 'updateParticipant', rawVideoService.updateParticipant.bind(rawVideoService)),
  toggleLocalAudio: withErrorHandling('video', 'toggleLocalAudio', rawVideoService.toggleLocalAudio.bind(rawVideoService), { maxAttempts: 1 }),
  toggleLocalVideo: withErrorHandling('video', 'toggleLocalVideo', rawVideoService.toggleLocalVideo.bind(rawVideoService), { maxAttempts: 1 }),
  startScreenShare: withErrorHandling('video', 'startScreenShare', rawVideoService.startScreenShare.bind(rawVideoService), { maxAttempts: 1 }),
  stopScreenShare: withErrorHandling('video', 'stopScreenShare', rawVideoService.stopScreenShare.bind(rawVideoService), { maxAttempts: 1 }),
  getCallObject: rawVideoService.getCallObject.bind(rawVideoService),
  getActiveRooms: rawVideoService.getActiveRooms.bind(rawVideoService),
  healthCheck: withErrorHandling('video', 'healthCheck', rawVideoService.healthCheck.bind(rawVideoService), { maxAttempts: 1 }),
};

export { VideoService };
