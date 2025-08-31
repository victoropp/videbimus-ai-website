import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ClientPortal from '@/components/collaboration/client-portal';

// Mock data - in a real app, this would come from your database
const mockProject = {
  id: '1',
  title: 'AI-Powered Customer Analytics Platform',
  description: 'Development of a comprehensive analytics platform using machine learning to provide customer insights and predictive analytics.',
  status: 'in_progress' as const,
  priority: 'high' as const,
  progress: 68,
  budget: 75000,
  spent: 48500,
  startDate: new Date('2024-07-01'),
  endDate: new Date('2024-12-15'),
  milestones: [
    {
      id: '1',
      title: 'Project Kickoff & Discovery',
      description: 'Initial project setup, requirements gathering, and technical discovery phase.',
      status: 'completed' as const,
      dueDate: new Date('2024-07-15'),
      completedDate: new Date('2024-07-12'),
    },
    {
      id: '2',
      title: 'Core Architecture Design',
      description: 'Design system architecture, database schema, and API specifications.',
      status: 'completed' as const,
      dueDate: new Date('2024-08-15'),
      completedDate: new Date('2024-08-10'),
    },
    {
      id: '3',
      title: 'MVP Development',
      description: 'Develop minimum viable product with core features and basic ML models.',
      status: 'completed' as const,
      dueDate: new Date('2024-09-30'),
      completedDate: new Date('2024-09-28'),
    },
    {
      id: '4',
      title: 'Advanced Analytics Features',
      description: 'Implement advanced ML algorithms, predictive models, and dashboard visualizations.',
      status: 'pending' as const,
      dueDate: new Date('2024-11-15'),
    },
    {
      id: '5',
      title: 'Testing & Deployment',
      description: 'Comprehensive testing, performance optimization, and production deployment.',
      status: 'pending' as const,
      dueDate: new Date('2024-12-15'),
    },
  ],
  files: [
    {
      id: '1',
      name: 'Technical_Specification_v2.pdf',
      type: 'application/pdf',
      size: 2547892,
      url: '/files/tech_spec_v2.pdf',
      uploadedAt: new Date('2024-08-15'),
      uploadedBy: 'Sarah Johnson',
    },
    {
      id: '2',
      name: 'Database_Schema.sql',
      type: 'application/sql',
      size: 15644,
      url: '/files/db_schema.sql',
      uploadedAt: new Date('2024-08-10'),
      uploadedBy: 'Mike Chen',
    },
    {
      id: '3',
      name: 'UI_Mockups_v3.figma',
      type: 'application/figma',
      size: 8923456,
      url: '/files/ui_mockups_v3.figma',
      uploadedAt: new Date('2024-08-20'),
      uploadedBy: 'Emily Davis',
    },
    {
      id: '4',
      name: 'API_Documentation.md',
      type: 'text/markdown',
      size: 45821,
      url: '/files/api_docs.md',
      uploadedAt: new Date('2024-09-05'),
      uploadedBy: 'Alex Rivera',
    },
  ],
  tasks: [
    {
      id: '1',
      title: 'Implement user authentication system',
      status: 'completed' as const,
      assignee: 'Mike Chen',
      dueDate: new Date('2024-08-20'),
      priority: 'high' as const,
    },
    {
      id: '2',
      title: 'Design customer segmentation algorithm',
      status: 'completed' as const,
      assignee: 'Dr. Lisa Park',
      dueDate: new Date('2024-09-10'),
      priority: 'high' as const,
    },
    {
      id: '3',
      title: 'Create dashboard wireframes',
      status: 'completed' as const,
      assignee: 'Emily Davis',
      dueDate: new Date('2024-08-25'),
      priority: 'medium' as const,
    },
    {
      id: '4',
      title: 'Implement real-time data processing pipeline',
      status: 'in_progress' as const,
      assignee: 'Alex Rivera',
      dueDate: new Date('2024-10-15'),
      priority: 'high' as const,
    },
    {
      id: '5',
      title: 'Develop predictive analytics models',
      status: 'in_progress' as const,
      assignee: 'Dr. Lisa Park',
      dueDate: new Date('2024-11-01'),
      priority: 'high' as const,
    },
    {
      id: '6',
      title: 'Create API documentation',
      status: 'review' as const,
      assignee: 'Sarah Johnson',
      dueDate: new Date('2024-09-30'),
      priority: 'medium' as const,
    },
  ],
  team: [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@vidibemus.com',
      role: 'Project Manager',
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike.chen@vidibemus.com',
      role: 'Senior Full-Stack Developer',
    },
    {
      id: '3',
      name: 'Dr. Lisa Park',
      email: 'lisa.park@vidibemus.com',
      role: 'Lead Data Scientist',
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@vidibemus.com',
      role: 'UX/UI Designer',
    },
    {
      id: '5',
      name: 'Alex Rivera',
      email: 'alex.rivera@vidibemus.com',
      role: 'DevOps Engineer',
    },
  ],
};

const mockInvoices = [
  {
    id: '1',
    number: 'INV-2024-001',
    amount: 25000,
    status: 'paid' as const,
    issuedDate: new Date('2024-08-01'),
    dueDate: new Date('2024-08-31'),
    description: 'Phase 1: Discovery & Architecture Design',
  },
  {
    id: '2',
    number: 'INV-2024-002',
    amount: 23500,
    status: 'paid' as const,
    issuedDate: new Date('2024-09-01'),
    dueDate: new Date('2024-09-30'),
    description: 'Phase 2: MVP Development',
  },
  {
    id: '3',
    number: 'INV-2024-003',
    amount: 26500,
    status: 'sent' as const,
    issuedDate: new Date('2024-10-01'),
    dueDate: new Date('2024-10-31'),
    description: 'Phase 3: Advanced Analytics Implementation (Partial)',
  },
];

const mockUpcomingMeetings = [
  {
    id: '1',
    title: 'Weekly Progress Review',
    scheduledAt: new Date('2024-08-28T10:00:00Z'),
  },
  {
    id: '2',
    title: 'ML Model Performance Discussion',
    scheduledAt: new Date('2024-08-29T14:00:00Z'),
  },
  {
    id: '3',
    title: 'Client Demo Preparation',
    scheduledAt: new Date('2024-08-30T11:00:00Z'),
  },
];

const mockRecentActivity = [
  {
    id: '1',
    type: 'file_uploaded',
    description: 'API Documentation updated',
    timestamp: new Date('2024-08-27T09:30:00Z'),
    user: 'Alex Rivera',
  },
  {
    id: '2',
    type: 'task_completed',
    description: 'Customer segmentation algorithm completed',
    timestamp: new Date('2024-08-26T16:45:00Z'),
    user: 'Dr. Lisa Park',
  },
  {
    id: '3',
    type: 'meeting_scheduled',
    description: 'Weekly progress review scheduled',
    timestamp: new Date('2024-08-26T11:20:00Z'),
    user: 'Sarah Johnson',
  },
];

export default async function ClientPortalPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ClientPortal
        project={mockProject}
        invoices={mockInvoices}
        upcomingMeetings={mockUpcomingMeetings}
        recentActivity={mockRecentActivity}
      />
    </div>
  );
}