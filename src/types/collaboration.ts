/**
 * Simplified collaboration types for basic client portal
 * @fileoverview Essential types for project management and client interaction
 */

import type { BaseEntity, ID, Timestamp, Email, WithMetadata } from './common';

// Basic User Types (minimal)
export interface User extends BaseEntity {
  name: string;
  email: Email;
  avatar?: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'client' | 'user';
export type UserStatus = 'online' | 'offline';

// Simple Room/Workspace (for basic client portal)
export interface SimpleRoom {
  id: string;
  name: string;
  clientId: string;
  createdAt: Timestamp;
}

// Project Types (from Prisma schema - essential for business)
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Project extends BaseEntity {
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  budget?: number;
  startDate?: Timestamp;
  endDate?: Timestamp;
  userId: ID;

  // Relations
  user: User;
  consultations: Consultation[];
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

// Task Types (essential for project management)
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED';

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

// Financial Types (business-critical)
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE' | 'WIRE_TRANSFER' | 'CHECK' | 'CASH' | 'CARD' | 'BANK_ACCOUNT' | 'SEPA_DEBIT';

export interface Invoice extends BaseEntity {
  number: string;
  amount: number;
  tax?: number;
  total: number;
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
  quantity: number;
  rate: number;
  amount: number;
  invoiceId: ID;

  invoice: Invoice;
}

export interface Payment extends BaseEntity {
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  reference?: string;
  notes?: string;
  processedAt?: Timestamp;
  invoiceId: ID;

  invoice: Invoice;
}

// NOTE: Consultation types are defined in consultation.ts
// to maintain clear separation of concerns
export interface Consultation extends BaseEntity {
  // Reference to consultation.ts for full definition
}
