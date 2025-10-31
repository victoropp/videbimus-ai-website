/**
 * Mock Video Service for deployment
 * This provides a compatible interface without actual video processing
 */

import { withErrorHandling, ServiceErrorType } from './error-handler';

export interface VideoConfig {
  provider: 'local' | 'cloudinary' | 'aws' | 'azure';
  quality?: 'low' | 'medium' | 'high';
  maxDuration?: number;
}

export interface VideoProcessingResult {
  videoId: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  size: number;
  format: string;
}

export interface VideoMetadata {
  videoId: string;
  duration: number;
  width: number;
  height: number;
  format: string;
  size: number;
  createdAt: Date;
}

class MockVideoService {
  private config: VideoConfig;
  private processedVideos: Map<string, VideoMetadata>;

  constructor() {
    this.config = {
      provider: 'local',
      quality: 'medium',
      maxDuration: 3600
    };
    this.processedVideos = new Map();
  }

  // Initialize video service (mock)
  async initialize(): Promise<void> {
    console.log('Mock video service initialized');
    return Promise.resolve();
  }

  // Upload and process video (mock)
  async uploadVideo(
    buffer: Buffer,
    filename: string,
    options?: {
      quality?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<VideoProcessingResult> {
    return withErrorHandling(
      'video',
      'upload',
      async () => {
        const videoId = `video_${Date.now()}`;

        // Store video metadata in memory (mock)
        const metadata: VideoMetadata = {
          videoId,
          duration: 120, // Mock 2 minutes
          width: 1920,
          height: 1080,
          format: 'mp4',
          size: buffer.length,
          createdAt: new Date()
        };

        this.processedVideos.set(videoId, metadata);

        return {
          videoId,
          url: `/mock-videos/${videoId}.mp4`,
          thumbnailUrl: `/mock-videos/${videoId}_thumb.jpg`,
          duration: metadata.duration,
          size: buffer.length,
          format: metadata.format
        };
      }
    )();
  }

  // Get video metadata (mock)
  async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
    return withErrorHandling(
      'video',
      'metadata',
      async () => {
        const video = this.processedVideos.get(videoId);
        if (!video) {
          throw new Error(`Video not found: ${videoId}`);
        }
        return video;
      }
    )();
  }

  // Delete video (mock)
  async deleteVideo(videoId: string): Promise<void> {
    return withErrorHandling(
      'video',
      'delete',
      async () => {
        this.processedVideos.delete(videoId);
      }
    )();
  }

  // Generate thumbnail (mock)
  async generateThumbnail(videoId: string, timestamp: number = 0): Promise<string> {
    return withErrorHandling(
      'video',
      'thumbnail',
      async () => {
        const video = this.processedVideos.get(videoId);
        if (!video) {
          throw new Error(`Video not found: ${videoId}`);
        }

        return `/mock-videos/${videoId}_thumb_${timestamp}.jpg`;
      }
    )();
  }

  // Get video URL (mock)
  async getVideoUrl(videoId: string, expiresIn: number = 3600): Promise<string> {
    return withErrorHandling(
      'video',
      'url',
      async () => {
        const video = this.processedVideos.get(videoId);
        if (!video) {
          throw new Error(`Video not found: ${videoId}`);
        }

        const expires = Date.now() + (expiresIn * 1000);
        return `/mock-videos/${videoId}.mp4?expires=${expires}`;
      }
    )();
  }

  // Health check
  async healthCheck(): Promise<{ healthy: boolean; latency: number; message?: string }> {
    const startTime = Date.now();

    try {
      // Mock health check - always returns healthy
      const latency = Date.now() - startTime;

      return {
        healthy: true,
        latency,
        message: 'Mock video service is operational'
      };
    } catch (error: any) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        message: `Health check failed: ${error.message}`
      };
    }
  }

  // Get video statistics (mock)
  async getVideoStats(): Promise<{
    totalVideos: number;
    totalDuration: number;
    totalSize: number;
  }> {
    const videos = Array.from(this.processedVideos.values());
    const totalDuration = videos.reduce((sum, video) => sum + video.duration, 0);
    const totalSize = videos.reduce((sum, video) => sum + video.size, 0);

    return {
      totalVideos: videos.length,
      totalDuration,
      totalSize
    };
  }
}

// Export singleton instance
export const videoService = new MockVideoService();

// Export class for typing
export const VideoService = MockVideoService;
