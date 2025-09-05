'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Video,
  Clock,
  ArrowRight,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { api } from '@/lib/trpc/react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { ConsultationRoomStatus } from '@prisma/client'

export function ConsultationRoomsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ConsultationRoomStatus | 'ALL'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  const { 
    data: roomsData, 
    isLoading, 
    refetch 
  } = api.consultation.getRooms.useQuery({
    page: currentPage,
    limit: 10,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: searchTerm || undefined,
  })

  const updateRoom = api.consultation.updateRoom.useMutation({
    onSuccess: () => {
      toast({
        title: 'Room Updated',
        description: 'Room status has been updated successfully.',
      })
      refetch()
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

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

  const handleStatusChange = async (roomId: string, newStatus: ConsultationRoomStatus) => {
    try {
      await updateRoom.mutateAsync({
        id: roomId,
        status: newStatus,
      })
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search consultation rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ConsultationRoomStatus | 'ALL')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {roomsData?.rooms.length || 0} of {roomsData?.pagination.total || 0} rooms
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Rooms List */}
      {roomsData?.rooms.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No consultation rooms found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'Create your first consultation room to get started'
              }
            </p>
            <div className="flex justify-center gap-2">
              {(searchTerm || statusFilter !== 'ALL') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('ALL')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {roomsData?.rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Room Header */}
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {room.name}
                        </h3>
                        <Badge className={getStatusColor(room.status)}>
                          {room.status}
                        </Badge>
                        {room.status === 'ACTIVE' && (
                          <Badge className="bg-green-100 text-green-800 animate-pulse">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Live
                            </div>
                          </Badge>
                        )}
                      </div>

                      {/* Room Description */}
                      {room.description && (
                        <p className="text-gray-600">
                          {room.description}
                        </p>
                      )}

                      {/* Participants */}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <div className="flex items-center gap-1">
                            {room.client.image && (
                              <img
                                src={room.client.image}
                                alt={room.client.name || ''}
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            <span className="font-medium">{room.client.name}</span>
                            <span className="text-gray-400">•</span>
                            {room.consultant.image && (
                              <img
                                src={room.consultant.image}
                                alt={room.consultant.name || ''}
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            <span className="font-medium">{room.consultant.name}</span>
                          </div>
                        </div>
                        
                        {room.scheduledAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(room.scheduledAt), 'MMM d, yyyy')}</span>
                            <Clock className="h-4 w-4 ml-2" />
                            <span>{format(new Date(room.scheduledAt), 'h:mm a')}</span>
                          </div>
                        )}
                      </div>

                      {/* Room Statistics */}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{room._count.messages} messages</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{room._count.documents} documents</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{room._count.actionItems} action items</span>
                        </div>
                        {room.durationMinutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{room.durationMinutes} min</span>
                          </div>
                        )}
                      </div>

                      {/* Room Type */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {room.roomType}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Created {format(new Date(room.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/consultation/rooms/${room.id}`}>
                        <Button 
                          variant={room.status === 'ACTIVE' ? 'primary' : 'outline'}
                          size="sm"
                          className={room.status === 'ACTIVE' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          {room.status === 'ACTIVE' ? (
                            <>
                              <Video className="h-4 w-4 mr-1" />
                              Join Room
                            </>
                          ) : (
                            <>
                              View Room
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </Link>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-2">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {room.status === 'SCHEDULED' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(room.id, 'ACTIVE')}
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Start Session
                            </DropdownMenuItem>
                          )}
                          {room.status === 'ACTIVE' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(room.id, 'COMPLETED')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              End Session
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Room
                          </DropdownMenuItem>
                          {room.status !== 'ACTIVE' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(room.id, 'CANCELLED')}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel Room
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {roomsData && roomsData.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {roomsData.pagination.page} of {roomsData.pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(roomsData.pagination.pages, currentPage + 1))}
              disabled={currentPage === roomsData.pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}