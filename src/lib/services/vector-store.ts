import { Pinecone, Index, RecordMetadata } from '@pinecone-database/pinecone';
import { getServiceConfig } from '../config/services';
import { withErrorHandling, ServiceErrorType, CustomServiceError } from './error-handler';
import { aiService } from './ai';
import crypto from 'crypto';

export interface VectorDocument {
  id: string;
  content: string;
  metadata: {
    source?: string;
    sourceType?: 'document' | 'webpage' | 'chat' | 'knowledge_base';
    title?: string;
    author?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
    category?: string;
    language?: string;
    [key: string]: any;
  };
  embedding?: number[];
}

export interface SearchOptions {
  topK?: number;
  includeMetadata?: boolean;
  includeValues?: boolean;
  filter?: Record<string, any>;
  namespace?: string;
}

export interface SearchResult {
  id: string;
  score: number;
  content?: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}

export interface UpsertResult {
  upsertedCount: number;
  failed?: {
    id: string;
    error: string;
  }[];
}

export interface IndexStats {
  namespaces: Record<string, {
    vectorCount: number;
  }>;
  dimension: number;
  indexFullness: number;
  totalVectorCount: number;
}

export interface ChunkingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  preserveStructure?: boolean;
  separators?: string[];
}

class VectorStoreService {
  private pinecone: Pinecone;
  private index: Index;
  private config: ReturnType<typeof getServiceConfig>['pinecone'];
  private defaultNamespace = 'default';

  constructor() {
    this.config = getServiceConfig().pinecone;
    
    this.pinecone = new Pinecone({
      apiKey: this.config.apiKey,
      environment: this.config.environment,
    });
    
    this.index = this.pinecone.index(this.config.index);
  }

  // Chunk text into smaller pieces for better embeddings
  chunkText(text: string, options: ChunkingOptions = {}): string[] {
    const {
      chunkSize = 1000,
      chunkOverlap = 200,
      preserveStructure = true,
      separators = ['\n\n', '\n', '. ', '? ', '! ', ' ']
    } = options;

    if (text.length <= chunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    let currentChunk = '';
    let currentIndex = 0;

    // Split by separators in order of preference
    const splitBySeparator = (text: string, separators: string[]): string[] => {
      if (separators.length === 0) {
        // Fallback to character splitting
        return text.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];
      }

      const separator = separators[0];
      const parts = text.split(separator);
      
      if (parts.length === 1) {
        // Try next separator
        return splitBySeparator(text, separators.slice(1));
      }

      return parts;
    };

    const sentences = splitBySeparator(text, separators);
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;

      if (currentChunk.length + trimmed.length + 1 <= chunkSize) {
        currentChunk += (currentChunk ? ' ' : '') + trimmed;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          
          // Handle overlap
          if (chunkOverlap > 0 && currentChunk.length > chunkOverlap) {
            const overlapText = currentChunk.slice(-chunkOverlap);
            currentChunk = overlapText + ' ' + trimmed;
          } else {
            currentChunk = trimmed;
          }
        } else {
          // Single sentence is too long, split it
          if (trimmed.length > chunkSize) {
            const parts = trimmed.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];
            chunks.push(...parts);
            currentChunk = '';
          } else {
            currentChunk = trimmed;
          }
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  // Generate embeddings for text chunks
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    try {
      const response = await aiService.generateEmbeddings(texts, {
        model: 'text-embedding-3-small',
      });

      return response.embeddings;
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.AI_SERVICE,
        service: 'vector-store',
        operation: 'generateEmbeddings',
        message: `Failed to generate embeddings: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { textsCount: texts.length },
      });
    }
  }

  // Upsert documents to vector store
  async upsertDocuments(
    documents: VectorDocument[],
    namespace?: string
  ): Promise<UpsertResult> {
    if (documents.length === 0) {
      return { upsertedCount: 0 };
    }

    try {
      const vectors: any[] = [];
      const failed: { id: string; error: string }[] = [];

      for (const doc of documents) {
        try {
          let embedding = doc.embedding;
          
          // Generate embedding if not provided
          if (!embedding) {
            const embeddings = await this.generateEmbeddings([doc.content]);
            embedding = embeddings[0];
          }

          if (!embedding || embedding.length === 0) {
            failed.push({ id: doc.id, error: 'Failed to generate embedding' });
            continue;
          }

          vectors.push({
            id: doc.id,
            values: embedding,
            metadata: {
              content: doc.content.length > 40000 ? doc.content.slice(0, 40000) + '...' : doc.content,
              ...doc.metadata,
            },
          });
        } catch (error) {
          failed.push({ 
            id: doc.id, 
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      if (vectors.length === 0) {
        return { upsertedCount: 0, failed };
      }

      // Batch upsert in chunks of 100 (Pinecone limit)
      const batchSize = 100;
      let totalUpserted = 0;

      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        
        await this.index.namespace(namespace || this.defaultNamespace).upsert(batch);
        totalUpserted += batch.length;
      }

      return {
        upsertedCount: totalUpserted,
        failed: failed.length > 0 ? failed : undefined,
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VECTOR_DATABASE,
        service: 'vector-store',
        operation: 'upsertDocuments',
        message: `Failed to upsert documents: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { 
          documentsCount: documents.length,
          namespace: namespace || this.defaultNamespace,
        },
      });
    }
  }

  // Add a single document (with automatic chunking if needed)
  async addDocument(
    document: Omit<VectorDocument, 'id'> & { id?: string },
    options: {
      namespace?: string;
      chunkingOptions?: ChunkingOptions;
      generateId?: boolean;
    } = {}
  ): Promise<string[]> {
    try {
      const { chunkingOptions, generateId = true } = options;
      const chunks = this.chunkText(document.content, chunkingOptions);
      
      const documentsToUpsert: VectorDocument[] = chunks.map((chunk, index) => {
        const baseId = document.id || (generateId ? this.generateDocumentId(chunk) : `doc-${Date.now()}`);
        const chunkId = chunks.length > 1 ? `${baseId}-chunk-${index}` : baseId;
        
        return {
          id: chunkId,
          content: chunk,
          metadata: {
            ...document.metadata,
            chunkIndex: index,
            totalChunks: chunks.length,
            originalDocumentId: baseId,
          },
        };
      });

      await this.upsertDocuments(documentsToUpsert, options.namespace);
      return documentsToUpsert.map(doc => doc.id);
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VECTOR_DATABASE,
        service: 'vector-store',
        operation: 'addDocument',
        message: `Failed to add document: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { documentLength: document.content.length },
      });
    }
  }

  // Search for similar documents
  async searchSimilar(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbeddings = await this.generateEmbeddings([query]);
      const queryEmbedding = queryEmbeddings[0];

      if (!queryEmbedding) {
        throw new Error('Failed to generate query embedding');
      }

      // Perform vector search
      const searchResponse = await this.index.namespace(options.namespace || this.defaultNamespace).query({
        vector: queryEmbedding,
        topK: options.topK || 10,
        includeMetadata: options.includeMetadata ?? true,
        includeValues: options.includeValues ?? false,
        filter: options.filter,
      });

      return searchResponse.matches?.map(match => ({
        id: match.id,
        score: match.score || 0,
        content: match.metadata?.content as string,
        metadata: match.metadata,
        embedding: match.values,
      })) || [];
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VECTOR_DATABASE,
        service: 'vector-store',
        operation: 'searchSimilar',
        message: `Failed to search similar documents: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { query, options },
      });
    }
  }

  // Search with hybrid approach (vector + metadata filtering)
  async hybridSearch(
    query: string,
    filters: {
      metadata?: Record<string, any>;
      tags?: string[];
      category?: string;
      sourceType?: string;
      dateRange?: {
        start?: string;
        end?: string;
      };
    } = {},
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      // Build filter conditions
      const pineconeFilter: Record<string, any> = {};
      
      if (filters.metadata) {
        Object.assign(pineconeFilter, filters.metadata);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        pineconeFilter.tags = { $in: filters.tags };
      }
      
      if (filters.category) {
        pineconeFilter.category = filters.category;
      }
      
      if (filters.sourceType) {
        pineconeFilter.sourceType = filters.sourceType;
      }
      
      if (filters.dateRange) {
        const dateFilter: any = {};
        if (filters.dateRange.start) {
          dateFilter.$gte = filters.dateRange.start;
        }
        if (filters.dateRange.end) {
          dateFilter.$lte = filters.dateRange.end;
        }
        if (Object.keys(dateFilter).length > 0) {
          pineconeFilter.createdAt = dateFilter;
        }
      }

      return await this.searchSimilar(query, {
        ...options,
        filter: Object.keys(pineconeFilter).length > 0 ? pineconeFilter : undefined,
      });
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VECTOR_DATABASE,
        service: 'vector-store',
        operation: 'hybridSearch',
        message: `Failed to perform hybrid search: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { query, filters, options },
      });
    }
  }

  // Delete documents
  async deleteDocuments(
    ids: string[],
    namespace?: string
  ): Promise<void> {
    if (ids.length === 0) return;

    try {
      await this.index.namespace(namespace || this.defaultNamespace).deleteMany(ids);
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VECTOR_DATABASE,
        service: 'vector-store',
        operation: 'deleteDocuments',
        message: `Failed to delete documents: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { idsCount: ids.length, namespace: namespace || this.defaultNamespace },
      });
    }
  }

  // Delete documents by filter
  async deleteByFilter(
    filter: Record<string, any>,
    namespace?: string
  ): Promise<void> {
    try {
      await this.index.namespace(namespace || this.defaultNamespace).deleteMany(filter);
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VECTOR_DATABASE,
        service: 'vector-store',
        operation: 'deleteByFilter',
        message: `Failed to delete documents by filter: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { filter, namespace: namespace || this.defaultNamespace },
      });
    }
  }

  // Get document by ID
  async getDocument(
    id: string,
    namespace?: string
  ): Promise<SearchResult | null> {
    try {
      const response = await this.index.namespace(namespace || this.defaultNamespace).fetch([id]);
      
      const vector = response.vectors?.[id];
      if (!vector) return null;

      return {
        id,
        score: 1.0, // Not applicable for direct fetch
        content: vector.metadata?.content as string,
        metadata: vector.metadata,
        embedding: vector.values,
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VECTOR_DATABASE,
        service: 'vector-store',
        operation: 'getDocument',
        message: `Failed to get document: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { id, namespace: namespace || this.defaultNamespace },
      });
    }
  }

  // Get index statistics
  async getIndexStats(): Promise<IndexStats> {
    try {
      const stats = await this.index.describeIndexStats();
      return {
        namespaces: stats.namespaces || {},
        dimension: stats.dimension || 0,
        indexFullness: stats.indexFullness || 0,
        totalVectorCount: stats.totalVectorCount || 0,
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VECTOR_DATABASE,
        service: 'vector-store',
        operation: 'getIndexStats',
        message: `Failed to get index stats: ${error.message}`,
        retryable: true,
        originalError: error as Error,
      });
    }
  }

  // List all namespaces
  async listNamespaces(): Promise<string[]> {
    try {
      const stats = await this.getIndexStats();
      return Object.keys(stats.namespaces);
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VECTOR_DATABASE,
        service: 'vector-store',
        operation: 'listNamespaces',
        message: `Failed to list namespaces: ${error.message}`,
        retryable: true,
        originalError: error as Error,
      });
    }
  }

  // Clear all vectors in a namespace
  async clearNamespace(namespace?: string): Promise<void> {
    try {
      await this.index.namespace(namespace || this.defaultNamespace).deleteAll();
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VECTOR_DATABASE,
        service: 'vector-store',
        operation: 'clearNamespace',
        message: `Failed to clear namespace: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { namespace: namespace || this.defaultNamespace },
      });
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.getIndexStats();
      return true;
    } catch (error) {
      console.error('Vector store health check failed:', error);
      return false;
    }
  }

  // Generate content-based ID
  private generateDocumentId(content: string): string {
    const hash = crypto.createHash('md5').update(content).digest('hex');
    return `doc-${hash.slice(0, 16)}`;
  }

  // Extract text from various sources
  async extractAndAddFromUrl(
    url: string,
    metadata: VectorDocument['metadata'] = {},
    options: {
      namespace?: string;
      chunkingOptions?: ChunkingOptions;
    } = {}
  ): Promise<string[]> {
    try {
      // This would integrate with a web scraping service
      // For now, throw an error indicating this needs implementation
      throw new Error('URL extraction not implemented yet. Please implement web scraping integration.');
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.VECTOR_DATABASE,
        service: 'vector-store',
        operation: 'extractAndAddFromUrl',
        message: `Failed to extract and add from URL: ${error.message}`,
        retryable: false,
        originalError: error as Error,
        metadata: { url },
      });
    }
  }

  // Batch operations
  async batchOperations(operations: {
    upsert?: VectorDocument[];
    delete?: string[];
    namespace?: string;
  }[]): Promise<{
    upserted: number;
    deleted: number;
    errors: any[];
  }> {
    let totalUpserted = 0;
    let totalDeleted = 0;
    const errors: any[] = [];

    for (const operation of operations) {
      try {
        if (operation.upsert && operation.upsert.length > 0) {
          const result = await this.upsertDocuments(operation.upsert, operation.namespace);
          totalUpserted += result.upsertedCount;
          if (result.failed) {
            errors.push(...result.failed);
          }
        }

        if (operation.delete && operation.delete.length > 0) {
          await this.deleteDocuments(operation.delete, operation.namespace);
          totalDeleted += operation.delete.length;
        }
      } catch (error) {
        errors.push({
          operation,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      upserted: totalUpserted,
      deleted: totalDeleted,
      errors,
    };
  }
}

// Create wrapped methods with error handling and retry logic
const rawVectorStoreService = new VectorStoreService();

export const vectorStoreService = {
  chunkText: rawVectorStoreService.chunkText.bind(rawVectorStoreService),
  generateEmbeddings: withErrorHandling('vector-store', 'generateEmbeddings', rawVectorStoreService.generateEmbeddings.bind(rawVectorStoreService)),
  upsertDocuments: withErrorHandling('vector-store', 'upsertDocuments', rawVectorStoreService.upsertDocuments.bind(rawVectorStoreService)),
  addDocument: withErrorHandling('vector-store', 'addDocument', rawVectorStoreService.addDocument.bind(rawVectorStoreService)),
  searchSimilar: withErrorHandling('vector-store', 'searchSimilar', rawVectorStoreService.searchSimilar.bind(rawVectorStoreService)),
  hybridSearch: withErrorHandling('vector-store', 'hybridSearch', rawVectorStoreService.hybridSearch.bind(rawVectorStoreService)),
  deleteDocuments: withErrorHandling('vector-store', 'deleteDocuments', rawVectorStoreService.deleteDocuments.bind(rawVectorStoreService)),
  deleteByFilter: withErrorHandling('vector-store', 'deleteByFilter', rawVectorStoreService.deleteByFilter.bind(rawVectorStoreService)),
  getDocument: withErrorHandling('vector-store', 'getDocument', rawVectorStoreService.getDocument.bind(rawVectorStoreService)),
  getIndexStats: withErrorHandling('vector-store', 'getIndexStats', rawVectorStoreService.getIndexStats.bind(rawVectorStoreService)),
  listNamespaces: withErrorHandling('vector-store', 'listNamespaces', rawVectorStoreService.listNamespaces.bind(rawVectorStoreService)),
  clearNamespace: withErrorHandling('vector-store', 'clearNamespace', rawVectorStoreService.clearNamespace.bind(rawVectorStoreService)),
  healthCheck: withErrorHandling('vector-store', 'healthCheck', rawVectorStoreService.healthCheck.bind(rawVectorStoreService), { maxAttempts: 1 }),
  extractAndAddFromUrl: withErrorHandling('vector-store', 'extractAndAddFromUrl', rawVectorStoreService.extractAndAddFromUrl.bind(rawVectorStoreService)),
  batchOperations: withErrorHandling('vector-store', 'batchOperations', rawVectorStoreService.batchOperations.bind(rawVectorStoreService)),
};

export { VectorStoreService };
