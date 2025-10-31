'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
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
  Activity,
  Monitor,
  Pen
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
      {/* Video Call Features */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-3">Professional Video Consultations</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Experience seamless collaboration with enterprise-grade video technology
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="group">
            <div className="relative rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/consultation/video-call-professional.jpg"
                alt="Professional Video Calls"
                width={800}
                height={600}
                className="w-full h-[250px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/95 via-blue-800/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-6 h-6" />
                  <h3 className="text-xl font-bold">HD Video & Audio</h3>
                </div>
                <p className="text-sm text-white/90">Crystal-clear video calls with professional audio quality for effective communication</p>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="relative rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/consultation/video-call-screen-sharing.jpg"
                alt="Screen Sharing"
                width={800}
                height={600}
                className="w-full h-[250px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/95 via-purple-800/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Screen Sharing</h3>
                </div>
                <p className="text-sm text-white/90">Share your screen to demonstrate ideas, review code, or present projects in real-time</p>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="relative rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/consultation/video-call-whiteboard.jpg"
                alt="Collaborative Whiteboard"
                width={800}
                height={600}
                className="w-full h-[250px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/95 via-green-800/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Pen className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Interactive Whiteboard</h3>
                </div>
                <p className="text-sm text-white/90">Brainstorm together with collaborative drawing tools and visual planning capabilities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Process Flow */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-3">How It Works</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Our streamlined consultation process ensures productive and efficient sessions
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="relative">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/consultation/process-preparation.jpg"
                alt="Preparation Phase"
                width={800}
                height={600}
                className="w-full h-[280px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/95 via-indigo-800/70 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <Badge className="bg-white text-indigo-900 text-lg px-4 py-1">Step 1</Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3 className="text-2xl font-bold mb-2">Preparation</h3>
                <ul className="space-y-1 text-sm text-white/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Book your consultation slot</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Share project requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Receive pre-meeting agenda</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/consultation/process-active-consultation.jpg"
                alt="Active Consultation"
                width={800}
                height={600}
                className="w-full h-[280px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/95 via-blue-800/70 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <Badge className="bg-white text-blue-900 text-lg px-4 py-1">Step 2</Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3 className="text-2xl font-bold mb-2">Active Session</h3>
                <ul className="space-y-1 text-sm text-white/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Live video consultation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Screen sharing & collaboration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Real-time problem solving</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/consultation/process-followup.jpg"
                alt="Follow-up Phase"
                width={800}
                height={600}
                className="w-full h-[280px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/95 via-green-800/70 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <Badge className="bg-white text-green-900 text-lg px-4 py-1">Step 3</Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3 className="text-2xl font-bold mb-2">Follow-up</h3>
                <ul className="space-y-1 text-sm text-white/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Session recording & notes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Action items & recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Ongoing support & resources</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

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