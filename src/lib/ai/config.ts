import { z } from 'zod';

// AI Configuration Schema
export const aiConfigSchema = z.object({
  // API Keys
  openaiApiKey: z.string().optional(),
  anthropicApiKey: z.string().optional(),
  huggingfaceApiKey: z.string().optional(),
  cohereApiKey: z.string().optional(),
  groqApiKey: z.string().optional(),
  googleApiKey: z.string().optional(),
  togetherApiKey: z.string().optional(),
  replicateApiKey: z.string().optional(),
  
  // Vector Database
  pineconeApiKey: z.string().optional(),
  pineconeEnvironment: z.string().optional(),
  pineconeIndex: z.string().default('videbimus-knowledge-base'),
  
  // AI Configuration
  provider: z.enum(['openai', 'anthropic', 'huggingface', 'cohere', 'groq', 'google', 'together', 'replicate']).default('huggingface'),
  defaultModel: z.string().default('microsoft/DialoGPT-medium'),
  maxTokens: z.number().default(4096),
  temperature: z.number().min(0).max(2).default(0.7),
  streamingEnabled: z.boolean().default(true),
  
  // RAG Configuration
  embeddingModel: z.string().default('text-embedding-3-small'),
  chunkSize: z.number().default(1000),
  chunkOverlap: z.number().default(200),
  maxRetrievalDocuments: z.number().default(5),
  
  // Features
  enableChat: z.boolean().default(true),
  enableDemos: z.boolean().default(true),
  enableTranscription: z.boolean().default(true),
  enableDocumentAnalysis: z.boolean().default(true),
  enableRecommendations: z.boolean().default(true),
});

export type AIConfig = z.infer<typeof aiConfigSchema>;

// Load configuration from environment variables
export const aiConfig: AIConfig = aiConfigSchema.parse({
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
  cohereApiKey: process.env.COHERE_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  googleApiKey: process.env.GOOGLE_API_KEY,
  togetherApiKey: process.env.TOGETHER_API_KEY,
  replicateApiKey: process.env.REPLICATE_API_KEY,
  pineconeApiKey: process.env.PINECONE_API_KEY,
  pineconeEnvironment: process.env.PINECONE_ENVIRONMENT,
  pineconeIndex: process.env.PINECONE_INDEX,
  provider: process.env.AI_MODEL_PROVIDER as 'openai' | 'anthropic' | 'huggingface',
  defaultModel: process.env.DEFAULT_MODEL,
  maxTokens: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : undefined,
  temperature: process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : undefined,
  streamingEnabled: process.env.STREAMING_ENABLED === 'true',
  embeddingModel: process.env.EMBEDDING_MODEL,
  chunkSize: process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE) : undefined,
  chunkOverlap: process.env.CHUNK_OVERLAP ? parseInt(process.env.CHUNK_OVERLAP) : undefined,
  maxRetrievalDocuments: process.env.MAX_RETRIEVAL_DOCUMENTS ? parseInt(process.env.MAX_RETRIEVAL_DOCUMENTS) : undefined,
  enableChat: process.env.ENABLE_AI_CHAT !== 'false',
  enableDemos: process.env.ENABLE_AI_DEMOS !== 'false',
  enableTranscription: process.env.ENABLE_TRANSCRIPTION !== 'false',
  enableDocumentAnalysis: process.env.ENABLE_DOCUMENT_ANALYSIS !== 'false',
  enableRecommendations: process.env.ENABLE_RECOMMENDATIONS !== 'false',
});

// Model configurations
export const modelConfigs = {
  openai: {
    'gpt-4-turbo-preview': { maxTokens: 4096, contextWindow: 128000 },
    'gpt-4': { maxTokens: 4096, contextWindow: 8192 },
    'gpt-3.5-turbo': { maxTokens: 4096, contextWindow: 16384 },
    'gpt-4o': { maxTokens: 4096, contextWindow: 128000 },
    'gpt-4o-mini': { maxTokens: 4096, contextWindow: 128000 },
  },
  anthropic: {
    'claude-3-opus-20240229': { maxTokens: 4096, contextWindow: 200000 },
    'claude-3-sonnet-20240229': { maxTokens: 4096, contextWindow: 200000 },
    'claude-3-haiku-20240307': { maxTokens: 4096, contextWindow: 200000 },
    'claude-3-5-sonnet-20241022': { maxTokens: 8192, contextWindow: 200000 },
  },
  huggingface: {
    'microsoft/DialoGPT-medium': { maxTokens: 1000, contextWindow: 1024 },
    'facebook/blenderbot-400M-distill': { maxTokens: 1000, contextWindow: 512 },
    'mistralai/Mistral-7B-Instruct-v0.2': { maxTokens: 2048, contextWindow: 8192 },
    'google/flan-t5-xxl': { maxTokens: 512, contextWindow: 512 },
    'HuggingFaceH4/zephyr-7b-beta': { maxTokens: 2048, contextWindow: 8192 },
    'tiiuae/falcon-7b-instruct': { maxTokens: 2048, contextWindow: 2048 },
  },
  groq: {
    'mixtral-8x7b-32768': { maxTokens: 32768, contextWindow: 32768 },
    'llama2-70b-4096': { maxTokens: 4096, contextWindow: 4096 },
    'gemma-7b-it': { maxTokens: 8192, contextWindow: 8192 },
  },
  cohere: {
    'command': { maxTokens: 4096, contextWindow: 4096 },
    'command-nightly': { maxTokens: 4096, contextWindow: 4096 },
    'command-light': { maxTokens: 4096, contextWindow: 4096 },
  },
  google: {
    'gemini-pro': { maxTokens: 30720, contextWindow: 30720 },
    'gemini-pro-vision': { maxTokens: 12288, contextWindow: 12288 },
  },
  together: {
    'mistralai/Mixtral-8x7B-Instruct-v0.1': { maxTokens: 32768, contextWindow: 32768 },
    'meta-llama/Llama-2-70b-chat-hf': { maxTokens: 4096, contextWindow: 4096 },
    'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO': { maxTokens: 32768, contextWindow: 32768 },
  },
  replicate: {
    'llama2-70b': { maxTokens: 4096, contextWindow: 4096 },
    'llama2-13b': { maxTokens: 4096, contextWindow: 4096 },
    'mistral-7b': { maxTokens: 8192, contextWindow: 8192 },
    'mixtral-8x7b': { maxTokens: 32768, contextWindow: 32768 },
    'codellama-70b': { maxTokens: 4096, contextWindow: 16384 },
  },
};

export const embeddingConfigs = {
  openai: {
    'text-embedding-3-small': { dimensions: 1536, maxTokens: 8191 },
    'text-embedding-3-large': { dimensions: 3072, maxTokens: 8191 },
    'text-embedding-ada-002': { dimensions: 1536, maxTokens: 8191 },
  },
};