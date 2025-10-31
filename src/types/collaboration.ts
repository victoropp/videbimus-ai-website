/**
 * Simplified collaboration types for basic client portal
 * @fileoverview Essential types for project management and client interaction
 */

import type { BaseEntity, ID, Timestamp, Email, WithMetadata } from './common';

// User and UserRole are defined in business.ts to avoid conflicts
export type UserStatus = 'online' | 'offline';

// Simple Room/Workspace (for basic client portal)
export interface SimpleRoom {
  id: string;
  name: string;
  clientId: string;
  createdAt: Timestamp;
}

// Project, ProjectFile, ProjectStatus, Task, TaskStatus, Priority types are defined in business.ts
// to avoid conflicts and ensure consistency with Prisma schema

// Financial Types - Use types from business.ts to avoid conflicts
// Invoice, InvoiceItem, InvoiceStatus, Payment, PaymentStatus, PaymentMethod are defined in business.ts

// NOTE: Consultation types are defined in consultation.ts
// to maintain clear separation of concerns and avoid conflicts
