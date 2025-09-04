/**
 * Collaboration and real-time features type definitions
 * @fileoverview Types for collaboration tools, meetings, chat, and shared workspaces
 */

import type { BaseEntity, ID, Timestamp, Email, WithMetadata } from './common';

// User and Presence Types
export interface User extends BaseEntity {
  name: string;
  email: Email;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  lastSeen: Timestamp;
  preferences: UserPreferences;
  profile?: UserProfile;
}

// Import UserRole from business types to avoid duplication
// Note: UserRole is defined in business.ts to match Prisma schema
export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  language: string;
  timezone: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  mentions: boolean;
  directMessages: boolean;
  meetingReminders: boolean;
}

export interface UserProfile {
  bio?: string;
  company?: string;
  title?: string;
  location?: string;
  skills?: string[];
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

// Room and Workspace Types
export interface Room extends BaseEntity, WithMetadata {
  name: string;
  description?: string;
  type: RoomType;
  status: RoomStatus;
  privacy: 'public' | 'private' | 'invite-only';
  capacity: number;
  owner: User;
  members: RoomMember[];
  settings: RoomSettings;
  activities: RoomActivity[];
  documents: SharedDocument[];
}

export type RoomType = 'meeting' | 'project' | 'whiteboard' | 'code' | 'general';
export type RoomStatus = 'active' | 'archived' | 'suspended';

export interface RoomMember {
  user: User;
  role: RoomRole;
  joinedAt: Timestamp;
  permissions: RoomPermissions;
  presence: UserPresence;
}

export type RoomRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface RoomPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canManage: boolean;
  canPresent: boolean;
  canRecord: boolean;
}

export interface RoomSettings {
  autoRecording: boolean;
  muteOnJoin: boolean;
  videoOnJoin: boolean;
  chatEnabled: boolean;
  whiteboardEnabled: boolean;
  codeEditorEnabled: boolean;
  allowGuests: boolean;
  maxDuration?: number;
  moderationEnabled: boolean;
}

export interface UserPresence {
  status: UserStatus;
  lastSeen: Timestamp;
  cursor?: CursorPosition;
  selection?: SelectionRange;
  activeDocument?: ID;
}

export interface CursorPosition {
  x: number;
  y: number;
  documentId?: ID;
  elementId?: string;
}

export interface SelectionRange {
  start: number;
  end: number;
  documentId: ID;
}

// Meeting Types
export interface Meeting extends BaseEntity {
  title: string;
  description?: string;
  type: MeetingType;
  status: MeetingStatus;
  startTime: Timestamp;
  endTime?: Timestamp;
  duration: number;
  roomId: ID;
  organizer: User;
  participants: MeetingParticipant[];
  agenda?: MeetingAgenda;
  recording?: MeetingRecording;
  transcription?: MeetingTranscription;
  settings: MeetingSettings;
  links: MeetingLinks;
}

export type MeetingType = 'scheduled' | 'instant' | 'recurring';
export type MeetingStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface MeetingParticipant {
  user: User;
  role: ParticipantRole;
  joinedAt?: Timestamp;
  leftAt?: Timestamp;
  status: ParticipantStatus;
  permissions: ParticipantPermissions;
}

export type ParticipantRole = 'host' | 'co-host' | 'participant' | 'observer';
export type ParticipantStatus = 'invited' | 'joined' | 'left' | 'ejected';

export interface ParticipantPermissions {
  canSpeak: boolean;
  canVideo: boolean;
  canScreenShare: boolean;
  canChat: boolean;
  canDraw: boolean;
  canRecord: boolean;
}

export interface MeetingAgenda {
  items: AgendaItem[];
  timeAllocated: number;
  currentItem?: ID;
}

export interface AgendaItem {
  id: ID;
  title: string;
  description?: string;
  duration: number;
  speaker?: User;
  completed: boolean;
  notes?: string;
}

export interface MeetingRecording {
  id: ID;
  url: string;
  duration: number;
  size: number;
  status: 'processing' | 'ready' | 'failed';
  downloadUrl?: string;
  thumbnails?: string[];
}

export interface MeetingTranscription {
  id: ID;
  content: string;
  language: string;
  confidence: number;
  speakers: SpeakerInfo[];
  timestamps: TranscriptionSegment[];
}

export interface SpeakerInfo {
  id: ID;
  name?: string;
  userId?: ID;
  confidence: number;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  speakerId: ID;
  text: string;
  confidence: number;
}

export interface MeetingSettings {
  recordingEnabled: boolean;
  transcriptionEnabled: boolean;
  chatEnabled: boolean;
  screenShareEnabled: boolean;
  whiteboardEnabled: boolean;
  waitingRoom: boolean;
  password?: string;
}

export interface MeetingLinks {
  join: string;
  guest?: string;
  phone?: string;
}

// Chat Types
export interface ChatMessage extends BaseEntity {
  content: string;
  author: User;
  roomId: ID;
  threadId?: ID;
  type: MessageType;
  status: MessageStatus;
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
  mentions: MessageMention[];
  editedAt?: Timestamp;
  deletedAt?: Timestamp;
}

export type MessageType = 'text' | 'file' | 'image' | 'system' | 'code' | 'poll';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageReaction {
  emoji: string;
  users: User[];
  count: number;
}

export interface MessageAttachment {
  id: ID;
  name: string;
  type: string;
  size: number;
  url: string;
  preview?: string;
  metadata?: Record<string, unknown>;
}

export interface MessageMention {
  userId: ID;
  text: string;
  start: number;
  end: number;
}

export interface ChatThread extends BaseEntity {
  parentMessageId: ID;
  participants: User[];
  messageCount: number;
  lastMessage?: ChatMessage;
  archived: boolean;
}

// Document Collaboration Types
export interface SharedDocument extends BaseEntity, WithMetadata {
  title: string;
  content: string;
  type: DocumentType;
  roomId: ID;
  author: User;
  collaborators: DocumentCollaborator[];
  version: number;
  history: DocumentVersion[];
  permissions: DocumentPermissions;
  status: DocumentStatus;
}

export type DocumentType = 'text' | 'code' | 'whiteboard' | 'spreadsheet' | 'presentation';
export type DocumentStatus = 'draft' | 'review' | 'published' | 'archived';

export interface DocumentCollaborator {
  user: User;
  role: 'owner' | 'editor' | 'reviewer' | 'viewer';
  lastAccess: Timestamp;
  presence: UserPresence;
}

export interface DocumentVersion {
  id: ID;
  content: string;
  author: User;
  timestamp: Timestamp;
  changes: DocumentChange[];
  comment?: string;
}

export interface DocumentChange {
  type: 'insert' | 'delete' | 'format';
  position: number;
  length: number;
  content?: string;
  attributes?: Record<string, unknown>;
}

export interface DocumentPermissions {
  read: boolean;
  write: boolean;
  comment: boolean;
  share: boolean;
  delete: boolean;
}

// Whiteboard Types
export interface WhiteboardElement extends BaseEntity {
  type: ElementType;
  position: Position;
  size: Size;
  style: ElementStyle;
  content?: string;
  path?: Point[];
  author: User;
  locked: boolean;
  zIndex: number;
}

export type ElementType = 
  | 'rectangle' 
  | 'circle' 
  | 'line' 
  | 'arrow' 
  | 'text' 
  | 'sticky-note' 
  | 'image' 
  | 'freehand';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ElementStyle {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface WhiteboardState {
  elements: WhiteboardElement[];
  viewport: Viewport;
  tool: Tool;
  selectedElements: ID[];
  cursors: UserCursor[];
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export type Tool = 
  | 'select' 
  | 'rectangle' 
  | 'circle' 
  | 'line' 
  | 'arrow' 
  | 'text' 
  | 'sticky-note' 
  | 'freehand' 
  | 'eraser';

export interface UserCursor {
  userId: ID;
  position: Position;
  tool: Tool;
  color: string;
}

// Code Editor Types
export interface CodeSession extends BaseEntity {
  roomId: ID;
  language: string;
  content: string;
  cursors: CodeCursor[];
  selections: CodeSelection[];
  version: number;
  author: User;
  settings: CodeEditorSettings;
}

export interface CodeCursor {
  userId: ID;
  line: number;
  column: number;
  color: string;
}

export interface CodeSelection {
  userId: ID;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  color: string;
}

export interface CodeEditorSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  autoSave: boolean;
  livePreview: boolean;
}

// Activity and Notifications
export interface RoomActivity extends BaseEntity {
  type: ActivityType;
  description: string;
  actor: User;
  target?: {
    type: string;
    id: ID;
    name: string;
  };
  metadata?: Record<string, unknown>;
}

export type ActivityType = 
  | 'user-joined' 
  | 'user-left' 
  | 'document-created' 
  | 'document-updated' 
  | 'message-sent' 
  | 'meeting-started' 
  | 'meeting-ended' 
  | 'screen-shared' 
  | 'recording-started' 
  | 'recording-stopped';

export interface RealTimeEvent {
  type: string;
  payload: unknown;
  timestamp: Timestamp;
  roomId?: ID;
  userId?: ID;
  broadcast: boolean;
}

// NOTE: Consultation types have been moved to consultation.ts
// to avoid duplication and maintain clear separation of concerns

// Project Types (from Prisma schema)
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

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

// Task Types
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

// Financial Types
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE' | 'WIRE_TRANSFER' | 'CHECK' | 'CASH' | 'CARD' | 'BANK_ACCOUNT' | 'SEPA_DEBIT';

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