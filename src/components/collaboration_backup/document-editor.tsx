'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Save,
  Users,
  Lock,
  Unlock,
  Download,
  Upload,
  History,
  Code,
  FileText,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSocket } from '@/lib/socket-client';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

interface DocumentEditorProps {
  roomId: string;
  documentId: string;
  userId: string;
  userName: string;
  initialContent?: string;
  language?: string;
  readOnly?: boolean;
  className?: string;
  token?: string;
}

interface Cursor {
  userId: string;
  userName: string;
  line: number;
  column: number;
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
}

interface DocumentVersion {
  id: string;
  version: number;
  content: string;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
}

const supportedLanguages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'plaintext', label: 'Plain Text' }
];

export default function DocumentEditor({
  roomId,
  documentId,
  userId,
  userName,
  initialContent = '',
  language = 'javascript',
  readOnly = false,
  className = '',
  token
}: DocumentEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [content, setContent] = useState(initialContent);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [cursors, setCursors] = useState<{ [userId: string]: Cursor }>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  
  // Yjs and collaborative editing
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  
  const socket = useSocket();

  useEffect(() => {
    initializeSocket();
    setupCollaborativeEditing();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeSocket = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      
      if (!socket.isConnected() && token) {
        await socket.connect(token);
      }
      
      setupSocketListeners();
      await socket.joinRoom(roomId);
      setConnectionStatus('connected');
      
      await loadDocument();
      await loadVersions();
      
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setConnectionStatus('disconnected');
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to document server',
        variant: 'destructive',
      });
    }
  }, [roomId, documentId, token]);

  const setupSocketListeners = useCallback(() => {
    socket.on('document-edit', (data) => {
      if (data.userId !== userId && data.documentId === documentId) {
        // Operational transforms are handled by Yjs
        // This is for additional metadata like cursors
        handleRemoteEdit(data);
      }
    });

    socket.on('document-cursor', (data) => {
      if (data.userId !== userId && data.documentId === documentId) {
        setCursors(prev => ({
          ...prev,
          [data.userId]: {
            userId: data.userId,
            userName: data.userName,
            line: data.cursor.line,
            column: data.cursor.column,
            selection: data.cursor.selection
          }
        }));
      }
    });

    socket.on('user-joined', (data) => {
      if (data.userId !== userId) {
        setConnectedUsers(prev => [...prev.filter(u => u !== data.userName), data.userName]);
        toast({
          title: 'User Joined',
          description: `${data.userName} joined the document`,
        });
      }
    });

    socket.on('user-left', (data) => {
      if (data.userId !== userId) {
        setConnectedUsers(prev => prev.filter(u => u !== data.userName));
        setCursors(prev => {
          const newCursors = { ...prev };
          delete newCursors[data.userId];
          return newCursors;
        });
        toast({
          title: 'User Left',
          description: `${data.userName} left the document`,
        });
      }
    });

    socket.on('document-saved', () => {
      setHasUnsavedChanges(false);
      toast({
        title: 'Document Saved',
        description: 'Your document has been saved successfully',
      });
    });
  }, [userId, documentId]);

  const setupCollaborativeEditing = useCallback(() => {
    // Initialize Yjs document
    ydocRef.current = new Y.Doc();
    
    // Set up WebSocket provider for real-time sync
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:1234';
    providerRef.current = new WebsocketProvider(wsUrl, `${roomId}-${documentId}`, ydocRef.current);
    
    // Handle provider events
    providerRef.current.on('status', (event: { status: string }) => {
      if (event.status === 'connected') {
        setConnectionStatus('connected');
      } else if (event.status === 'disconnected') {
        setConnectionStatus('disconnected');
      }
    });
  }, [roomId, documentId]);

  const setupMonacoBinding = useCallback(() => {
    if (!editorRef.current || !monacoRef.current || !ydocRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    
    // Get the shared text type
    const ytext = ydocRef.current.getText('content');
    
    // Create Monaco binding for collaborative editing
    bindingRef.current = new MonacoBinding(
      ytext,
      editor.getModel()!,
      new Set([editor]),
      providerRef.current?.awareness
    );

    // Set up cursor position tracking
    editor.onDidChangeCursorPosition((e: any) => {
      if (connectionStatus === 'connected') {
        const position = e.position;
        const selection = editor.getSelection();
        
        socket.updateDocumentCursor(documentId, {
          line: position.lineNumber,
          column: position.column,
          selection: selection ? {
            startLine: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLine: selection.endLineNumber,
            endColumn: selection.endColumn
          } : undefined
        });
      }
    });

    // Track content changes
    editor.onDidChangeModelContent(() => {
      setHasUnsavedChanges(true);
    });
  }, [connectionStatus, documentId]);

  const loadDocument = async () => {
    try {
      const response = await fetch(`/api/collaboration/documents/${documentId}`);
      if (response.ok) {
        const document = await response.json();
        setContent(document.content);
        setCurrentLanguage(document.language);
        setIsLocked(document.isLocked);
        setLockedBy(document.lockedBy);
      }
    } catch (error) {
      console.error('Failed to load document:', error);
      toast({
        title: 'Load Error',
        description: 'Failed to load document',
        variant: 'destructive',
      });
    }
  };

  const loadVersions = async () => {
    try {
      const response = await fetch(`/api/collaboration/documents/${documentId}/versions`);
      if (response.ok) {
        const versionData = await response.json();
        setVersions(versionData.versions);
      }
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  };

  const saveDocument = async () => {
    try {
      if (connectionStatus === 'connected' && editorRef.current) {
        const currentContent = editorRef.current.getValue();
        await socket.saveDocument(documentId, currentContent);
        await loadVersions(); // Refresh versions after save
      }
    } catch (error) {
      console.error('Failed to save document:', error);
      toast({
        title: 'Save Error',
        description: 'Failed to save document',
        variant: 'destructive',
      });
    }
  };

  const toggleLock = async () => {
    try {
      const response = await fetch(`/api/collaboration/documents/${documentId}/lock`, {
        method: isLocked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLocked(data.isLocked);
        setLockedBy(data.lockedBy);
        
        toast({
          title: isLocked ? 'Document Unlocked' : 'Document Locked',
          description: isLocked 
            ? 'Document is now available for editing by others'
            : 'Document is now locked for your exclusive editing',
        });
      }
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      toast({
        title: 'Lock Error',
        description: 'Failed to toggle document lock',
        variant: 'destructive',
      });
    }
  };

  const changeLanguage = async (newLanguage: string) => {
    try {
      const response = await fetch(`/api/collaboration/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: newLanguage })
      });
      
      if (response.ok) {
        setCurrentLanguage(newLanguage);
        toast({
          title: 'Language Changed',
          description: `Document language changed to ${newLanguage}`,
        });
      }
    } catch (error) {
      console.error('Failed to change language:', error);
      toast({
        title: 'Language Error',
        description: 'Failed to change document language',
        variant: 'destructive',
      });
    }
  };

  const exportDocument = () => {
    if (editorRef.current) {
      const content = editorRef.current.getValue();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document-${documentId}.${getFileExtension(currentLanguage)}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const getFileExtension = (lang: string): string => {
    const extensions: { [key: string]: string } = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
      css: 'css',
      json: 'json',
      markdown: 'md',
      xml: 'xml',
      yaml: 'yaml',
      plaintext: 'txt'
    };
    return extensions[lang] || 'txt';
  };

  const restoreVersion = async (versionId: string) => {
    try {
      const response = await fetch(`/api/collaboration/documents/${documentId}/versions/${versionId}/restore`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await loadDocument();
        toast({
          title: 'Version Restored',
          description: 'Document has been restored to selected version',
        });
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
      toast({
        title: 'Restore Error',
        description: 'Failed to restore document version',
        variant: 'destructive',
      });
    }
  };

  const handleRemoteEdit = (data: any) => {
    // Handle remote edit metadata
    console.log('Remote edit from:', data.userName);
  };

  const cleanup = () => {
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
    
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }
    
    socket.disconnect();
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setupMonacoBinding();
  };

  const CursorIndicator = ({ cursor }: { cursor: Cursor }) => (
    <div className="absolute text-xs bg-black text-white px-1 py-0.5 rounded pointer-events-none z-10">
      {cursor.userName}
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Collaborative Code Editor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant={connectionStatus === 'connected' ? 'secondary' : 'destructive'}
              >
                {connectionStatus === 'connected' ? 
                  <Wifi className="w-3 h-3 mr-1" /> : 
                  <WifiOff className="w-3 h-3 mr-1" />
                }
                {connectionStatus}
              </Badge>
              {isLocked && (
                <Badge variant="outline" className="text-orange-600">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked by {lockedBy === userId ? 'you' : lockedBy}
                </Badge>
              )}
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600">
                  Unsaved changes
                </Badge>
              )}
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" />
                {connectedUsers.length + 1} user{connectedUsers.length !== 0 ? 's' : ''}
              </Badge>
            </div>
          </div>
          
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Select value={currentLanguage} onValueChange={changeLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLock}
              disabled={connectionStatus !== 'connected' || (isLocked && lockedBy !== userId)}
            >
              {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={saveDocument}
              disabled={connectionStatus !== 'connected' || !hasUnsavedChanges}
            >
              <Save className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportDocument}
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersions(!showVersions)}
            >
              <History className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Editor */}
          <div className="relative h-96 border border-border rounded-lg overflow-hidden">
            <Editor
              height="100%"
              language={currentLanguage}
              value={content}
              onMount={handleEditorDidMount}
              options={{
                readOnly: readOnly || (isLocked && lockedBy !== userId),
                minimap: { enabled: true },
                fontSize: 14,
                tabSize: 2,
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                theme: 'vs-dark'
              }}
            />
            
            {/* Cursor indicators for other users */}
            {Object.values(cursors).map(cursor => (
              <CursorIndicator key={cursor.userId} cursor={cursor} />
            ))}
          </div>
          
          {/* Version history */}
          {showVersions && (
            <div className="mt-4 p-4 border-t">
              <h4 className="text-sm font-medium mb-2">Version History</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {versions.map(version => (
                  <div key={version.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                    <div>
                      <span className="font-medium">Version {version.version}</span>
                      <span className="text-muted-foreground ml-2">
                        by {version.createdByName} - {new Date(version.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => restoreVersion(version.id)}
                    >
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Connected users */}
          {connectedUsers.length > 0 && (
            <div className="mt-4 p-4 border-t">
              <h4 className="text-sm font-medium mb-2">Active Collaborators</h4>
              <div className="flex flex-wrap gap-2">
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