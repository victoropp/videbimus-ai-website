/**
 * Common type definitions used throughout the application
 * @fileoverview Central location for shared types and interfaces
 */

// Base Types
export type ID = string;
export type Timestamp = Date;
export type Email = string;
export type URL = string;
export type Slug = string;

// Status Types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type Theme = 'light' | 'dark' | 'system';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

// Utility Types
export interface BaseEntity {
  readonly id: ID;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

export interface WithMetadata {
  metadata?: Record<string, unknown>;
}

export interface WithSEO {
  seo: SEOData;
}

export interface WithImage {
  image: ImageData;
  imageAlt?: string;
}

export interface WithAuthor {
  author: Author;
}

export interface WithTags {
  tags: Tag[];
}

// Image Types
export interface ImageData {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: string;
  priority?: boolean;
}

// Author Types
export interface Author {
  id: ID;
  name: string;
  email?: Email;
  bio?: string;
  avatar?: ImageData;
  social?: SocialLinks;
}

// Social Media Types
export interface SocialLinks {
  twitter?: URL;
  linkedin?: URL;
  github?: URL;
  website?: URL;
}

// Tag Types
export interface Tag {
  id: ID;
  name: string;
  slug: Slug;
  color?: string;
  description?: string;
}

// SEO Types
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: ImageData;
  url?: URL;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: Timestamp;
  modifiedTime?: Timestamp;
  author?: string;
  section?: string;
  tags?: string[];
}

// Navigation Types
export interface NavigationItem {
  name: string;
  href: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  external?: boolean;
  badge?: string;
  children?: NavigationItem[];
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  status: 'success' | 'error';
  timestamp: Timestamp;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp: Timestamp;
}

// Form Types
export interface FormState<T = unknown> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// File Upload Types
export interface FileUpload {
  file: File;
  preview?: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// Notification Types
export interface Notification {
  id: ID;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Timestamp;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void | Promise<void>;
  variant?: 'primary' | 'secondary';
}

// Analytics Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: Timestamp;
  userId?: ID;
  sessionId?: ID;
}

// Configuration Types
export interface AppConfig {
  app: {
    name: string;
    description: string;
    version: string;
    url: URL;
  };
  api: {
    baseUrl: URL;
    timeout: number;
    retryAttempts: number;
  };
  features: {
    analytics: boolean;
    darkMode: boolean;
    collaboration: boolean;
    ai: boolean;
  };
  limits: {
    fileSize: number;
    requestSize: number;
    rateLimits: Record<string, number>;
  };
}