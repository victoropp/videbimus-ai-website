/**
 * AI and Machine Learning type definitions
 * @fileoverview Types related to AI services, models, and operations
 */

import type { BaseEntity, ID, Timestamp, WithMetadata } from './common';

// AI Model Types
export type ModelProvider = 'openai' | 'anthropic' | 'huggingface' | 'custom';
export type ModelType = 'language' | 'vision' | 'embedding' | 'audio' | 'multimodal';
export type ModelStatus = 'available' | 'training' | 'maintenance' | 'deprecated';

export interface AIModel extends BaseEntity, WithMetadata {
  name: string;
  displayName: string;
  description: string;
  provider: ModelProvider;
  type: ModelType;
  status: ModelStatus;
  version: string;
  capabilities: ModelCapability[];
  limits: ModelLimits;
  pricing: ModelPricing;
  configuration: ModelConfiguration;
}

export interface ModelCapability {
  name: string;
  description: string;
  supported: boolean;
  beta?: boolean;
}

export interface ModelLimits {
  maxTokens: number;
  maxInputLength: number;
  requestsPerMinute: number;
  requestsPerDay: number;
  concurrent: number;
}

export interface ModelPricing {
  inputPrice: number;
  outputPrice: number;
  unit: 'token' | 'request' | 'minute';
  currency: string;
}

export interface ModelConfiguration {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  systemPrompt?: string;
  stopSequences?: string[];
}

// Chat Types
export interface ChatSession extends BaseEntity {
  title?: string;
  userId?: ID;
  modelId: ID;
  messages: ChatMessage[];
  configuration: ModelConfiguration;
  status: 'active' | 'completed' | 'error';
  totalTokens: number;
  cost: number;
}

export interface ChatMessage {
  id: ID;
  role: MessageRole;
  content: string;
  timestamp: Timestamp;
  tokens: number;
  metadata?: MessageMetadata;
  attachments?: MessageAttachment[];
}

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface MessageMetadata {
  model?: string;
  temperature?: number;
  processingTime?: number;
  cost?: number;
  reasoning?: string;
  citations?: Citation[];
}

export interface MessageAttachment {
  id: ID;
  type: 'image' | 'document' | 'audio' | 'video';
  name: string;
  size: number;
  url: string;
  mimeType: string;
}

export interface Citation {
  source: string;
  url?: string;
  excerpt?: string;
  confidence?: number;
}

// AI Service Types
export type AIServiceType = 
  | 'text-generation' 
  | 'summarization' 
  | 'sentiment-analysis' 
  | 'entity-extraction' 
  | 'translation' 
  | 'transcription' 
  | 'image-generation' 
  | 'code-generation';

export interface AIService extends BaseEntity {
  name: string;
  type: AIServiceType;
  description: string;
  endpoint: string;
  model: AIModel;
  status: 'active' | 'inactive' | 'maintenance';
  rateLimits: RateLimits;
  authentication: AuthenticationConfig;
}

export interface RateLimits {
  requests: {
    perSecond: number;
    perMinute: number;
    perHour: number;
    perDay: number;
  };
  tokens: {
    perRequest: number;
    perMinute: number;
    perDay: number;
  };
}

export interface AuthenticationConfig {
  type: 'api-key' | 'oauth' | 'jwt';
  required: boolean;
  scopes?: string[];
}

// Demo and Showcase Types
export interface AIDemo extends BaseEntity {
  name: string;
  title: string;
  description: string;
  type: AIServiceType;
  model: AIModel;
  configuration: DemoConfiguration;
  examples: DemoExample[];
  featured: boolean;
  active: boolean;
}

export interface DemoConfiguration {
  inputTypes: InputType[];
  outputTypes: OutputType[];
  maxInputLength: number;
  allowFileUpload: boolean;
  supportedFormats?: string[];
  presets?: ConfigurationPreset[];
}

export type InputType = 'text' | 'file' | 'url' | 'image' | 'audio';
export type OutputType = 'text' | 'json' | 'image' | 'audio' | 'file';

export interface ConfigurationPreset {
  name: string;
  description: string;
  configuration: ModelConfiguration;
}

export interface DemoExample {
  id: ID;
  title: string;
  input: string | object;
  expectedOutput: string | object;
  description?: string;
  category?: string;
}

// AI Task Types
export interface AITask extends BaseEntity {
  name: string;
  type: AIServiceType;
  status: AITaskStatus;
  input: AITaskInput;
  output?: AITaskOutput;
  model: AIModel;
  configuration: ModelConfiguration;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId?: ID;
  sessionId?: ID;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  error?: AITaskError;
  metrics: AITaskMetrics;
}

export type AITaskStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface AITaskInput {
  text?: string;
  files?: string[];
  parameters?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface AITaskOutput {
  result: string | object;
  confidence?: number;
  alternatives?: Array<{
    result: string | object;
    confidence: number;
  }>;
  metadata?: Record<string, unknown>;
}

export interface AITaskError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
  retryCount: number;
}

export interface AITaskMetrics {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  processingTime: number;
  cost: number;
  modelVersion: string;
}

// Knowledge Base Types
export interface KnowledgeBase extends BaseEntity {
  name: string;
  description: string;
  type: 'vector' | 'graph' | 'relational';
  status: 'building' | 'ready' | 'updating' | 'error';
  documents: KnowledgeDocument[];
  embeddings: EmbeddingConfig;
  search: SearchConfig;
  metrics: KnowledgeBaseMetrics;
}

export interface KnowledgeDocument extends BaseEntity {
  title: string;
  content: string;
  source: string;
  type: 'text' | 'pdf' | 'webpage' | 'api';
  processed: boolean;
  chunks: DocumentChunk[];
  embeddings?: number[][];
  metadata?: DocumentMetadata;
}

export interface DocumentChunk {
  id: ID;
  content: string;
  index: number;
  tokens: number;
  embedding?: number[];
  metadata?: Record<string, unknown>;
}

export interface DocumentMetadata {
  author?: string;
  publishDate?: Timestamp;
  category?: string;
  tags?: string[];
  language?: string;
  source?: string;
}

export interface EmbeddingConfig {
  model: string;
  dimensions: number;
  provider: ModelProvider;
  batchSize: number;
}

export interface SearchConfig {
  algorithm: 'cosine' | 'euclidean' | 'dot-product';
  threshold: number;
  maxResults: number;
  rerank: boolean;
}

export interface KnowledgeBaseMetrics {
  documentCount: number;
  chunkCount: number;
  totalTokens: number;
  avgChunkSize: number;
  indexSize: number;
  lastUpdated: Timestamp;
}

// Recommendation Types
export interface Recommendation extends BaseEntity {
  title: string;
  description: string;
  type: 'content' | 'service' | 'action' | 'optimization';
  confidence: number;
  reasoning: string;
  targetId: ID;
  targetType: string;
  userId?: ID;
  metadata?: RecommendationMetadata;
  accepted?: boolean;
  feedback?: RecommendationFeedback;
}

export interface RecommendationMetadata {
  algorithm: string;
  features: Record<string, unknown>;
  alternatives?: Recommendation[];
  explain?: string;
}

export interface RecommendationFeedback {
  rating: number;
  comment?: string;
  useful: boolean;
  timestamp: Timestamp;
}