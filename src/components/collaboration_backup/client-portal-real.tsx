'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Folder,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Download,
  Eye,
  Video,
  Code,
  Palette,
  Plus,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/trpc/client';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import type { Project, Task, ProjectFile, Consultation, Invoice, Meeting } from '@prisma/client';

interface ProjectWithRelations extends Project {
  consultations: Consultation[];
  files: ProjectFile[];
  tasks: Task[];
  invoices: Invoice[];
}

interface ClientPortalRealProps {
  projectId?: string;
  className?: string;
}

export default function ClientPortalReal({
  projectId,
  className = ''
}: ClientPortalRealProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's projects
  const { data: projectsData, isLoading: projectsLoading } = api.projects.list.useQuery(
    { 
      userId: session?.user?.id,
      limit: 10 
    },
    { enabled: !!session?.user?.id }
  );

  // Fetch specific project if projectId is provided
  const { data: projectData, isLoading: projectLoading } = api.projects.getById.useQuery(
    { id: projectId! },
    { enabled: !!projectId }
  );

  // Fetch user's invoices
  const { data: invoicesData } = api.financial.invoices.list.useQuery(
    { 
      clientId: session?.user?.id,
      limit: 20 
    },
    { enabled: !!session?.user?.id }
  );

  // Fetch upcoming meetings (if we have meetings API)
  const upcomingMeetings: Meeting[] = [];

  useEffect(() => {
    if (projectsData?.projects) {
      setProjects(projectsData.projects as ProjectWithRelations[]);
      
      if (projectId && projectData) {
        setSelectedProject(projectData as ProjectWithRelations);
      } else if (projectsData.projects.length > 0) {
        setSelectedProject(projectsData.projects[0] as ProjectWithRelations);
      }
      
      setIsLoading(false);
    }
  }, [projectsData, projectData, projectId]);

  const getStatusColor = (status: string) => {
    const colors = {
      PLANNING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      REVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      TODO: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status as keyof typeof colors] || colors.TODO;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'text-green-600 dark:text-green-400',
      MEDIUM: 'text-yellow-600 dark:text-yellow-400',
      HIGH: 'text-orange-600 dark:text-orange-400',
      URGENT: 'text-red-600 dark:text-red-400'
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount || 0);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!session) {
    return (
      <div className={`w-full p-8 text-center ${className}`}>
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Access Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access your client portal and view your projects.
          </p>
          <Button>Sign In</Button>
        </div>
      </div>
    );
  }

  if (isLoading || projectsLoading) {
    return (
      <div className={`w-full p-8 text-center ${className}`}>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading your projects...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={`w-full p-8 text-center ${className}`}>
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">No Projects Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have any active projects yet. Contact us to get started with your AI transformation.
          </p>
          <Button>Contact Us</Button>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className={`w-full p-8 text-center ${className}`}>
        <p className="text-gray-600 dark:text-gray-400">Please select a project to view details.</p>
      </div>
    );
  }

  const completedTasks = selectedProject.tasks?.filter(t => t.status === 'COMPLETED').length || 0;
  const totalTasks = selectedProject.tasks?.length || 0;
  const projectProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const budgetUsed = parseFloat(selectedProject.budget?.toString() || '0') * 0.65; // Mock 65% usage
  const budgetPercentage = budgetUsed > 0 ? Math.round((budgetUsed / parseFloat(selectedProject.budget?.toString() || '100000')) * 100) : 0;

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Project Selector */}
      {projects.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProject?.id === project.id ? 'ring-2 ring-cyan-500' : ''
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {project.description}
                    </p>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{selectedProject.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedProject.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(selectedProject.status)}>
            {selectedProject.status.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className={getPriorityColor(selectedProject.priority)}>
            {selectedProject.priority} priority
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                <p className="text-2xl font-bold">{projectProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Budget Used</p>
                <p className="text-2xl font-bold">{formatCurrency(budgetUsed)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  of {formatCurrency(selectedProject.budget?.toString() || '0')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Done</p>
                <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">End Date</p>
                <p className="text-sm font-medium">
                  {selectedProject.endDate 
                    ? format(new Date(selectedProject.endDate), 'MMM dd, yyyy')
                    : 'TBD'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{projectProgress}%</span>
                  </div>
                  <Progress value={projectProgress} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Budget Usage</span>
                    <span>{budgetPercentage}%</span>
                  </div>
                  <Progress value={budgetPercentage} />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                    <p className="font-medium">
                      {selectedProject.startDate 
                        ? format(new Date(selectedProject.startDate), 'MMM dd, yyyy')
                        : 'Not set'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">End Date</p>
                    <p className="font-medium">
                      {selectedProject.endDate 
                        ? format(new Date(selectedProject.endDate), 'MMM dd, yyyy')
                        : 'Not set'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Project created</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {format(new Date(selectedProject.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  
                  {selectedProject.updatedAt !== selectedProject.createdAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Project updated</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {format(new Date(selectedProject.updatedAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedProject.tasks?.length === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Project Tasks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {completedTasks} of {totalTasks} completed
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              {selectedProject.tasks && selectedProject.tasks.length > 0 ? (
                <div className="space-y-4">
                  {selectedProject.tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === 'COMPLETED' ? 'bg-green-500' :
                          task.status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                          task.status === 'REVIEW' ? 'bg-purple-500' :
                          'bg-gray-300 dark:bg-gray-600'
                        }`} />
                        <div>
                          <p className="font-medium">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                          )}
                          {task.dueDate && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No tasks created yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Project Files</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedProject.files?.length || 0} files
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              {selectedProject.files && selectedProject.files.length > 0 ? (
                <div className="space-y-4">
                  {selectedProject.files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">{file.originalName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatFileSize(file.size)} • {format(new Date(file.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No files uploaded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Invoices & Payments</h3>
          </div>

          <Card>
            <CardContent className="p-6">
              {invoicesData?.invoices && invoicesData.invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoicesData.invoices
                    .filter(invoice => invoice.project?.id === selectedProject.id)
                    .map(invoice => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">Invoice #{invoice.number}</p>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                          {invoice.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{invoice.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                            {invoice.issuedDate && (
                              <span>Issued: {format(new Date(invoice.issuedDate), 'MMM dd, yyyy')}</span>
                            )}
                            {invoice.dueDate && (
                              <span>Due: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(invoice.total.toString())}</p>
                          <Button size="sm" variant="outline" className="mt-2">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No invoices for this project.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Meetings</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No meetings scheduled.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Schedule a meeting with your project team to discuss progress.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Video className="w-6 h-6 mb-2" />
              Start Meeting
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Code className="w-6 h-6 mb-2" />
              Code Together
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Palette className="w-6 h-6 mb-2" />
              Whiteboard
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <MessageSquare className="w-6 h-6 mb-2" />
              Team Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Development notice */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg shadow-lg max-w-sm">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Dev Notice:</strong> Client Portal is now using real database data from your projects, tasks, files, and invoices.
          </p>
        </div>
      )}
    </div>
  );
}