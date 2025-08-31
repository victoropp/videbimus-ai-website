import DailyIframe from '@daily-co/daily-js';

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

export class DailyService {
  private callObject: any;
  private isInitialized = false;

  constructor() {
    this.callObject = null;
  }

  async initialize(config: DailyConfig) {
    if (this.isInitialized) {
      return this.callObject;
    }

    try {
      this.callObject = DailyIframe.createCallObject({
        url: config.roomUrl,
        token: config.token,
        userName: config.userName,
        userData: config.userData,
      });

      this.isInitialized = true;
      return this.callObject;
    } catch (error) {
      console.error('Failed to initialize Daily:', error);
      throw error;
    }
  }

  async joinRoom(): Promise<void> {
    if (!this.callObject) {
      throw new Error('Daily not initialized');
    }

    try {
      await this.callObject.join();
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }

  async leaveRoom(): Promise<void> {
    if (!this.callObject) {
      return;
    }

    try {
      await this.callObject.leave();
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  }

  async startRecording(): Promise<void> {
    if (!this.callObject) {
      throw new Error('Daily not initialized');
    }

    try {
      await this.callObject.startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<void> {
    if (!this.callObject) {
      throw new Error('Daily not initialized');
    }

    try {
      await this.callObject.stopRecording();
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  async startScreenShare(): Promise<void> {
    if (!this.callObject) {
      throw new Error('Daily not initialized');
    }

    try {
      await this.callObject.startScreenShare();
    } catch (error) {
      console.error('Failed to start screen share:', error);
      throw error;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.callObject) {
      throw new Error('Daily not initialized');
    }

    try {
      await this.callObject.stopScreenShare();
    } catch (error) {
      console.error('Failed to stop screen share:', error);
      throw error;
    }
  }

  async toggleAudio(): Promise<void> {
    if (!this.callObject) {
      throw new Error('Daily not initialized');
    }

    try {
      const localAudio = this.callObject.localAudio();
      await this.callObject.setLocalAudio(!localAudio);
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      throw error;
    }
  }

  async toggleVideo(): Promise<void> {
    if (!this.callObject) {
      throw new Error('Daily not initialized');
    }

    try {
      const localVideo = this.callObject.localVideo();
      await this.callObject.setLocalVideo(!localVideo);
    } catch (error) {
      console.error('Failed to toggle video:', error);
      throw error;
    }
  }

  getParticipants(): { [id: string]: ParticipantData } {
    if (!this.callObject) {
      return {};
    }

    return this.callObject.participants();
  }

  getLocalParticipant(): ParticipantData | null {
    if (!this.callObject) {
      return null;
    }

    const participants = this.callObject.participants();
    return participants.local || null;
  }

  onParticipantJoined(callback: (participant: ParticipantData) => void) {
    if (this.callObject) {
      this.callObject.on('participant-joined', callback);
    }
  }

  onParticipantLeft(callback: (participant: ParticipantData) => void) {
    if (this.callObject) {
      this.callObject.on('participant-left', callback);
    }
  }

  onParticipantUpdated(callback: (participant: ParticipantData) => void) {
    if (this.callObject) {
      this.callObject.on('participant-updated', callback);
    }
  }

  onRecordingStarted(callback: () => void) {
    if (this.callObject) {
      this.callObject.on('recording-started', callback);
    }
  }

  onRecordingStopped(callback: () => void) {
    if (this.callObject) {
      this.callObject.on('recording-stopped', callback);
    }
  }

  onError(callback: (error: any) => void) {
    if (this.callObject) {
      this.callObject.on('error', callback);
    }
  }

  destroy() {
    if (this.callObject) {
      this.callObject.destroy();
      this.callObject = null;
      this.isInitialized = false;
    }
  }
}

export const dailyService = new DailyService();