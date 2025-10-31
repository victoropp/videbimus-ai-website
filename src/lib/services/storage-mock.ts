/**
 * Mock Storage Service for deployment without AWS SDK
 * This provides a compatible interface without actual cloud storage
 */

import { withErrorHandling, ServiceErrorType } from './error-handler';
import crypto from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';

export interface StorageConfig {
  provider: 'local' | 's3' | 'gcs' | 'azure';
  bucket?: string;
  region?: string;
  localPath?: string;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType?: string;
  etag?: string;
}

export interface StorageObject {
  key: string;
  lastModified: Date;
  size: number;
  etag?: string;
  contentType?: string;
}

class MockStorageService {
  private config: StorageConfig;
  private uploadedFiles: Map<string, StorageObject>;

  constructor() {
    this.config = {
      provider: 'local',
      localPath: '/tmp/uploads'
    };
    this.uploadedFiles = new Map();
  }

  // Initialize storage (mock)
  async initialize(): Promise<void> {
    console.log('Mock storage service initialized');
    return Promise.resolve();
  }

  // Upload file (mock)
  async uploadFile(
    buffer: Buffer,
    key: string,
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
      public?: boolean;
    }
  ): Promise<UploadResult> {
    return withErrorHandling(
      'storage',
      'upload',
      async () => {
        const etag = crypto.createHash('md5').update(buffer).digest('hex');

        // Store file metadata in memory (mock)
        const storageObject: StorageObject = {
          key,
          lastModified: new Date(),
          size: buffer.length,
          etag,
          contentType: options?.contentType
        };

        this.uploadedFiles.set(key, storageObject);

        return {
          key,
          url: `/mock-storage/${key}`,
          size: buffer.length,
          contentType: options?.contentType,
          etag
        };
      }
    )();
  }

  // Upload stream (mock)
  async uploadStream(
    stream: NodeJS.ReadableStream,
    key: string,
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
      public?: boolean;
    }
  ): Promise<UploadResult> {
    return this.uploadFile(Buffer.from('mock-stream-data'), key, options);
  }

  // Download file (mock)
  async downloadFile(key: string): Promise<Buffer> {
    return withErrorHandling(
      'storage',
      'download',
      async () => {
        const file = this.uploadedFiles.get(key);
        if (!file) {
          throw new Error(`File not found: ${key}`);
        }

        // Return mock data
        return Buffer.from(`Mock content for ${key}`);
      }
    )();
  }

  // Get download stream (mock)
  async getDownloadStream(key: string): Promise<NodeJS.ReadableStream> {
    const { Readable } = await import('stream');
    const buffer = await this.downloadFile(key);
    return Readable.from(buffer);
  }

  // Delete file (mock)
  async deleteFile(key: string): Promise<void> {
    return withErrorHandling(
      'storage',
      'delete',
      async () => {
        this.uploadedFiles.delete(key);
      }
    )();
  }

  // List files (mock)
  async listFiles(prefix?: string): Promise<StorageObject[]> {
    return withErrorHandling(
      'storage',
      'list',
      async () => {
        const files = Array.from(this.uploadedFiles.values());

        if (prefix) {
          return files.filter(file => file.key.startsWith(prefix));
        }

        return files;
      }
    )();
  }

  // Check if file exists (mock)
  async fileExists(key: string): Promise<boolean> {
    return withErrorHandling(
      'storage',
      'exists',
      async () => {
        return this.uploadedFiles.has(key);
      }
    )();
  }

  // Get file metadata (mock)
  async getFileMetadata(key: string): Promise<StorageObject> {
    return withErrorHandling(
      'storage',
      'metadata',
      async () => {
        const file = this.uploadedFiles.get(key);
        if (!file) {
          throw new Error(`File not found: ${key}`);
        }
        return file;
      }
    )();
  }

  // Generate signed URL (mock)
  async generateSignedUrl(
    key: string,
    expiresIn: number = 3600,
    operation: 'get' | 'put' = 'get'
  ): Promise<string> {
    return withErrorHandling(
      'storage',
      'signed-url',
      async () => {
        const timestamp = Date.now();
        const expires = timestamp + (expiresIn * 1000);
        const signature = crypto
          .createHash('sha256')
          .update(`${key}-${expires}-${operation}`)
          .digest('hex');

        return `/mock-signed/${key}?signature=${signature}&expires=${expires}&operation=${operation}`;
      }
    )();
  }

  // Copy file (mock)
  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    return withErrorHandling(
      'storage',
      'copy',
      async () => {
        const file = this.uploadedFiles.get(sourceKey);
        if (!file) {
          throw new Error(`Source file not found: ${sourceKey}`);
        }

        const copiedFile = { ...file, key: destinationKey };
        this.uploadedFiles.set(destinationKey, copiedFile);
      }
    )();
  }

  // Move file (mock)
  async moveFile(sourceKey: string, destinationKey: string): Promise<void> {
    await this.copyFile(sourceKey, destinationKey);
    await this.deleteFile(sourceKey);
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
        message: 'Mock storage service is operational'
      };
    } catch (error: any) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        message: `Health check failed: ${error.message}`
      };
    }
  }

  // Get storage usage (mock)
  async getStorageUsage(): Promise<{
    totalSize: number;
    fileCount: number;
    largestFile?: StorageObject;
  }> {
    const files = Array.from(this.uploadedFiles.values());
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const largestFile = files.sort((a, b) => b.size - a.size)[0];
    
    return {
      totalSize,
      fileCount: files.length,
      largestFile
    };
  }
}

// Export singleton instance
export const storageService = new MockStorageService();

// Export class for typing
export const StorageService = MockStorageService;