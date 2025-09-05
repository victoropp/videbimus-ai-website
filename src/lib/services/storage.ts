// Optional AWS SDK imports - gracefully handle if not available
let S3Client: any = null;
let PutObjectCommand: any = null;
let DeleteObjectCommand: any = null;
let GetObjectCommand: any = null;
let HeadObjectCommand: any = null;
let ListObjectsV2Command: any = null;
let getSignedUrl: any = null;
let Upload: any = null;

try {
  const s3Client = require('@aws-sdk/client-s3');
  const s3Presigner = require('@aws-sdk/s3-request-presigner');
  const libStorage = require('@aws-sdk/lib-storage');
  
  S3Client = s3Client.S3Client;
  PutObjectCommand = s3Client.PutObjectCommand;
  DeleteObjectCommand = s3Client.DeleteObjectCommand;
  GetObjectCommand = s3Client.GetObjectCommand;
  HeadObjectCommand = s3Client.HeadObjectCommand;
  ListObjectsV2Command = s3Client.ListObjectsV2Command;
  getSignedUrl = s3Presigner.getSignedUrl;
  Upload = libStorage.Upload;
} catch (error) {
  console.warn('AWS SDK not available:', error);
}
import { getStorageConfig } from '../config/services';
import { withErrorHandling, ServiceErrorType, CustomServiceError } from './error-handler';
import { getErrorMessage, toError } from '../utils';
import crypto from 'crypto';
import path from 'path';

export interface UploadOptions {
  key?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
  acl?: 'private' | 'public-read' | 'public-read-write';
  serverSideEncryption?: boolean;
  storageClass?: 'STANDARD' | 'REDUCED_REDUNDANCY' | 'STANDARD_IA' | 'ONEZONE_IA' | 'INTELLIGENT_TIERING' | 'GLACIER' | 'DEEP_ARCHIVE';
}

export interface FileMetadata {
  key: string;
  url: string;
  cdnUrl?: string;
  size: number;
  contentType: string;
  lastModified: Date;
  etag: string;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
}

export interface PresignedUrlOptions {
  expiresIn?: number; // seconds
  responseContentType?: string;
  responseContentDisposition?: string;
}

class StorageService {
  private s3Client: any;
  private config: ReturnType<typeof getStorageConfig>;
  private bucketName: string;

  constructor() {
    this.config = getStorageConfig();
    this.bucketName = this.config.aws.bucket;
    
    if (S3Client) {
      this.s3Client = new S3Client({
        region: this.config.aws.region,
        credentials: {
          accessKeyId: this.config.aws.accessKeyId,
          secretAccessKey: this.config.aws.secretAccessKey,
        },
      requestHandler: {
        requestTimeout: this.config.aws.timeout,
      },
      });
    } else {
      console.warn('AWS SDK not available - storage service will not function');
      this.s3Client = null as any;
    }
  }

  // Generate a unique key for the file
  private generateKey(originalName: string, prefix?: string): string {
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    const key = `${sanitizedBaseName}_${timestamp}_${randomId}${extension}`;
    return prefix ? `${prefix}/${key}` : key;
  }

  // Validate file
  private validateFile(file: Buffer | Uint8Array, originalName: string): void {
    if (file.length > this.config.aws.maxFileSize) {
      throw new CustomServiceError({
        type: ServiceErrorType.VALIDATION,
        service: 'storage',
        operation: 'validateFile',
        message: `File size exceeds maximum allowed size of ${this.config.aws.maxFileSize} bytes`,
        retryable: false,
        metadata: {
          fileSize: file.length,
          maxSize: this.config.aws.maxFileSize,
          fileName: originalName,
        },
      });
    }

    // Basic file type validation based on extension
    const extension = path.extname(originalName).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
    
    if (!allowedExtensions.includes(extension)) {
      throw new CustomServiceError({
        type: ServiceErrorType.VALIDATION,
        service: 'storage',
        operation: 'validateFile',
        message: `File type not allowed: ${extension}`,
        retryable: false,
        metadata: {
          extension,
          allowedExtensions,
          fileName: originalName,
        },
      });
    }
  }

  // Upload file to S3
  async uploadFile(
    file: Buffer | Uint8Array,
    originalName: string,
    options: UploadOptions = {}
  ): Promise<FileMetadata> {
    this.validateFile(file, originalName);

    const key = options.key || this.generateKey(originalName, 'uploads');
    const contentType = options.contentType || this.detectContentType(originalName);

    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: options.metadata,
      Tagging: options.tags ? Object.entries(options.tags).map(([k, v]) => `${k}=${v}`).join('&') : undefined,
      ACL: options.acl || 'private',
      ServerSideEncryption: options.serverSideEncryption ? 'AES256' : undefined,
      StorageClass: options.storageClass || 'STANDARD',
    };

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: uploadParams,
        partSize: 5 * 1024 * 1024, // 5MB parts
        queueSize: 4,
      });

      const result = await upload.done();
      
      return {
        key,
        url: result.Location || `https://${this.bucketName}.s3.${this.config.aws.region}.amazonaws.com/${key}`,
        cdnUrl: this.config.aws.cdnUrl ? `${this.config.aws.cdnUrl}/${key}` : undefined,
        size: file.length,
        contentType,
        lastModified: new Date(),
        etag: result.ETag || '',
        metadata: options.metadata,
        tags: options.tags,
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.FILE_STORAGE,
        service: 'storage',
        operation: 'uploadFile',
        message: `Failed to upload file: ${getErrorMessage(error)}`,
        retryable: true,
        originalError: error as Error,
        metadata: {
          key,
          fileName: originalName,
          fileSize: file.length,
        },
      });
    }
  }

  // Get file metadata
  async getFileMetadata(key: string): Promise<FileMetadata> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const result = await this.s3Client.send(command);

      return {
        key,
        url: `https://${this.bucketName}.s3.${this.config.aws.region}.amazonaws.com/${key}`,
        cdnUrl: this.config.aws.cdnUrl ? `${this.config.aws.cdnUrl}/${key}` : undefined,
        size: result.ContentLength || 0,
        contentType: result.ContentType || 'application/octet-stream',
        lastModified: result.LastModified || new Date(),
        etag: result.ETag || '',
        metadata: result.Metadata,
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.FILE_STORAGE,
        service: 'storage',
        operation: 'getFileMetadata',
        message: `Failed to get file metadata: ${getErrorMessage(error)}`,
        retryable: true,
        originalError: error as Error,
        metadata: { key },
      });
    }
  }

  // Delete file from S3
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.FILE_STORAGE,
        service: 'storage',
        operation: 'deleteFile',
        message: `Failed to delete file: ${getErrorMessage(error)}`,
        retryable: true,
        originalError: error as Error,
        metadata: { key },
      });
    }
  }

  // Generate presigned URL for temporary access
  async getPresignedUrl(
    key: string,
    operation: 'get' | 'put' = 'get',
    options: PresignedUrlOptions = {}
  ): Promise<string> {
    try {
      const expiresIn = options.expiresIn || 3600; // 1 hour default

      let command;
      if (operation === 'get') {
        command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          ResponseContentType: options.responseContentType,
          ResponseContentDisposition: options.responseContentDisposition,
        });
      } else {
        command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });
      }

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.FILE_STORAGE,
        service: 'storage',
        operation: 'getPresignedUrl',
        message: `Failed to generate presigned URL: ${getErrorMessage(error)}`,
        retryable: true,
        originalError: error as Error,
        metadata: { key, operation },
      });
    }
  }

  // List files with pagination
  async listFiles(prefix?: string, maxKeys: number = 100, continuationToken?: string): Promise<{
    files: FileMetadata[];
    nextToken?: string;
    truncated: boolean;
  }> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
        ContinuationToken: continuationToken,
      });

      const result = await this.s3Client.send(command);

      const files: FileMetadata[] = (result.Contents || []).map((obj: any) => ({
        key: obj.Key!,
        url: `https://${this.bucketName}.s3.${this.config.aws.region}.amazonaws.com/${obj.Key!}`,
        cdnUrl: this.config.aws.cdnUrl ? `${this.config.aws.cdnUrl}/${obj.Key!}` : undefined,
        size: obj.Size || 0,
        contentType: 'application/octet-stream', // S3 doesn't return content-type in list operation
        lastModified: obj.LastModified || new Date(),
        etag: obj.ETag || '',
      }));

      return {
        files,
        nextToken: result.NextContinuationToken,
        truncated: result.IsTruncated || false,
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.FILE_STORAGE,
        service: 'storage',
        operation: 'listFiles',
        message: `Failed to list files: ${getErrorMessage(error)}`,
        retryable: true,
        originalError: error as Error,
        metadata: { prefix, maxKeys },
      });
    }
  }

  // Copy file within S3
  async copyFile(sourceKey: string, destinationKey: string, options: UploadOptions = {}): Promise<FileMetadata> {
    try {
      const copySource = `${this.bucketName}/${sourceKey}`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: destinationKey,
        CopySource: copySource,
        Metadata: options.metadata,
        MetadataDirective: options.metadata ? 'REPLACE' : 'COPY',
        Tagging: options.tags ? Object.entries(options.tags).map(([k, v]) => `${k}=${v}`).join('&') : undefined,
        ACL: options.acl || 'private',
        ServerSideEncryption: options.serverSideEncryption ? 'AES256' : undefined,
        StorageClass: options.storageClass || 'STANDARD',
      });

      await this.s3Client.send(command);
      
      // Get metadata for the copied file
      return await this.getFileMetadata(destinationKey);
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.FILE_STORAGE,
        service: 'storage',
        operation: 'copyFile',
        message: `Failed to copy file: ${getErrorMessage(error)}`,
        retryable: true,
        originalError: error as Error,
        metadata: { sourceKey, destinationKey },
      });
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Storage health check failed:', error);
      return false;
    }
  }

  // Detect content type from file extension
  private detectContentType(filename: string): string {
    const extension = path.extname(filename).toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.json': 'application/json',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.html': 'text/html',
      '.xml': 'application/xml',
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  // Get usage statistics
  async getUsageStats(prefix?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    lastModified?: Date;
  }> {
    try {
      let totalFiles = 0;
      let totalSize = 0;
      let lastModified: Date | undefined;
      let continuationToken: string | undefined;

      do {
        const result = await this.listFiles(prefix, 1000, continuationToken);
        totalFiles += result.files.length;
        
        result.files.forEach(file => {
          totalSize += file.size;
          if (!lastModified || file.lastModified > lastModified) {
            lastModified = file.lastModified;
          }
        });
        
        continuationToken = result.nextToken;
      } while (continuationToken);

      return {
        totalFiles,
        totalSize,
        lastModified,
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.FILE_STORAGE,
        service: 'storage',
        operation: 'getUsageStats',
        message: `Failed to get usage statistics: ${getErrorMessage(error)}`,
        retryable: true,
        originalError: error as Error,
        metadata: { prefix },
      });
    }
  }
}

// Create wrapped methods with error handling and retry logic
const rawStorageService = new StorageService();

export const storageService = {
  uploadFile: withErrorHandling('storage', 'uploadFile', rawStorageService.uploadFile.bind(rawStorageService)),
  getFileMetadata: withErrorHandling('storage', 'getFileMetadata', rawStorageService.getFileMetadata.bind(rawStorageService)),
  deleteFile: withErrorHandling('storage', 'deleteFile', rawStorageService.deleteFile.bind(rawStorageService)),
  getPresignedUrl: withErrorHandling('storage', 'getPresignedUrl', rawStorageService.getPresignedUrl.bind(rawStorageService)),
  listFiles: withErrorHandling('storage', 'listFiles', rawStorageService.listFiles.bind(rawStorageService)),
  copyFile: withErrorHandling('storage', 'copyFile', rawStorageService.copyFile.bind(rawStorageService)),
  healthCheck: withErrorHandling('storage', 'healthCheck', rawStorageService.healthCheck.bind(rawStorageService), { maxAttempts: 1 }),
  getUsageStats: withErrorHandling('storage', 'getUsageStats', rawStorageService.getUsageStats.bind(rawStorageService)),
};

export { StorageService };
