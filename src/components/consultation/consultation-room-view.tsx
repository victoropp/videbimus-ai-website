'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  FileText, 
  Users, 
  Video, 
  Mic, 
  MicOff,
  VideoOff,
  Share,
  Settings,
  MoreVertical,
  Send,
  Paperclip,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Edit,
  Trash2,
  Download,
  Eye,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { api } from '@/lib/trpc/react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import type { ConsultationRoom, ConsultationMessage, ConsultationDocument, ConsultationActionItem } from '@prisma/client'

interface ConsultationRoomViewProps {
  room: ConsultationRoom & {
    client: {
      name: string | null
      email: string
      image: string | null
      role: string
    }
    consultant: {
      name: string | null
      email: string
      image: string | null
      role: string
    }
    consultation?: any
    messages: (ConsultationMessage & {
      sender: {
        name: string | null
        email: string
        image: string | null
      }
    })[]
    documents: (ConsultationDocument & {
      uploader: {
        name: string | null
        email: string
      } | null
    })[]
    actionItems: (ConsultationActionItem & {
      assignee: {
        name: string | null
        email: string
      } | null
      creator: {
        name: string | null
        email: string
      } | null
    })[]
    whiteboards: any[]
    participants: any[]
    analytics?: any
  }
  currentUser: {
    id: string
    name?: string | null
    email?: string | null
  }
}

export function ConsultationRoomView({ room, currentUser }: ConsultationRoomViewProps) {
  const [activeTab, setActiveTab] = useState('chat')
  const [messageInput, setMessageInput] = useState('')
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // TRPC mutations
  const sendMessage = api.consultation.sendMessage.useMutation({
    onSuccess: () => {
      setMessageInput('')
      scrollToBottom()
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const createDocument = api.consultation.createDocument.useMutation({
    onSuccess: () => {
      toast({
        title: 'Document created',
        description: 'Document has been added to the room.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Failed to create document',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const createActionItem = api.consultation.createActionItem.useMutation({
    onSuccess: () => {
      toast({
        title: 'Action item created',
        description: 'Action item has been added to the room.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Failed to create action item',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [room.messages])

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return

    try {
      await sendMessage.mutateAsync({
        roomId: room.id,
        content: messageInput.trim(),
      })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionItemPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{room.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(room.status)}>
                  {room.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  {room.roomType} room
                </span>
                {room.scheduledAt && (
                  <span className="text-sm text-gray-500">
                    • {format(new Date(room.scheduledAt), 'MMM d, h:mm a')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Video Controls */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={isVideoEnabled ? "primary" : "ghost"}
                size="sm"
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              >
                {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button
                variant={isAudioEnabled ? "primary" : "ghost"}
                size="sm"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              >
                {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button
                variant={isScreenSharing ? "primary" : "ghost"}
                size="sm"
                onClick={() => setIsScreenSharing(!isScreenSharing)}
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Room Settings</DropdownMenuItem>
                <DropdownMenuItem>Invite Participants</DropdownMenuItem>
                <DropdownMenuItem>Recording Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Video/Screen Share Area */}
          <div className="bg-gray-900 text-white p-4 flex-1 min-h-[300px] flex items-center justify-center">
            {isScreenSharing ? (
              <div className="text-center">
                <Share className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                <p className="text-lg">Screen sharing active</p>
                <p className="text-gray-400">Participants can see your screen</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
                {/* Current User Video */}
                <div className="bg-gray-800 rounded-lg p-4 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-2">
                      <AvatarImage src={currentUser.name ? '' : undefined} />
                      <AvatarFallback>
                        {currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-gray-300">
                      {currentUser.name || currentUser.email} (You)
                    </p>
                  </div>
                </div>

                {/* Other Participant Video */}
                <div className="bg-gray-800 rounded-lg p-4 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-2">
                      <AvatarImage src={
                        currentUser.id === room.clientId 
                          ? room.consultant.image || undefined
                          : room.client.image || undefined
                      } />
                      <AvatarFallback>
                        {currentUser.id === room.clientId 
                          ? room.consultant.name?.charAt(0) || 'C'
                          : room.client.name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-gray-300">
                      {currentUser.id === room.clientId 
                        ? room.consultant.name || room.consultant.email
                        : room.client.name || room.client.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Files
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Actions
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col m-4 mt-2">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {room.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    room.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.senderId !== currentUser.id && (
                          <Avatar className="h-6 w-6 mt-1">
                            <AvatarImage src={message.sender.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {message.sender.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] ${
                            message.senderId === currentUser.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          } rounded-lg px-3 py-2`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {format(new Date(message.createdAt), 'h:mm a')}
                          </p>
                        </div>
                        {message.senderId === currentUser.id && (
                          <Avatar className="h-6 w-6 mt-1">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                              {currentUser.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendMessage.isPending}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <Paperclip className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessage.isPending}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="flex-1 m-4 mt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Documents ({room.documents.length})</h3>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <ScrollArea className="h-[400px]">
                  {room.documents.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No documents yet</p>
                      <p className="text-sm">Upload files to share with participants</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {room.documents.map((doc) => (
                        <Card key={doc.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{doc.title}</h4>
                              {doc.description && (
                                <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span>
                                  {doc.uploader?.name || 'Unknown'}
                                </span>
                                <span>•</span>
                                <span>
                                  {format(new Date(doc.createdAt), 'MMM d')}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  v{doc.version}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions" className="flex-1 m-4 mt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Action Items ({room.actionItems.length})</h3>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <ScrollArea className="h-[400px]">
                  {room.actionItems.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No action items yet</p>
                      <p className="text-sm">Create tasks to track follow-ups</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {room.actionItems.map((item) => (
                        <Card key={item.id} className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm flex-1">{item.title}</h4>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getActionItemPriorityColor(item.priority)}`}
                              >
                                {item.priority}
                              </Badge>
                            </div>
                            
                            {item.description && (
                              <p className="text-xs text-gray-600">{item.description}</p>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-2">
                                {item.assignee && (
                                  <span>Assigned to {item.assignee.name}</span>
                                )}
                                {item.dueDate && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Due {format(new Date(item.dueDate), 'MMM d')}
                                    </span>
                                  </>
                                )}
                              </div>
                              <Badge
                                variant={item.status === 'completed' ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {item.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}