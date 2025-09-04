/**
 * Centralized type definitions and re-exports
 * @fileoverview Main entry point for all application types
 */

// Re-export all common types
export * from './common';

// Re-export business domain types
export * from './business';

// Re-export AI and ML types
export * from './ai';

// Re-export collaboration types
export * from './collaboration';

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
  // Common types
  ID,
  Timestamp,
  Email,
  URL,
  Slug,
  Status,
  Theme,
  Size,
  Variant,
  NavigationItem,
  ApiResponse,
  PaginatedResponse,
  FormState,
  
  // Business types
  Service,
  TeamMember,
  Testimonial,
  CaseStudy,
  BlogPost,
  BlogSearchResult,
  PostStatus,
  ContactFormData,
  Lead,
  Client,
  Technology,
  
  // AI types
  AIModel,
  ChatSession,
  ChatMessage,
  AIDemo,
  AITask,
  KnowledgeBase,
  Recommendation,
  
  // Collaboration types
  User,
  Room,
  Meeting,
  SharedDocument,
  WhiteboardElement,
  CodeSession,
} from './business';

export type {
  ModelProvider,
  AIServiceType,
  MessageRole,
  AITaskStatus,
} from './ai';

export type {
  UserRole,
  UserStatus,
  RoomType,
  MeetingType,
  DocumentType,
  ElementType,
  Tool,
  ActivityType,
} from './collaboration';