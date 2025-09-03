/**
 * Business domain type definitions
 * @fileoverview Types related to business entities, services, and operations
 */

import type { BaseEntity, ID, Timestamp, Email, URL, Slug, WithImage, WithSEO, ImageData } from './common';

// Service Types
export type ServiceCategory = 'discovery' | 'implementation' | 'transformation' | 'specialized';
export type ServiceStatus = 'active' | 'inactive' | 'deprecated';
export type PricingModel = 'fixed' | 'hourly' | 'project' | 'retainer';

export interface Service extends BaseEntity, WithImage, WithSEO {
  title: string;
  description: string;
  shortDescription?: string;
  price: string;
  pricingModel: PricingModel;
  duration: string;
  features: ServiceFeature[];
  category: ServiceCategory;
  status: ServiceStatus;
  icon?: string;
  slug: Slug;
  prerequisites?: string[];
  deliverables?: string[];
  methodology?: string[];
  technologies?: Technology[];
  testimonials?: Testimonial[];
}

export interface ServiceFeature {
  id: ID;
  name: string;
  description?: string;
  included: boolean;
  highlight?: boolean;
}

export interface Technology {
  id: ID;
  name: string;
  description?: string;
  icon?: string;
  website?: URL;
  category: 'frontend' | 'backend' | 'database' | 'ai' | 'devops' | 'analytics';
}

// Team Types
export interface TeamMember extends BaseEntity, WithImage {
  name: string;
  role: string;
  bio: string;
  email?: Email;
  expertise: string[];
  certifications?: Certification[];
  social?: {
    linkedin?: URL;
    twitter?: URL;
    github?: URL;
    website?: URL;
  };
  availability?: {
    status: 'available' | 'busy' | 'unavailable';
    nextAvailable?: Timestamp;
  };
}

export interface Certification {
  id: ID;
  name: string;
  issuer: string;
  dateObtained: Timestamp;
  expiryDate?: Timestamp;
  credentialId?: string;
  verificationUrl?: URL;
}

// Testimonial Types
export interface Testimonial extends BaseEntity, WithImage {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  serviceId?: ID;
  projectId?: ID;
  featured: boolean;
  verified: boolean;
}

// Case Study Types
export interface CaseStudy extends BaseEntity, WithImage, WithSEO {
  title: string;
  description: string;
  client: Client;
  industry: Industry;
  slug: Slug;
  tags: string[];
  challenge: string;
  solution: string;
  outcome: string;
  results: CaseStudyResult[];
  technologies: Technology[];
  duration: string;
  teamSize: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  gallery?: ImageData[];
}

export interface CaseStudyResult {
  metric: string;
  value: string;
  description?: string;
  improvement?: string;
}

export interface Client extends BaseEntity {
  name: string;
  description?: string;
  website?: URL;
  logo?: ImageData;
  industry: Industry;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  location?: string;
  contactPerson?: {
    name: string;
    role: string;
    email?: Email;
  };
}

export interface Industry {
  id: ID;
  name: string;
  description?: string;
  slug: Slug;
}

// Blog Types
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED' | 'DELETED';

export interface BlogPost extends BaseEntity, WithImage, WithSEO {
  title: string;
  excerpt: string;
  content: string;
  slug: Slug;
  author: TeamMember;
  readTime: number;
  tags: string[];
  category: BlogCategory;
  status: PostStatus | 'draft' | 'published' | 'archived'; // Support both formats
  featured: boolean;
  publishedAt?: Timestamp;
  views?: number;
  likes?: number;
  comments?: BlogComment[];
  published?: boolean; // Add published field
}

export interface BlogSearchResult {
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
}

export interface BlogCategory {
  id: ID;
  name: string;
  description?: string;
  slug: Slug;
  color?: string;
}

export interface BlogTag {
  id: ID;
  name: string;
  slug: Slug;
}

export interface BlogComment extends BaseEntity {
  content: string;
  author: {
    name: string;
    email: Email;
    website?: URL;
  };
  postId: ID;
  parentId?: ID;
  approved: boolean;
  replies?: BlogComment[];
}

// Contact and Lead Types
export interface ContactFormData {
  name: string;
  email: Email;
  company?: string;
  phone?: string;
  message: string;
  service?: ID;
  budget?: BudgetRange;
  timeline?: string;
  source?: LeadSource;
  consent: boolean;
}

export type BudgetRange = 
  | 'under-10k' 
  | '10k-25k' 
  | '25k-50k' 
  | '50k-100k' 
  | '100k-plus' 
  | 'not-sure';

export type LeadSource = 
  | 'website' 
  | 'referral' 
  | 'social-media' 
  | 'search-engine' 
  | 'advertisement' 
  | 'event' 
  | 'other';

export interface Lead extends BaseEntity {
  name: string;
  email: Email;
  company?: string;
  phone?: string;
  message: string;
  service?: Service;
  budget?: BudgetRange;
  timeline?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: TeamMember;
  notes?: LeadNote[];
  activities?: LeadActivity[];
  convertedAt?: Timestamp;
}

export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'proposal-sent' 
  | 'negotiation' 
  | 'won' 
  | 'lost';

export interface LeadNote {
  id: ID;
  content: string;
  author: TeamMember;
  createdAt: Timestamp;
  type: 'note' | 'call' | 'email' | 'meeting';
}

export interface LeadActivity {
  id: ID;
  type: 'email' | 'call' | 'meeting' | 'proposal' | 'follow-up';
  description: string;
  scheduledFor?: Timestamp;
  completedAt?: Timestamp;
  author: TeamMember;
  createdAt: Timestamp;
}

// Newsletter Types
export interface NewsletterSubscriber extends BaseEntity {
  email: Email;
  name?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  source?: string;
  tags?: string[];
  preferences?: NewsletterPreferences;
}

export interface NewsletterPreferences {
  frequency: 'weekly' | 'biweekly' | 'monthly';
  topics: string[];
  format: 'html' | 'text';
}