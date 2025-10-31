/**
 * Business domain type definitions
 * @fileoverview Types related to business entities, services, and operations
 */

import type { BaseEntity, ID, Timestamp, Email, URL, Slug, WithImage, WithSEO, ImageData, SEOData } from './common';

// Service Types
export type ServiceCategory = 'discovery' | 'implementation' | 'transformation' | 'specialized';
export type ServiceStatus = 'active' | 'inactive' | 'deprecated';
export type PricingModel = 'fixed' | 'hourly' | 'project' | 'retainer';

// Flexible Service interface that allows both complete entities and simple objects
export interface Service {
  // Core required fields
  id: ID;
  title: string;
  description: string;
  duration: string;
  features: ServiceFeatureInput[];
  category: ServiceCategory;
  
  // Optional fields for flexibility
  shortDescription?: string;
  price?: string;
  pricingModel?: PricingModel;
  status?: ServiceStatus;
  icon?: string;
  slug?: Slug;
  prerequisites?: string[];
  deliverables?: string[];
  methodology?: string[];
  technologies?: Technology[];
  testimonials?: Testimonial[];
  
  // Optional BaseEntity fields
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  
  // Optional WithImage fields
  image?: ImageData | string;
  
  // Optional WithSEO fields
  seo?: SEOData;
}

// Full service interface for database entities
export interface ServiceEntity extends BaseEntity, WithImage, WithSEO {
  title: string;
  description: string;
  shortDescription?: string;
  price?: string;
  pricingModel?: PricingModel;
  duration: string;
  features: ServiceFeatureInput[];
  category: ServiceCategory;
  status?: ServiceStatus;
  icon?: string;
  slug?: Slug;
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

// Flexible type that allows both string and ServiceFeature objects
export type ServiceFeatureInput = string | ServiceFeature;

export interface Technology {
  id: ID;
  name: string;
  description?: string;
  icon?: string;
  website?: URL;
  category: 'frontend' | 'backend' | 'database' | 'ai' | 'devops' | 'analytics';
}

// Team Types - Using Prisma-aligned definition later in file (line 432)
// Certification type for backward compatibility
export interface Certification {
  id: ID;
  name: string;
  issuer: string;
  dateObtained: Timestamp;
  expiryDate?: Timestamp;
  credentialId?: string;
  verificationUrl?: URL;
}

// Testimonial Types - Using Prisma-aligned definition later in file (line 429)

// Case Study Types
export interface CaseStudy {
  id: ID;
  title: string;
  description: string;
  client: Client | string; // Allow both object and string for flexibility
  industry: Industry | string; // Allow both object and string for flexibility
  image: ImageData | string; // Allow both object and string for flexibility
  slug?: Slug; // Make optional for mock data
  tags: string[];
  challenge?: string; // Make optional since we have extended content structure
  solution?: string; // Make optional since we have extended content structure
  outcome?: string; // Make optional since we have extended content structure
  results: CaseStudyResult[];
  technologies?: Technology[] | string[]; // Allow both object and string arrays, optional
  duration?: string; // Make optional
  teamSize?: number | string; // Allow both number and string for flexibility
  status?: 'draft' | 'published' | 'archived'; // Make optional with default
  featured?: boolean; // Make optional
  gallery?: ImageData[];
  // Optional BaseEntity fields for flexibility
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  // Optional SEO for flexibility
  seo?: SEOData;
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

export interface BlogPost extends BaseEntity {
  title: string;
  excerpt?: string;
  content: string;
  slug: Slug;
  author: User; // Use User instead of TeamMember to match Prisma schema
  readTime?: number;
  postTags?: BlogPostTag[]; // Use proper many-to-many relation (optional for backward compatibility)
  tags?: string[]; // Keep for backward compatibility with existing components
  category?: BlogCategory; // Optional as in Prisma schema
  categoryId?: string; // For forms and API
  status: PostStatus;
  featured: boolean;
  featuredImage?: string;
  publishedAt?: Timestamp;
  views?: number;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[]; // For SEO components
  // Additional relations from Prisma schema
  comments?: BlogComment[];
  images?: BlogImage[];
  revisions?: BlogRevision[];
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
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  posts: BlogPostTag[]; // Many-to-many relation
}

// Junction table for BlogPost <-> BlogTag many-to-many relationship
export interface BlogPostTag {
  postId: ID;
  tagId: ID;
  createdAt: Timestamp;
  post: BlogPost;
  tag: BlogTag;
}

// Blog comment system
export interface BlogComment extends BaseEntity {
  content: string;
  isApproved: boolean;
  authorId: ID;
  postId: ID;
  parentId?: ID; // For nested comments
  author: User;
  post: BlogPost;
  parent?: BlogComment;
  replies: BlogComment[];
}

// Blog images management
export interface BlogImage extends BaseEntity {
  url: string;
  alt?: string;
  caption?: string;
  postId: ID;
  order: number;
  post: BlogPost;
}

// Blog revision history
export interface BlogRevision extends BaseEntity {
  title: string;
  excerpt?: string;
  content: string;
  version: number;
  changeNote?: string;
  authorId: ID;
  blogPostId: ID;
  author: User;
  blogPost: BlogPost;
}

// Contact and Lead Types
export interface ContactFormData {
  name: string;
  email: Email;
  company?: string;
  phone?: string;
  industry?: string;
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

// ============================================
// SYSTEM AND MONITORING TYPES - Match Prisma Schema
// ============================================

// Common Types
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Contact Types
export type ContactStatus = 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED' | 'SPAM';
export type NewsletterStatus = 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'BOUNCED' | 'COMPLAINED';

export interface Contact extends BaseEntity {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactStatus;
  priority: Priority;
  userId?: ID; // Optional - if user is logged in
  respondedAt?: Timestamp;
  user?: User;
}

export interface Newsletter extends BaseEntity {
  email: string; // Unique
  status: NewsletterStatus;
  userId?: ID; // Optional - if user is logged in
  preferences?: Record<string, unknown>; // Store subscription preferences
  user?: User;
}

// Analytics and tracking
export interface Analytics extends BaseEntity {
  userId?: ID; // Optional - for logged in users
  sessionId?: string; // Session tracking
  event: string; // Event name (page_view, click, form_submit, etc.)
  page?: string; // Page URL
  referrer?: string; // Referrer URL
  userAgent?: string; // User agent string
  ipAddress?: string; // IP address (for geo tracking)
  country?: string; // Country code
  city?: string; // City name
  device?: string; // Device type (mobile, desktop, tablet)
  browser?: string; // Browser name
  os?: string; // Operating system
  properties?: Record<string, unknown>; // Additional event properties
  user?: User;
}

// Content Management Models
export interface TeamMember extends BaseEntity {
  name: string;
  role: string;
  bio?: string;
  image?: string;
  imageAlt?: string; // Alt text for team member image
  email?: string; // Unique
  linkedin?: string;
  twitter?: string;
  github?: string;
  isActive: boolean;
  sortOrder: number;
  skills: string[]; // Array of skills
  experience?: number; // Years of experience
}

export interface Testimonial extends BaseEntity {
  name: string;
  role: string;
  company: string;
  content: string;
  image?: string;
  rating: number;
  isActive: boolean;
  sortOrder: number;
}

export interface CaseStudyEntry extends BaseEntity {
  title: string;
  description: string;
  client: string;
  industry: string;
  image?: string;
  slug: string; // Unique
  tags: string[];
  results: Record<string, unknown>; // Array of {metric: string, value: string}
  content?: string; // Full case study content
  status: CaseStudyStatus;
  featured: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: Timestamp;
  authorId?: ID;
  author?: User;
  files: CaseStudyFile[];
}

export type CaseStudyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface CaseStudyFile extends BaseEntity {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  description?: string;
  caseStudyId: ID;
  caseStudy: CaseStudyEntry;
}

// Metrics and Analytics Models
export type MetricType = 'COUNTER' | 'GAUGE' | 'HISTOGRAM' | 'SUMMARY' | 'RATE';

export interface PerformanceMetric extends BaseEntity {
  name: string;
  value: Record<string, unknown>; // Flexible value storage
  type: MetricType;
  category: string;
  unit?: string;
  timestamp: Timestamp;
  metadata?: Record<string, unknown>; // Additional metric data
}

export interface SystemHealth extends BaseEntity {
  service: string; // Service name (api, database, redis, etc.)
  status: string; // healthy, degraded, down
  responseTime?: number; // Response time in ms
  uptime?: number; // Uptime percentage
  lastCheck: Timestamp;
  metadata?: Record<string, unknown>; // Additional health data
}

// User Engagement Models
export interface UserActivity extends BaseEntity {
  userId?: ID;
  sessionId?: string;
  action: string; // Action taken
  resource?: string; // Resource accessed
  metadata?: Record<string, unknown>; // Additional activity data
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
  user?: User;
}

// File Storage Models
export interface FileUpload extends BaseEntity {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string; // Cloud storage URL
  bucket?: string; // S3 bucket or storage container
  key?: string; // Storage key/path
  uploadedBy: ID;
  metadata?: Record<string, unknown>; // Additional file metadata
  isPublic: boolean;
  tags: string[]; // File tags for organization
  uploader: User;
}

// Backup and Recovery Models
export type BackupType = 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' | 'MANUAL';
export type BackupStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface DataBackup extends BaseEntity {
  name: string;
  type: BackupType;
  status: BackupStatus;
  size?: number; // Backup size in bytes
  location?: string; // Backup storage location
  checksum?: string; // File integrity checksum
  startedAt: Timestamp;
  completedAt?: Timestamp;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdBy?: ID;
  creator?: User;
}

// Cache Management Models
export interface CacheEntry extends BaseEntity {
  key: string; // Unique
  value: Record<string, unknown>; // Cached data
  tags: string[]; // Cache tags for invalidation
  expiresAt?: Timestamp;
  hitCount: number;
}

// API and Integration Models
export interface APIKey extends BaseEntity {
  name: string;
  key: string; // Unique
  secret?: string;
  permissions: string[]; // Array of permissions
  isActive: boolean;
  lastUsed?: Timestamp;
  expiresAt?: Timestamp;
  createdBy: ID;
  creator: User;
}

// System settings and configuration
export interface Setting extends BaseEntity {
  key: string; // Unique
  value: string;
  category: string;
  isPublic: boolean;
}

// Rate limiting for API protection
export interface RateLimit extends BaseEntity {
  identifier: string; // IP address or user ID
  key: string; // API endpoint or action
  requests: number;
  windowStart: Timestamp;
}

// ============================================
// BILLING AND SUBSCRIPTION TYPES
// ============================================

export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CANCELLED' | 'TRIALING' | 'PAST_DUE';
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface Subscription extends BaseEntity {
  userId: ID;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  trialEndDate?: Timestamp;
  cancelledAt?: Timestamp;
  user: User;
}

export interface BillingHistory extends BaseEntity {
  userId: ID;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string;
  invoiceId?: ID;
  paymentMethodId?: ID;
  user: User;
}

// Extended Payment Method for UI components
export interface PaymentMethodDetails {
  id: ID;
  type: PaymentMethod;
  isDefault: boolean;
  // Card details
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  // Bank account details
  bankName?: string;
  bankLast4?: string;
  // Generic details
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// ADDITIONAL PRISMA SCHEMA TYPES
// ============================================

// Add missing UserRole enum to match Prisma schema
export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  CONSULTANT = 'CONSULTANT',
  GUEST = 'GUEST'
}

// NextAuth.js required models
export interface Account extends BaseEntity {
  userId: ID;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  user: User;
}

export interface Session extends BaseEntity {
  sessionToken: string;
  userId: ID;
  expires: Timestamp;
  user: User;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Timestamp;
}

// Enhanced User interface to match Prisma User model completely
export interface User extends BaseEntity {
  name?: string;
  email: string;
  emailVerified?: Timestamp;
  image?: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Timestamp;
  
  // Relations (optional for TypeScript usage)
  accounts?: Account[];
  sessions?: Session[];
  projects?: Project[];
  consultations?: any[]; // Will be properly typed when consultation types are fixed
  blogPosts?: BlogPost[];
  analytics?: Analytics[];
  newsletters?: Newsletter[];
  contacts?: Contact[];
  caseStudies?: CaseStudyEntry[];
  invoices?: Invoice[];
  activities?: UserActivity[];
  uploads?: FileUpload[];
  backups?: DataBackup[];
  apiKeys?: APIKey[];
  blogComments?: BlogComment[];
  blogRevisions?: BlogRevision[];
  documentVersions?: any[]; // DocumentVersion from consultation system
}

// Add missing PaymentMethod enum values to match Prisma
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  WIRE_TRANSFER = 'WIRE_TRANSFER',
  CHECK = 'CHECK',
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  SEPA_DEBIT = 'SEPA_DEBIT'
}

// Add missing PaymentStatus enum to match Prisma schema
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

// Add missing InvoiceStatus enum to match Prisma schema
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

// Add missing Project-related enums
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Project interface to match Prisma schema
export interface Project extends BaseEntity {
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  budget?: number; // Decimal in Prisma
  startDate?: Timestamp;
  endDate?: Timestamp;
  userId: ID;
  
  // Relations
  user: User;
  consultations?: any[]; // Will be properly typed when consultation types are fixed
  files: ProjectFile[];
  tasks: Task[];
  invoices: Invoice[];
}

export interface ProjectFile extends BaseEntity {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  projectId: ID;
  project: Project;
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  projectId: ID;
  project: Project;
}

// Enhanced Invoice interface to match Prisma schema completely
export interface Invoice extends BaseEntity {
  number: string; // Unique
  amount: number; // Decimal
  tax?: number; // Decimal
  total: number; // Decimal
  currency: string;
  status: InvoiceStatus;
  issuedDate?: Timestamp;
  dueDate?: Timestamp;
  paidDate?: Timestamp;
  description?: string;
  notes?: string;
  projectId?: ID;
  clientId: ID;
  
  // Relations
  client: User;
  project?: Project;
  items: InvoiceItem[];
  payments: Payment[];
}

export interface InvoiceItem extends BaseEntity {
  description: string;
  quantity: number; // Decimal
  rate: number; // Decimal
  amount: number; // Decimal
  invoiceId: ID;
  invoice: Invoice;
}

export interface Payment extends BaseEntity {
  amount: number; // Decimal
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string; // Unique
  reference?: string;
  notes?: string;
  processedAt?: Timestamp;
  invoiceId: ID;
  invoice: Invoice;
}