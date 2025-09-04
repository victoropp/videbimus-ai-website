'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Trash2, Download, Settings, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatSettings {
  useRAG: boolean;
  temperature: number;
  maxTokens: number;
  model: string;
  systemPrompt: string;
}

const defaultSettings: ChatSettings = {
  useRAG: true,
  temperature: 0.7,
  maxTokens: 2048,
  model: 'gpt-4-turbo-preview',
  systemPrompt: '',
};

const modelOptions = [
  { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  { value: 'blenderbot-400m', label: 'BlenderBot (HF) 🆕' },
];

export function ChatInterface() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/chat');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
        if (data.length > 0 && !currentSession) {
          setCurrentSession(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, [currentSession]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `temp-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentSession(newSession);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/ai/chat?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
        }
        toast({
          title: 'Session deleted',
          description: 'Chat session has been deleted successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete session.',
        variant: 'destructive',
      });
    }
  };

  const exportSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/ai/chat?sessionId=${sessionId}`);
      if (response.ok) {
        const session = await response.json();
        const blob = new Blob([JSON.stringify(session, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${session.title}-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export session.',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    // Add user message to current session
    let updatedSession = currentSession;
    if (!updatedSession) {
      updatedSession = {
        id: `temp-${Date.now()}`,
        title: message.slice(0, 50),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCurrentSession(updatedSession);
    }

    updatedSession.messages.push(userMessage);
    setCurrentSession({ ...updatedSession });
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: updatedSession.id.startsWith('temp-') ? undefined : updatedSession.id,
          useRAG: settings.useRAG,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          model: settings.model,
          systemPrompt: settings.systemPrompt || undefined,
          stream: false,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        const assistantMessage: Message = {
          id: result.messageId,
          role: 'assistant',
          content: result.response,
          timestamp: new Date(),
        };

        updatedSession.messages.push(assistantMessage);
        updatedSession.id = result.sessionId;
        updatedSession.updatedAt = new Date();
        
        setCurrentSession({ ...updatedSession });
        
        // Update sessions list
        const existingSessionIndex = sessions.findIndex(s => s.id === result.sessionId);
        if (existingSessionIndex >= 0) {
          const newSessions = [...sessions];
          newSessions[existingSessionIndex] = updatedSession;
          setSessions(newSessions);
        } else {
          setSessions([updatedSession, ...sessions]);
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/10">
        <div className="p-4">
          <Button onClick={createNewSession} className="w-full mb-4">
            <MessageSquare className="w-4 h-4 mr-2" />
            New Chat
          </Button>
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Chat Sessions</h3>
            <Popover open={showSettings} onOpenChange={setShowSettings}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Chat Settings</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="use-rag"
                      checked={settings.useRAG}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, useRAG: checked })
                      }
                    />
                    <Label htmlFor="use-rag">Use Knowledge Base (RAG)</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Select
                      value={settings.model}
                      onValueChange={(value) =>
                        setSettings({ ...settings, model: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {modelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Temperature: {settings.temperature}</Label>
                    <Slider
                      value={[settings.temperature]}
                      onValueChange={([value]) =>
                        setSettings({ ...settings, temperature: value })
                      }
                      min={0}
                      max={2}
                      step={0.1}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      value={settings.maxTokens}
                      onChange={(e) =>
                        setSettings({ ...settings, maxTokens: parseInt(e.target.value) })
                      }
                      min={1}
                      max={4096}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>System Prompt</Label>
                    <Textarea
                      value={settings.systemPrompt}
                      onChange={(e) =>
                        setSettings({ ...settings, systemPrompt: e.target.value })
                      }
                      placeholder="Enter custom system prompt..."
                      rows={3}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  currentSession?.id === session.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setCurrentSession(session)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">
                    {session.title}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportSession(session.id);
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {session.messages.length} messages
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            {currentSession?.title || 'AI Assistant'}
          </h2>
          {settings.useRAG && (
            <Badge variant="outline" className="mt-1">
              Knowledge Base Active
            </Badge>
          )}
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {currentSession?.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                <p className="text-muted-foreground">
                  Ask me anything about Videbimus AI or general topics.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentSession?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`max-w-[80%] ${
                    msg.role === 'user' ? 'text-right' : ''
                  }`}>
                    <Card>
                      <CardContent className="p-4">
                        {msg.role === 'user' ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <ReactMarkdown
                            components={{
                              code({ node, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !className;
                                return !isInline && match ? (
                                  <SyntaxHighlighter
                                    style={vscDarkPlus as any}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </CardContent>
                    </Card>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Bot className="w-4 h-4" />
                  </div>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <Separator />
        
        <div className="p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="min-h-[40px] resize-none"
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}