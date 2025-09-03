/**
 * Daily.co Video Service - Replaced with Jitsi Meet
 * This file is kept as a placeholder to prevent import errors
 * The actual video functionality is now handled by Jitsi Meet embed in video-conference.tsx
 */

export interface DailyConfig {
  roomUrl: string;
  token?: string;
  userName?: string;
  userData?: any;
}

export interface ParticipantData {
  session_id: string;
  user_id: string;
  user_name: string;
  joined_at: Date;
  permissions: {
    hasPresence: boolean;
    canSend: string[];
  };
  audio: boolean;
  video: boolean;
  screen?: boolean;
}

// Placeholder service to prevent import errors
// Actual video conferencing is handled by Jitsi Meet iframe
export class DailyService {
  private isInitialized = false;

  async initialize(config: DailyConfig) {
    console.log('Daily.co has been replaced with Jitsi Meet');
    this.isInitialized = true;
    return null;
  }

  async joinRoom(): Promise<void> {
    console.log('Join room - handled by Jitsi Meet iframe');
  }

  async leaveRoom(): Promise<void> {
    console.log('Leave room - handled by Jitsi Meet iframe');
  }

  async startRecording(): Promise<void> {
    console.log('Recording - handled by Jitsi Meet controls');
  }

  async stopRecording(): Promise<void> {
    console.log('Recording - handled by Jitsi Meet controls');
  }

  async startScreenShare(): Promise<void> {
    console.log('Screen share - handled by Jitsi Meet controls');
  }

  async stopScreenShare(): Promise<void> {
    console.log('Screen share - handled by Jitsi Meet controls');
  }

  async toggleAudio(): Promise<void> {
    console.log('Audio - handled by Jitsi Meet controls');
  }

  async toggleVideo(): Promise<void> {
    console.log('Video - handled by Jitsi Meet controls');
  }

  getParticipants(): { [id: string]: ParticipantData } {
    return {};
  }

  getLocalParticipant(): ParticipantData | null {
    return null;
  }

  onParticipantJoined(callback: (participant: ParticipantData) => void) {
    // Placeholder - Jitsi handles participants internally
  }

  onParticipantLeft(callback: (participant: ParticipantData) => void) {
    // Placeholder - Jitsi handles participants internally
  }

  onParticipantUpdated(callback: (participant: ParticipantData) => void) {
    // Placeholder - Jitsi handles participants internally
  }

  onRecordingStarted(callback: () => void) {
    // Placeholder - Jitsi handles recording internally
  }

  onRecordingStopped(callback: () => void) {
    // Placeholder - Jitsi handles recording internally
  }

  onError(callback: (error: any) => void) {
    // Placeholder - Jitsi handles errors internally
  }

  destroy() {
    console.log('Cleanup - Jitsi Meet iframe handles its own cleanup');
    this.isInitialized = false;
  }
}

export const dailyService = new DailyService();