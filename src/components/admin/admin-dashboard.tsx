'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Users, 
  Star, 
  Briefcase, 
  DollarSign,
  TrendingUp,
  FileText,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Activity,
  Shield,
  Database,
  Download,
  Upload,
  Search,
  Filter
} from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import type { TeamMember, Testimonial, CaseStudyEntry } from '@prisma/client'

interface AdminDashboardProps {
  className?: string
}

export function AdminDashboard({ className = '' }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  // Dialog states
  const [showCreateTestimonial, setShowCreateTestimonial] = useState(false)
  const [showCreateTeamMember, setShowCreateTeamMember] = useState(false)
  const [showCreateCaseStudy, setShowCreateCaseStudy] = useState(false)

  // Form states
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    role: '',
    company: '',
    content: '',
    rating: 5,
    isActive: true
  })

  const [teamMemberForm, setTeamMemberForm] = useState({
    name: '',
    role: '',
    bio: '',
    email: '',
    linkedin: '',
    twitter: '',
    github: '',
    skills: [] as string[],
    experience: 0,
    isActive: true
  })

  const [caseStudyForm, setCaseStudyForm] = useState({
    title: '',
    description: '',
    client: '',
    industry: '',
    tags: [] as string[],
    status: 'DRAFT' as const,
    featured: false,
    results: [] as Array<{ metric: string; value: string }>
  })

  // Queries
  const { data: dashboardStats } = api.analytics.getDashboardStats.useQuery({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate: new Date()
  })

  const { data: testimonials, refetch: refetchTestimonials } = api.testimonials.list.useQuery({ limit: 50 })
  const { data: teamMembers, refetch: refetchTeam } = api.team.list.useQuery({ limit: 50 })
  const { data: caseStudies, refetch: refetchCaseStudies } = api.caseStudies.list.useQuery({ 
    status: 'PUBLISHED',
    limit: 50 
  })

  const { data: testimonialStats } = api.testimonials.getStats.useQuery()
  const { data: teamStats } = api.team.getStats.useQuery()
  const { data: caseStudyStats } = api.caseStudies.getStats.useQuery()
  const { data: financialStats } = api.financial.getFinancialStats.useQuery({})

  // Mutations
  const createTestimonialMutation = api.testimonials.create.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Testimonial created successfully' })
      refetchTestimonials()
      setShowCreateTestimonial(false)
      setTestimonialForm({
        name: '',
        role: '',
        company: '',
        content: '',
        rating: 5,
        isActive: true
      })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  })

  const createTeamMemberMutation = api.team.create.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Team member created successfully' })
      refetchTeam()
      setShowCreateTeamMember(false)
      setTeamMemberForm({
        name: '',
        role: '',
        bio: '',
        email: '',
        linkedin: '',
        twitter: '',
        github: '',
        skills: [],
        experience: 0,
        isActive: true
      })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  })

  const createCaseStudyMutation = api.caseStudies.create.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Case study created successfully' })
      refetchCaseStudies()
      setShowCreateCaseStudy(false)
      setCaseStudyForm({
        title: '',
        description: '',
        client: '',
        industry: '',
        tags: [],
        status: 'DRAFT',
        featured: false,
        results: []
      })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  })

  const deleteTestimonialMutation = api.testimonials.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Testimonial deleted successfully' })
      refetchTestimonials()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  })

  const deleteTeamMemberMutation = api.team.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Team member deleted successfully' })
      refetchTeam()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  })

  const deleteCaseStudyMutation = api.caseStudies.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Case study deleted successfully' })
      refetchCaseStudies()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  })

  const handleCreateTestimonial = () => {
    createTestimonialMutation.mutate(testimonialForm)
  }

  const handleCreateTeamMember = () => {
    createTeamMemberMutation.mutate(teamMemberForm)
  }

  const handleCreateCaseStudy = () => {
    createCaseStudyMutation.mutate(caseStudyForm)
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your content, users, and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <Database className="w-4 h-4 mr-2" />
            Backup
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardStats?.newUsers || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.activeProjects || 0}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((financialStats?.totalRevenue || 0) / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">
              ${((financialStats?.pendingRevenue || 0) / 1000).toFixed(0)}k pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalPageViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.uniqueVisitors || 0} unique visitors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">New testimonial added</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Case study published</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Team member updated</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage</span>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Warning
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Testimonials</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {testimonialStats?.active || 0} active, {testimonialStats?.total || 0} total
              </p>
            </div>
            <Dialog open={showCreateTestimonial} onOpenChange={setShowCreateTestimonial}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Testimonial
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Testimonial</DialogTitle>
                  <DialogDescription>
                    Add a new client testimonial to showcase your work.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={testimonialForm.name}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={testimonialForm.role}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={testimonialForm.company}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Testimonial</Label>
                    <Textarea
                      id="content"
                      rows={4}
                      value={testimonialForm.content}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Select 
                      value={testimonialForm.rating.toString()} 
                      onValueChange={(value) => setTestimonialForm({ ...testimonialForm, rating: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateTestimonial(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTestimonial} disabled={createTestimonialMutation.isPending}>
                    Create Testimonial
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {testimonials?.map(testimonial => (
                  <div key={testimonial.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{testimonial.name}</h4>
                        <Badge variant={testimonial.isActive ? "default" : "secondary"}>
                          {testimonial.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {testimonial.role} at {testimonial.company}
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm mt-2 line-clamp-2">{testimonial.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteTestimonialMutation.mutate({ id: testimonial.id })}
                        disabled={deleteTestimonialMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Team Members</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {teamStats?.active || 0} active members
              </p>
            </div>
            <Dialog open={showCreateTeamMember} onOpenChange={setShowCreateTeamMember}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
                    Add a new team member to your organization.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="teamName">Name</Label>
                      <Input
                        id="teamName"
                        value={teamMemberForm.name}
                        onChange={(e) => setTeamMemberForm({ ...teamMemberForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="teamRole">Role</Label>
                      <Input
                        id="teamRole"
                        value={teamMemberForm.role}
                        onChange={(e) => setTeamMemberForm({ ...teamMemberForm, role: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="teamEmail">Email</Label>
                    <Input
                      id="teamEmail"
                      type="email"
                      value={teamMemberForm.email}
                      onChange={(e) => setTeamMemberForm({ ...teamMemberForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="teamBio">Bio</Label>
                    <Textarea
                      id="teamBio"
                      rows={3}
                      value={teamMemberForm.bio}
                      onChange={(e) => setTeamMemberForm({ ...teamMemberForm, bio: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="teamLinkedin">LinkedIn URL</Label>
                      <Input
                        id="teamLinkedin"
                        value={teamMemberForm.linkedin}
                        onChange={(e) => setTeamMemberForm({ ...teamMemberForm, linkedin: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="teamExperience">Years of Experience</Label>
                      <Input
                        id="teamExperience"
                        type="number"
                        value={teamMemberForm.experience}
                        onChange={(e) => setTeamMemberForm({ ...teamMemberForm, experience: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateTeamMember(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTeamMember} disabled={createTeamMemberMutation.isPending}>
                    Add Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {teamMembers?.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{member.name}</h4>
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{member.role}</p>
                      {member.experience && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {member.experience} years experience
                        </p>
                      )}
                      {member.skills && member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.skills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteTeamMemberMutation.mutate({ id: member.id })}
                        disabled={deleteTeamMemberMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="case-studies" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Case Studies</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {caseStudyStats?.published || 0} published, {caseStudyStats?.draft || 0} drafts
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Case Study
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {caseStudies?.caseStudies.map(caseStudy => (
                  <div key={caseStudy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{caseStudy.title}</h4>
                        <Badge variant={caseStudy.featured ? "default" : "outline"}>
                          {caseStudy.featured ? "Featured" : "Standard"}
                        </Badge>
                        <Badge variant="outline">{caseStudy.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {caseStudy.client} • {caseStudy.industry}
                      </p>
                      <p className="text-sm line-clamp-2">{caseStudy.description}</p>
                      {caseStudy.tags && caseStudy.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {caseStudy.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteCaseStudyMutation.mutate({ id: caseStudy.id })}
                        disabled={deleteCaseStudyMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Page Views</span>
                    <span className="font-semibold">{dashboardStats?.totalPageViews || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Unique Visitors</span>
                    <span className="font-semibold">{dashboardStats?.uniqueVisitors || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>New Users</span>
                    <span className="font-semibold">{dashboardStats?.newUsers || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Testimonials</span>
                    <span className="font-semibold">{testimonialStats?.active || 0} active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Case Studies</span>
                    <span className="font-semibold">{caseStudyStats?.published || 0} published</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Team Members</span>
                    <span className="font-semibold">{teamStats?.active || 0} active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Maintenance Mode</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enable maintenance mode to prevent public access
                  </p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Data Backup</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatic daily backups of all data
                  </p>
                </div>
                <Button variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  Backup Now
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cache Management</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clear system cache to improve performance
                  </p>
                </div>
                <Button variant="outline">Clear Cache</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}