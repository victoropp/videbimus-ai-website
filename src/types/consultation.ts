/**
 * Consultation system type definitions
 * @fileoverview Types for consultation management, rooms, and collaboration features
 */

import type { BaseEntity, ID, Timestamp, Email, WithMetadata } from './common';

// Base consultation types matching Prisma schema
export interface Consultation extends BaseEntity {
  title: string;
  description?: string;
  status: ConsultationStatus;
  type: ConsultationType;
  duration?: number; // Duration in minutes
  scheduledAt?: Timestamp;
  completedAt?: Timestamp;
  notes?: string;
  userId: string;
  projectId?: string;
  room?: ConsultationRoom; // One-to-one relationship
  files: ConsultationFile[];
}

export enum ConsultationStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED'
}

export enum ConsultationType {
  DISCOVERY = 'DISCOVERY',
  STRATEGY = 'STRATEGY',
  TECHNICAL = 'TECHNICAL',
  REVIEW = 'REVIEW',
  TRAINING = 'TRAINING',
  FOLLOW_UP = 'FOLLOW_UP'
}

// Consultation Room types
export interface ConsultationRoom extends BaseEntity {
  name: string;
  description?: string;
  roomType: string; // consultation, training, review
  clientId: string;
  consultantId: string;
  scheduledAt?: Timestamp;
  durationMinutes?: number;
  status: ConsultationRoomStatus;
  settings: ConsultationRoomSettings;
  consultationId?: string; // Optional link to consultation
  completedAt?: Timestamp;
  
  // Relations
  client: any; // Use User from business.ts
  consultant: any; // Use User from business.ts
  consultation?: Consultation;
  messages: ConsultationMessage[];
  documents: ConsultationDocument[];
  whiteboards: ConsultationWhiteboard[];
  actionItems: ConsultationActionItem[];
  participants: ConsultationParticipant[];
  analytics?: ConsultationAnalytics;
}

export enum ConsultationRoomStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface ConsultationRoomSettings {
  autoRecording?: boolean;
  whiteboardEnabled?: boolean;
  chatEnabled?: boolean;
  documentSharingEnabled?: boolean;
  screenShareEnabled?: boolean;
  [key: string]: any; // For flexible settings stored as JSON
}

// Import User and UserRole from business types to avoid duplication
// Note: Use User interface from business.ts which matches the Prisma schema

// Message types
export interface ConsultationMessage extends BaseEntity {
  roomId: string;
  senderId: string;
  content: string;
  messageType: string; // text, file, system, action_item
  metadata: Record<string, any>;
  isEdited: boolean;
  editedAt?: Timestamp;
  isDeleted: boolean;
  deletedAt?: Timestamp;
  
  // Relations
  room: ConsultationRoom;
  sender: any; // Use User from business.ts
}

// Document types
export interface ConsultationDocument extends BaseEntity {
  roomId: string;
  title: string;
  description?: string;
  documentType: string; // document, template, attachment
  content?: string; // For text documents
  filePath?: string; // For uploaded files
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy?: string;
  isTemplate: boolean;
  isShared: boolean;
  version: number;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: Timestamp;
  
  // Relations
  room: ConsultationRoom;
  uploader?: any; // Use User from business.ts
  versions: DocumentVersion[];
}

export interface DocumentVersion extends BaseEntity {
  documentId: string;
  content?: string;
  version: number;
  changeNote?: string;
  createdBy: string;
  
  // Relations
  document: ConsultationDocument;
  creator: any; // Use User from business.ts
}

// Whiteboard types
export interface ConsultationWhiteboard extends BaseEntity {
  roomId: string;
  canvasData: any; // Fabric.js or Excalidraw JSON
  thumbnailUrl?: string;
  version: number;
  parentVersionId?: string;
  title: string;
  updatedBy?: string;
  
  // Relations
  room: ConsultationRoom;
  updater?: any; // Use User from business.ts
  parentVersion?: ConsultationWhiteboard;
  childVersions: ConsultationWhiteboard[];
}

// Action item types
export interface ConsultationActionItem extends BaseEntity {
  roomId: string;
  title: string;
  description?: string;
  priority: ActionItemPriority;
  assignedTo?: string;
  createdBy?: string;
  status: ActionItemStatus;
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  completionNotes?: string;
  
  // Relations
  room: ConsultationRoom;
  assignee?: any; // Use User from business.ts
  creator?: any; // Use User from business.ts
}

export enum ActionItemPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ActionItemStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Participant types
export interface ConsultationParticipant extends BaseEntity {
  roomId: string;
  userId: string;
  role: ParticipantRole;
  permissions: ParticipantPermissions;
  joinedAt: Timestamp;
  leftAt?: Timestamp;
  isActive: boolean;
  totalTimeMinutes: number;
  messagesSent: number;
  documentsViewed: number;
  
  // Relations
  room: ConsultationRoom;
  user: any; // Use User from business.ts
}

export enum ParticipantRole {
  HOST = 'host',
  CONSULTANT = 'consultant',
  CLIENT = 'client',
  PARTICIPANT = 'participant',
  OBSERVER = 'observer'
}

export interface ParticipantPermissions {
  canEdit: boolean;
  canShare: boolean;
  canInvite?: boolean;
  canRecord?: boolean;
  [key: string]: any;
}

// Analytics types
export interface ConsultationAnalytics extends BaseEntity {
  roomId: string;
  actualDurationMinutes?: number;
  participantCount?: number;
  messagesCount?: number;
  documentsShared?: number;
  actionItemsCreated?: number;
  avgResponseTimeSeconds?: number;
  toolUsage?: Record<string, any>;
  clientSatisfactionScore?: number;
  connectionIssues: number;
  featureErrors: number;
  followUpScheduled: boolean;
  projectProposed: boolean;
  contractSigned: boolean;
  projectValue?: number;
  recordedAt: Timestamp;
  
  // Relations
  room: ConsultationRoom;
}

// File types for consultation
export interface ConsultationFile extends BaseEntity {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  consultationId: string;
  
  // Relations
  consultation: Consultation;
}

// Real-time event types for consultation rooms
export interface ConsultationEvent {
  type: ConsultationEventType;
  roomId: string;
  userId?: string;
  payload: any;
  timestamp: Timestamp;
}

export enum ConsultationEventType {
  USER_JOINED = 'user-joined',
  USER_LEFT = 'user-left',
  MESSAGE_SENT = 'message-sent',
  MESSAGE_EDITED = 'message-edited',
  MESSAGE_DELETED = 'message-deleted',
  DOCUMENT_CREATED = 'document-created',
  DOCUMENT_UPDATED = 'document-updated',
  DOCUMENT_DELETED = 'document-deleted',
  WHITEBOARD_UPDATED = 'whiteboard-updated',
  ACTION_ITEM_CREATED = 'action-item-created',
  ACTION_ITEM_UPDATED = 'action-item-updated',
  SCREEN_SHARE_STARTED = 'screen-share-started',
  SCREEN_SHARE_STOPPED = 'screen-share-stopped',
  RECORDING_STARTED = 'recording-started',
  RECORDING_STOPPED = 'recording-stopped',
  ROOM_LOCKED = 'room-locked',
  ROOM_UNLOCKED = 'room-unlocked'
}

// API request/response types
export interface CreateConsultationRequest {
  title: string;
  description?: string;
  type: ConsultationType;
  duration?: number;
  scheduledAt?: string;
  userId: string;
  projectId?: string;
}

export interface CreateConsultationRoomRequest {
  name: string;
  description?: string;
  roomType?: string;
  clientId: string;
  consultantId: string;
  scheduledAt?: string;
  durationMinutes?: number;
  settings?: ConsultationRoomSettings;
  consultationId?: string;
}

export interface UpdateConsultationRequest {
  title?: string;
  description?: string;
  status?: ConsultationStatus;
  scheduledAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface UpdateConsultationRoomRequest {
  name?: string;
  description?: string;
  status?: ConsultationRoomStatus;
  settings?: ConsultationRoomSettings;
}

export interface ConsultationListResponse {
  consultations: Consultation[];
  total: number;
  page: number;
  limit: number;
}

export interface ConsultationRoomListResponse {
  rooms: ConsultationRoom[];
  total: number;
  page: number;
  limit: number;
}

// Dashboard and statistics types
export interface ConsultationDashboard {
  upcomingConsultations: Consultation[];
  activeRooms: ConsultationRoom[];
  recentActivity: ConsultationEvent[];
  statistics: ConsultationStatistics;
}

export interface ConsultationStatistics {
  totalConsultations: number;
  completedConsultations: number;
  activeRooms: number;
  averageRating: number;
  totalRevenue: number;
  thisMonthConsultations: number;
  conversionRate: number;
}

// Booking and scheduling types
export interface ConsultationBooking {
  consultationType: ConsultationType;
  preferredDate: string;
  preferredTime: string;
  duration: number;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  company?: string;
  projectDescription: string;
  budget?: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  consultantId?: string;
}

export interface ConsultationCalendar {
  month: number;
  year: number;
  slots: AvailabilitySlot[];
  consultations: Consultation[];
}