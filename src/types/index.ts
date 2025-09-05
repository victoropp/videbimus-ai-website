/**
 * Centralized type definitions and re-exports
 * @fileoverview Main entry point for all application types
 */

// Re-export all common types
export * from './common';

// Re-export business domain types (includes User, enums, etc.)
export * from './business';

// Re-export AI and ML types
export * from './ai';

// Re-export collaboration types
export * from './collaboration';

// Re-export consultation types
export * from './consultation';

// Legacy type aliases for backward compatibility
// These will be deprecated in favor of the more comprehensive types above

import type { NavigationItem, SEOData as SEO } from './common';
import type { 
  Service, 
  TeamMember, 
  Testimonial, 
  CaseStudy, 
  BlogPost,
  ContactFormData 
} from './business';

/** @deprecated Use NavigationItem instead */
export type NavItem = NavigationItem;

/** @deprecated Use SEO instead */
export type SEOData = SEO;

// Re-export specific commonly used types for convenience
export type {
  // Business types
  Service,
  TeamMember,
  Testimonial,
  CaseStudy,
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogSearchResult,
  PostStatus,
  ContactFormData,
  Lead,
  Client,
  Technology,
  
  // System and monitoring types
  Contact,
  Newsletter,
  Analytics,
  PerformanceMetric,
  SystemHealth,
  UserActivity,
  FileUpload,
  DataBackup,
  CacheEntry,
  APIKey,
  Setting,
  RateLimit,
  
  // Blog extended types
  BlogPostTag,
  BlogComment,
  BlogImage,
  BlogRevision,
  
  // Billing and subscription types
  Subscription,
  BillingHistory,
  PaymentMethodDetails,
} from './business';

export type {
  // Collaboration types
  Room,
  Meeting,
  SharedDocument,
  WhiteboardElement,
  CodeSession,
} from './collaboration';

export type {
  // Consultation and project types  
  Consultation,
  ConsultationRoom,
  ConsultationMessage,
  ConsultationDocument,
  ConsultationWhiteboard,
  ConsultationActionItem,
  ConsultationParticipant,
  ConsultationAnalytics,
  ConsultationFile,
  DocumentVersion,
} from './consultation';

export type {
  // Business and system types now include User, Project, etc.
  User,
  Project,
  ProjectFile,
  Task,
  Invoice,
  InvoiceItem,
  Payment,
  Account,
  Session,
  VerificationToken,
} from './business';

export type {
  ModelProvider,
  AIServiceType,
  MessageRole,
  AITaskStatus,
} from './ai';

export type {
  // Collaboration enum types
  UserStatus,
  RoomType,
  MeetingType,
  DocumentType,
  ElementType,
  Tool,
  ActivityType,
} from './collaboration';

export type {
  // Consultation enum types
  ConsultationStatus,
  ConsultationType,
  ConsultationRoomStatus,
} from './consultation';

export type {
  // Business and system enum types
  UserRole,
  Priority,
  ProjectStatus,
  TaskStatus,
  InvoiceStatus,
  PaymentStatus,
  PaymentMethod,
  ContactStatus,
  NewsletterStatus,
  MetricType,
  BackupType,
  BackupStatus,
  CaseStudyStatus,
  SubscriptionStatus,
  BillingCycle,
} from './business';