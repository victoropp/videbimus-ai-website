'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Edit, 
  Trash2, 
  Video,
  MessageSquare,
  CheckCircle,
  XCircle,
  RotateCcw,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/trpc/react'
import { Consultation, ConsultationStatus } from '@/types/consultation'

interface ConsultationViewProps {
  consultation: Consultation & {
    user: {
      name: string | null
      email: string
      image: string | null
    }
    project?: {
      title: string
    } | null
    room?: {
      id: string
      status: string
      client: {
        name: string | null
        email: string
        image: string | null
      }
      consultant: {
        name: string | null
        email: string
        image: string | null
      }
      _count: {
        messages: number
        documents: number
        actionItems: number
      }
    } | null
    files: any[]
  }
  currentUser: {
    id: string
    name?: string | null
    email?: string | null
  }
}

export function ConsultationView({ consultation, currentUser }: ConsultationViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const updateConsultation = api.consultation.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Consultation Updated',
        description: 'Consultation has been updated successfully.',
      })
      window.location.reload()
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const deleteConsultation = api.consultation.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Consultation Deleted',
        description: 'Consultation has been deleted successfully.',
      })
      window.location.href = '/consultation'
    },
    onError: (error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'RESCHEDULED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DISCOVERY':
        return 'bg-purple-100 text-purple-800'
      case 'STRATEGY':
        return 'bg-indigo-100 text-indigo-800'
      case 'TECHNICAL':
        return 'bg-blue-100 text-blue-800'
      case 'REVIEW':
        return 'bg-orange-100 text-orange-800'
      case 'TRAINING':
        return 'bg-green-100 text-green-800'
      case 'FOLLOW_UP':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStatusChange = async (newStatus: ConsultationStatus) => {
    try {
      await updateConsultation.mutateAsync({
        id: consultation.id,
        status: newStatus,
        ...(newStatus === 'COMPLETED' && { completedAt: new Date() }),
      })
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this consultation? This action cannot be undone.')) {
      try {
        await deleteConsultation.mutateAsync({ id: consultation.id })
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {consultation.title}
            </h1>
            <Badge className={getStatusColor(consultation.status)}>
              {consultation.status}
            </Badge>
            <Badge className={getTypeColor(consultation.type)}>
              {consultation.type}
            </Badge>
          </div>
          {consultation.description && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {consultation.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {consultation.status === 'SCHEDULED' && (
            <>
              <Button
                onClick={() => handleStatusChange('IN_PROGRESS')}
                disabled={updateConsultation.isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Start Session
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('RESCHEDULED')}
                disabled={updateConsultation.isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
            </>
          )}
          
          {consultation.status === 'IN_PROGRESS' && (
            <Button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={updateConsultation.isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Session
            </Button>
          )}

          {(consultation.status === 'SCHEDULED' || consultation.status === 'IN_PROGRESS') && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange('CANCELLED')}
              disabled={updateConsultation.isLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>

          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleteConsultation.isLoading}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Consultation Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Consultation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Scheduled For</p>
                      <p className="text-sm text-gray-900">
                        {consultation.scheduledAt 
                          ? format(new Date(consultation.scheduledAt), 'EEEE, MMMM do, yyyy \'at\' h:mm a')
                          : 'Not scheduled'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Duration</p>
                      <p className="text-sm text-gray-900">
                        {consultation.duration ? `${consultation.duration} minutes` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Client</p>
                      <p className="text-sm text-gray-900">
                        {consultation.user.name || consultation.user.email}
                      </p>
                    </div>
                  </div>

                  {consultation.project && (
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Project</p>
                        <p className="text-sm text-gray-900">
                          {consultation.project.title}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {consultation.notes && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {consultation.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consultation Room */}
          {consultation.room && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Consultation Room
                </CardTitle>
                <CardDescription>
                  Collaborative workspace for this consultation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{consultation.room.id}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(consultation.room.status)}>
                          {consultation.room.status}
                        </Badge>
                      </div>
                    </div>
                    <Link href={`/consultation/rooms/${consultation.room.id}`}>
                      <Button>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Enter Room
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                      <p className="font-medium">{consultation.room._count.messages}</p>
                      <p className="text-gray-500">Messages</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                      <p className="font-medium">{consultation.room._count.documents}</p>
                      <p className="text-gray-500">Documents</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                      <p className="font-medium">{consultation.room._count.actionItems}</p>
                      <p className="text-gray-500">Action Items</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">
                          {consultation.room.client.name || 'Client'}
                        </span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">
                          {consultation.room.consultant.name || 'Consultant'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Files */}
          {consultation.files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attached Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consultation.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{file.originalName}</p>
                          <p className="text-sm text-gray-500">
                            {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(consultation.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>

                {consultation.scheduledAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Scheduled</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(consultation.scheduledAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )}

                {consultation.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Completed</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(consultation.completedAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(consultation.updatedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {consultation.room && (
                  <Link href={`/consultation/rooms/${consultation.room.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Video className="h-4 w-4 mr-2" />
                      Open Room
                    </Button>
                  </Link>
                )}
                
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Reschedule
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}