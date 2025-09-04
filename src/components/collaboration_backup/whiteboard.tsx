'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Pen,
  Eraser,
  Square,
  Circle,
  Type,
  MousePointer,
  Undo,
  Redo,
  Trash2,
  Download,
  Upload,
  Palette,
  Save,
  Users,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSocket } from '@/lib/socket-client';

interface WhiteboardProps {
  roomId: string;
  userId: string;
  userName: string;
  onSave?: (data: string) => void;
  initialData?: string;
  className?: string;
  token?: string;
}

type DrawingTool = 'select' | 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text';

interface Cursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
}

export default function Whiteboard({
  roomId,
  userId,
  userName,
  onSave,
  initialData,
  className = '',
  token
}: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [cursors, setCursors] = useState<{ [userId: string]: Cursor }>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false);
  const socket = useSocket();

  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
  ];

  useEffect(() => {
    initializeCanvas();
    initializeSocket();
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (token && roomId) {
      initializeSocket();
    }
  }, [token, roomId]);

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
        description: 'Failed to connect to whiteboard server',
        variant: 'destructive',
      });
    }
  }, [roomId, token]);

  const setupSocketListeners = useCallback(() => {
    socket.on('whiteboard-draw', (data) => {
      if (data.userId !== userId) {
        handleRemoteDrawing(data.drawingData);
      }
    });

    socket.on('whiteboard-clear', (data) => {
      if (data.userId !== userId) {
        handleRemoteClear();
      }
    });

    socket.on('cursor-move', (data) => {
      if (data.userId !== userId) {
        setCursors(prev => ({
          ...prev,
          [data.userId]: {
            userId: data.userId,
            userName: data.userName,
            x: data.x,
            y: data.y,
            color: strokeColor
          }
        }));
      }
    });

    socket.on('user-joined', (data) => {
      if (data.userId !== userId) {
        setConnectedUsers(prev => [...prev.filter(u => u !== data.userName), data.userName]);
        toast({
          title: 'User Joined',
          description: `${data.userName} joined the whiteboard`,
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
          description: `${data.userName} left the whiteboard`,
        });
      }
    });

    socket.on('whiteboard-saved', () => {
      setHasUnsavedChanges(false);
      toast({
        title: 'Whiteboard Saved',
        description: 'Your whiteboard has been saved successfully',
      });
    });
  }, [userId, strokeColor]);

  useEffect(() => {
    if (initialData && fabricCanvasRef.current) {
      loadCanvasData(initialData);
    }
  }, [initialData]);

  const initializeCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      selection: activeTool === 'select'
    });

    fabricCanvasRef.current = canvas;

    // Set up event listeners
    canvas.on('path:created', handlePathCreated);
    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:down', () => setIsDrawing(true));
    canvas.on('mouse:up', () => setIsDrawing(false));

    // Configure drawing brush
    configureBrush();
  };

  const configureBrush = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === 'pen';
    
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = strokeColor;
      canvas.freeDrawingBrush.width = strokeWidth;
    }

    canvas.selection = activeTool === 'select';
    canvas.forEachObject(obj => {
      obj.selectable = activeTool === 'select';
    });
  };

  const handlePathCreated = (e: any) => {
    if (!isRemoteUpdate) {
      setHasUnsavedChanges(true);
      broadcastDrawing();
    }
  };

  const handleObjectAdded = () => {
    if (!isRemoteUpdate) {
      setHasUnsavedChanges(true);
      broadcastDrawing();
    }
  };

  const handleObjectModified = () => {
    if (!isRemoteUpdate) {
      setHasUnsavedChanges(true);
      broadcastDrawing();
    }
  };

  const handleMouseMove = (e: any) => {
    if (!e.e) return;

    const pointer = fabricCanvasRef.current?.getPointer(e.e);
    if (pointer && connectionStatus === 'connected') {
      socket.moveCursor(pointer.x, pointer.y);
    }
  };

  const broadcastDrawing = useCallback(() => {
    if (connectionStatus === 'connected' && fabricCanvasRef.current) {
      const canvasData = fabricCanvasRef.current.toJSON();
      socket.drawOnWhiteboard(canvasData);
    }
  }, [connectionStatus]);

  const handleRemoteDrawing = useCallback((drawingData: any) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setIsRemoteUpdate(true);
    canvas.loadFromJSON(drawingData, () => {
      canvas.renderAll();
      setIsRemoteUpdate(false);
    });
  }, []);

  const handleRemoteClear = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setIsRemoteUpdate(true);
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
    setIsRemoteUpdate(false);
  }, []);

  const setTool = (tool: DrawingTool) => {
    setActiveTool(tool);
    
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    switch (tool) {
      case 'select':
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.forEachObject(obj => {
          obj.selectable = true;
        });
        break;
      case 'pen':
        canvas.isDrawingMode = true;
        canvas.selection = false;
        configureBrush();
        break;
      case 'eraser':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = '#ffffff';
        break;
      case 'rectangle':
        canvas.isDrawingMode = false;
        canvas.selection = false;
        addRectangle();
        break;
      case 'circle':
        canvas.isDrawingMode = false;
        canvas.selection = false;
        addCircle();
        break;
      case 'text':
        canvas.isDrawingMode = false;
        canvas.selection = false;
        addText();
        break;
    }
  };

  const addRectangle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: 'transparent',
      stroke: strokeColor,
      strokeWidth: strokeWidth
    });

    canvas.add(rect);
    setHasUnsavedChanges(true);
  };

  const addCircle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: 'transparent',
      stroke: strokeColor,
      strokeWidth: strokeWidth
    });

    canvas.add(circle);
    setHasUnsavedChanges(true);
  };

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.IText('Click to edit', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: strokeColor
    });

    canvas.add(text);
    setHasUnsavedChanges(true);
  };

  const undo = () => {
    // Implement undo functionality
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1]);
      setHasUnsavedChanges(true);
    }
  };

  const clear = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    setHasUnsavedChanges(true);
    
    if (connectionStatus === 'connected') {
      socket.clearWhiteboard();
    }
  };

  const saveCanvas = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      const canvasData = canvas.toJSON();
      
      if (connectionStatus === 'connected') {
        await socket.saveWhiteboard(canvasData);
      }
      
      if (onSave) {
        onSave(JSON.stringify(canvasData));
      }
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save whiteboard:', error);
      toast({
        title: 'Save Error',
        description: 'Failed to save whiteboard',
        variant: 'destructive',
      });
    }
  };

  const loadCanvasData = (data: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      canvas.loadFromJSON(data, () => {
        canvas.renderAll();
        setHasUnsavedChanges(false);
      });
    } catch (error) {
      console.error('Failed to load canvas data:', error);
      toast({
        title: 'Load Error',
        description: 'Failed to load whiteboard data',
        variant: 'destructive',
      });
    }
  };

  const exportCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1.0
    });

    // Create download link
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `whiteboard-${roomId}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CursorIndicator = ({ cursor }: { cursor: Cursor }) => (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: cursor.x,
        top: cursor.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div
        className="w-3 h-3 rounded-full border-2 border-white"
        style={{ backgroundColor: cursor.color }}
      />
      <div className="bg-black text-white px-2 py-1 rounded text-xs mt-1 whitespace-nowrap">
        {cursor.userName}
      </div>
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Collaborative Whiteboard</CardTitle>
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
        </CardHeader>
        <CardContent>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
            {/* Tools */}
            <div className="flex gap-1">
              <Button
                variant={activeTool === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('select')}
              >
                <MousePointer className="w-4 h-4" />
              </Button>
              <Button
                variant={activeTool === 'pen' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('pen')}
              >
                <Pen className="w-4 h-4" />
              </Button>
              <Button
                variant={activeTool === 'eraser' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('eraser')}
              >
                <Eraser className="w-4 h-4" />
              </Button>
              <Button
                variant={activeTool === 'rectangle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('rectangle')}
              >
                <Square className="w-4 h-4" />
              </Button>
              <Button
                variant={activeTool === 'circle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('circle')}
              >
                <Circle className="w-4 h-4" />
              </Button>
              <Button
                variant={activeTool === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('text')}
              >
                <Type className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Colors */}
            <div className="flex items-center gap-1">
              <Palette className="w-4 h-4" />
              {colors.map(color => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 ${
                    strokeColor === color ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setStrokeColor(color)}
                />
              ))}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Stroke width */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-16"
              />
              <span className="text-xs w-6">{strokeWidth}px</span>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Actions */}
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={undo}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={clear}>
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={saveCanvas}
                disabled={connectionStatus !== 'connected'}
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={exportCanvas}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Canvas container */}
          <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-white">
            <canvas ref={canvasRef} />
            
            {/* Cursor indicators for other users */}
            {Object.values(cursors).map(cursor => (
              <CursorIndicator key={cursor.userId} cursor={cursor} />
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-4 text-sm text-muted-foreground">
            <p>• Select a tool from the toolbar and start drawing</p>
            <p>• Your changes are synchronized with other participants in real-time</p>
            <p>• Use the save button to persist your whiteboard</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}