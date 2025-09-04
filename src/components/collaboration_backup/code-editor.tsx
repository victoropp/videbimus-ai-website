'use client';

import React, { useRef, useEffect, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Save,
  Download,
  Upload,
  Copy,
  Play,
  Users,
  Lock,
  Unlock,
  History,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CodeEditorProps {
  documentId: string;
  roomId: string;
  userId: string;
  userName: string;
  initialContent?: string;
  language?: string;
  onSave?: (content: string) => void;
  onContentChange?: (content: string) => void;
  className?: string;
}

interface Collaborator {
  userId: string;
  userName: string;
  color: string;
  cursorPosition?: number;
}

const supportedLanguages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: 'Plain Text' },
];

const collaboratorColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export default function CodeEditor({
  documentId,
  roomId,
  userId,
  userName,
  initialContent = '',
  language = 'javascript',
  onSave,
  onContentChange,
  className = ''
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [content, setContent] = useState(initialContent);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lineCount, setLineCount] = useState(1);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (bindingRef.current) {
      bindingRef.current.destroy();
    }
    if (providerRef.current) {
      providerRef.current.destroy();
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    setupCollaboration();
    setupEditor(editor, monaco);
  };

  const setupCollaboration = () => {
    if (!editorRef.current || !monacoRef.current) return;

    // Initialize Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Connect to WebSocket provider (you'll need to set up your own WebSocket server)
    const provider = new WebsocketProvider(
      'ws://localhost:3001', // Replace with your WebSocket server URL
      `document-${documentId}`,
      ydoc,
      {
        params: {
          userId,
          userName,
          roomId
        }
      }
    );
    providerRef.current = provider;

    // Set up Monaco binding
    const ytext = ydoc.getText('monaco');
    const binding = new MonacoBinding(
      ytext,
      editorRef.current.getModel()!,
      new Set([editorRef.current]),
      provider.awareness
    );
    bindingRef.current = binding;

    // Handle connection status
    provider.on('status', (event: any) => {
      setIsConnected(event.status === 'connected');
    });

    // Handle awareness updates (other users' cursors, selections)
    provider.awareness.on('change', () => {
      const states = Array.from(provider.awareness.getStates().entries());
      const collaboratorList: Collaborator[] = states
        .filter(([clientId, state]: [number, any]) => 
          clientId !== provider.awareness.clientID && state.user
        )
        .map(([clientId, state]: [number, any], index) => ({
          userId: state.user.userId,
          userName: state.user.userName,
          color: collaboratorColors[index % collaboratorColors.length],
          cursorPosition: state.cursor?.position
        }));
      
      setCollaborators(collaboratorList);
    });

    // Set initial awareness state
    provider.awareness.setLocalStateField('user', {
      userId,
      userName,
      color: collaboratorColors[Math.floor(Math.random() * collaboratorColors.length)]
    });

    // Initialize content if provided
    if (initialContent && ytext.length === 0) {
      ytext.insert(0, initialContent);
    }
  };

  const setupEditor = (editor: any, monaco: any) => {
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'bounded',
    });

    // Handle content changes
    editor.onDidChangeModelContent(() => {
      const newContent = editor.getValue();
      setContent(newContent);
      setHasUnsavedChanges(true);
      setLineCount(editor.getModel()?.getLineCount() || 1);
      setCharacterCount(newContent.length);
      
      if (onContentChange) {
        onContentChange(newContent);
      }
    });

    // Handle cursor position changes
    editor.onDidChangeCursorPosition((e: any) => {
      if (providerRef.current) {
        providerRef.current.awareness.setLocalStateField('cursor', {
          position: e.position,
          selection: editor.getSelection()
        });
      }
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setCurrentLanguage(newLanguage);
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      monacoRef.current.editor.setModelLanguage(model, newLanguage);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(content);
      setHasUnsavedChanges(false);
      toast({
        title: 'Document Saved',
        description: 'Your changes have been saved successfully',
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copied',
        description: 'Document content copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy content to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${documentId}.${getFileExtension(currentLanguage)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (lang: string): string => {
    const extensions: { [key: string]: string } = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      csharp: 'cs',
      php: 'php',
      go: 'go',
      rust: 'rs',
      sql: 'sql',
      html: 'html',
      css: 'css',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      markdown: 'md',
      plaintext: 'txt'
    };
    return extensions[lang] || 'txt';
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.trigger('format', 'editor.action.formatDocument');
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Code Collaboration</CardTitle>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600">
                  Unsaved changes
                </Badge>
              )}
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              {collaborators.length > 0 && (
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  {collaborators.length + 1} user{collaborators.length !== 0 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-muted rounded-lg">
            {/* Language selector */}
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32">
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

            {/* Actions */}
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={handleSave} disabled={!hasUnsavedChanges}>
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={formatCode}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Lines: {lineCount}</span>
              <span>Characters: {characterCount}</span>
            </div>
          </div>

          {/* Collaborators */}
          {collaborators.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Active collaborators:</span>
                {collaborators.map((collaborator) => (
                  <Badge
                    key={collaborator.userId}
                    variant="outline"
                    style={{ 
                      borderColor: collaborator.color,
                      color: collaborator.color
                    }}
                  >
                    {collaborator.userName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Editor
              height="500px"
              language={currentLanguage}
              theme="vs"
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                lineNumbers: 'on',
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'bounded',
                readOnly: isLocked
              }}
            />
          </div>

          {/* Instructions */}
          <div className="mt-4 text-sm text-muted-foreground">
            <p>• Changes are synchronized with other participants in real-time</p>
            <p>• You can see other users' cursors and selections</p>
            <p>• Use Ctrl/Cmd + S to save your changes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}