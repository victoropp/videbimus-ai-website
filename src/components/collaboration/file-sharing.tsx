'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  Download, 
  File, 
  Image as ImageIcon, 
  Video, 
  Music,
  FileText,
  Archive,
  X,
  Share,
  Users,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/hooks/use-toast';
import { useSocket } from '@/lib/socket-client';
import { format } from 'date-fns';

interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  downloadCount: number;
}

interface FileSharingProps {
  roomId: string;
  userId: string;
  userName: string;
  className?: string;
  token?: string;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

const DEFAULT_ALLOWED_TYPES = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/*',
  'application/json',
  'application/zip',
  'application/x-rar-compressed'
];

const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function FileSharing({
  roomId,
  userId,
  userName,
  className = '',
  token,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES
}: FileSharingProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socket = useSocket();

  useEffect(() => {
    initializeSocket();
    loadFiles();
    
    return () => {
      socket.disconnect();
    };
  }, [roomId, token]);

  const initializeSocket = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      
      if (!socket.isConnected() && token) {
        await socket.connect(token);
      }
      
      setupSocketListeners();
      await socket.joinRoom(roomId);
      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setConnectionStatus('disconnected');
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to file sharing server',
        variant: 'destructive',
      });
    }
  }, [roomId, token]);

  const setupSocketListeners = useCallback(() => {
    socket.on('file-share', (data) => {
      if (data.userId !== userId) {
        const newFile: FileInfo = {
          id: Date.now().toString(),
          name: data.fileInfo.name,
          size: data.fileInfo.size,
          type: data.fileInfo.type,
          url: data.fileInfo.url,
          uploadedBy: data.userId,
          uploadedByName: data.userName,
          uploadedAt: new Date(data.timestamp),
          downloadCount: 0
        };
        
        setFiles(prev => [newFile, ...prev]);
        
        toast({
          title: 'New File Shared',
          description: `${data.userName} shared ${data.fileInfo.name}`,
        });
      }
    });

    socket.on('user-joined', (data) => {
      if (data.userId !== userId) {
        setConnectedUsers(prev => [...prev.filter(u => u !== data.userName), data.userName]);
      }
    });

    socket.on('user-left', (data) => {
      if (data.userId !== userId) {
        setConnectedUsers(prev => prev.filter(u => u !== data.userName));
      }
    });
  }, [userId]);

  const loadFiles = async () => {
    try {
      const response = await fetch(`/api/collaboration/files?roomId=${roomId}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files.map((file: any) => ({
          ...file,
          uploadedAt: new Date(file.uploadedAt)
        })));
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const uploadFile = async (file: File) => {
    if (file.size > maxFileSize) {
      toast({
        title: 'File Too Large',
        description: `File size must be less than ${formatFileSize(maxFileSize)}`,
        variant: 'destructive',
      });
      return;
    }

    const isAllowedType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAllowedType) {
      toast({
        title: 'File Type Not Allowed',
        description: 'This file type is not supported',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      };

      // Handle completion
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const newFile: FileInfo = {
            id: response.id,
            name: file.name,
            size: file.size,
            type: file.type,
            url: response.url,
            uploadedBy: userId,
            uploadedByName: userName,
            uploadedAt: new Date(),
            downloadCount: 0
          };

          setFiles(prev => [newFile, ...prev]);

          // Share with other users
          if (connectionStatus === 'connected') {
            socket.shareFile({
              name: file.name,
              size: file.size,
              type: file.type,
              url: response.url
            });
          }

          toast({
            title: 'File Uploaded',
            description: `${file.name} has been uploaded successfully`,
          });
        } else {
          throw new Error('Upload failed');
        }
      };

      xhr.onerror = () => {
        throw new Error('Upload failed');
      };

      xhr.open('POST', '/api/collaboration/files/upload');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadFile = async (file: FileInfo) => {
    try {
      // Track download
      await fetch(`/api/collaboration/files/${file.id}/download`, {
        method: 'POST'
      });

      // Increment local download count
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, downloadCount: f.downloadCount + 1 }
          : f
      ));

      // Create download link
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const deleteFile = async (file: FileInfo) => {
    try {
      const response = await fetch(`/api/collaboration/files/${file.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== file.id));
        toast({
          title: 'File Deleted',
          description: `${file.name} has been deleted`,
        });
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      acceptedFiles.forEach(uploadFile);
    }, []),
    multiple: true,
    disabled: uploading || connectionStatus !== 'connected'
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (type === 'application/pdf' || type.startsWith('text/')) return <FileText className="w-4 h-4" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Share className="w-5 h-5" />
              File Sharing
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
              >
                {connectionStatus === 'connected' ? 
                  <Wifi className="w-3 h-3 mr-1" /> : 
                  <WifiOff className="w-3 h-3 mr-1" />
                }
                {connectionStatus}
              </Badge>
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" />
                {connectedUsers.length + 1} user{connectedUsers.length !== 0 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' 
                : 'border-gray-300 dark:border-gray-600'
            } ${uploading || connectionStatus !== 'connected' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            {uploading ? (
              <div className="space-y-2">
                <p>Uploading...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</p>
              </div>
            ) : isDragActive ? (
              <p>Drop files here to upload</p>
            ) : (
              <div>
                <p>Drag and drop files here, or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Max file size: {formatFileSize(maxFileSize)}
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Shared Files ({files.length})</h4>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.uploadedByName}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(file.uploadedAt)}</span>
                          {file.downloadCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{file.downloadCount} downloads</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(file)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {file.uploadedBy === userId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(file)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {files.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No files shared yet</p>
                    <p className="text-sm">Upload files to share with others</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Connected Users */}
          {connectedUsers.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Active Users</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{userName} (You)</Badge>
                {connectedUsers.map((user, index) => (
                  <Badge key={index} variant="secondary">
                    {user}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}