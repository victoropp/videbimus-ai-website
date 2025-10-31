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

// All types are already exported via wildcard exports above
// No need for explicit re-exports as they're handled by:
// - export * from './common' (lines 7)
// - export * from './business' (line 10)
// - export * from './ai' (line 13)
// - export * from './collaboration' (line 16)
// - export * from './consultation' (line 19)