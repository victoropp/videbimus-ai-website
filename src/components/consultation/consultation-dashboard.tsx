'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare, 
  FileText, 
  CheckCircle,
  Video,
  PlusCircle,
  ArrowRight,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/trpc/react'
import { format } from 'date-fns'
import Link from 'next/link'

export function ConsultationDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  
  const { data: dashboardData, isLoading } = api.consultation.getDashboard.useQuery()
  const { data: consultations, isLoading: consultationsLoading } = api.consultation.getAll.useQuery({
    page: 1,
    limit: 10,
  })
  const { data: rooms, isLoading: roomsLoading } = api.consultation.getRooms.useQuery({
    page: 1,
    limit: 10,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'ACTIVE':
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.statistics?.totalConsultations || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.statistics?.activeRooms || 0}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Video className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.statistics?.completedConsultations || 0}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(dashboardData?.statistics?.completionRate || 0)}%
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/consultation/book">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Book Consultation
          </Button>
        </Link>
        <Link href="/consultation/rooms">
          <Button variant="outline" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            View Rooms
          </Button>
        </Link>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="rooms">Active Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Upcoming Consultations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Consultations
              </CardTitle>
              <CardDescription>
                Your scheduled consultation sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.upcomingConsultations?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No upcoming consultations scheduled
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboardData?.upcomingConsultations?.map((consultation) => (
                    <div
                      key={consultation.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{consultation.title}</h4>
                          <Badge className={getTypeColor(consultation.type)}>
                            {consultation.type}
                          </Badge>
                          <Badge className={getStatusColor(consultation.status)}>
                            {consultation.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {consultation.scheduledAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(new Date(consultation.scheduledAt), 'PPP p')}
                            </span>
                          )}
                          {consultation.duration && (
                            <span>{consultation.duration} minutes</span>
                          )}
                          {consultation.project && (
                            <span className="text-blue-600">
                              {consultation.project.title}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link href={`/consultation/${consultation.id}`}>
                        <Button variant="outline" size="sm">
                          View <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Rooms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Active Rooms
              </CardTitle>
              <CardDescription>
                Currently active consultation rooms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.activeRooms?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No active rooms at the moment
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboardData?.activeRooms?.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{room.name}</h4>
                          <Badge className="bg-green-100 text-green-800">
                            {room.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {room.client.name} & {room.consultant.name}
                          </span>
                          {room.scheduledAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(new Date(room.scheduledAt), 'PPP p')}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link href={`/consultation/rooms/${room.id}`}>
                        <Button variant="outline" size="sm">
                          Join Room <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Consultations</CardTitle>
              <CardDescription>
                Manage your consultation sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consultationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : consultations?.consultations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No consultations found
                </p>
              ) : (
                <div className="space-y-4">
                  {consultations?.consultations.map((consultation) => (
                    <div
                      key={consultation.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{consultation.title}</h4>
                          <Badge className={getTypeColor(consultation.type)}>
                            {consultation.type}
                          </Badge>
                          <Badge className={getStatusColor(consultation.status)}>
                            {consultation.status}
                          </Badge>
                        </div>
                        {consultation.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {consultation.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {consultation.scheduledAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(new Date(consultation.scheduledAt), 'PPP p')}
                            </span>
                          )}
                          {consultation.project && (
                            <span className="text-blue-600">
                              {consultation.project.title}
                            </span>
                          )}
                          {consultation.room && (
                            <Link 
                              href={`/consultation/rooms/${consultation.room.id}`}
                              className="text-green-600 hover:underline"
                            >
                              View Room
                            </Link>
                          )}
                        </div>
                      </div>
                      <Link href={`/consultation/${consultation.id}`}>
                        <Button variant="outline" size="sm">
                          Manage <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consultation Rooms</CardTitle>
              <CardDescription>
                Your active and recent consultation rooms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roomsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : rooms?.rooms.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No consultation rooms found
                </p>
              ) : (
                <div className="space-y-4">
                  {rooms?.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{room.name}</h4>
                          <Badge className={getStatusColor(room.status)}>
                            {room.status}
                          </Badge>
                        </div>
                        {room.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {room.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {room.client.name} & {room.consultant.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {room._count.messages} messages
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {room._count.documents} docs
                          </span>
                        </div>
                      </div>
                      <Link href={`/consultation/rooms/${room.id}`}>
                        <Button variant="outline" size="sm">
                          Enter Room <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}