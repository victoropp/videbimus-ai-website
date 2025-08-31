import { Pinecone } from '@pinecone-database/pinecone';
import { aiConfig } from './config';
import { aiClient } from './providers';

export interface Document {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
  content: string;
}

export class VectorStore {
  private pinecone: Pinecone | null = null;
  private indexName: string;

  constructor(indexName: string = aiConfig.pineconeIndex) {
    this.indexName = indexName;
    this.initializePinecone();
  }

  private async initializePinecone() {
    if (!aiConfig.pineconeApiKey) {
      console.warn('Pinecone API key not found. Vector search will not be available.');
      return;
    }

    try {
      this.pinecone = new Pinecone({
        apiKey: aiConfig.pineconeApiKey,
      });
    } catch (error) {
      console.error('Failed to initialize Pinecone:', error);
    }
  }

  async addDocuments(documents: Document[]) {
    if (!this.pinecone) {
      throw new Error('Pinecone not initialized');
    }

    const index = this.pinecone.Index(this.indexName);
    
    // Generate embeddings for documents that don't have them
    const documentsWithEmbeddings = await Promise.all(
      documents.map(async (doc) => {
        if (!doc.embedding) {
          doc.embedding = await aiClient.generateEmbedding({ text: doc.content });
        }
        return doc;
      })
    );

    // Prepare vectors for Pinecone
    const vectors = documentsWithEmbeddings.map(doc => ({
      id: doc.id,
      values: doc.embedding!,
      metadata: {
        ...doc.metadata,
        content: doc.content,
      },
    }));

    // Upsert vectors in batches
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
    }
  }

  async similaritySearch(query: string, topK: number = aiConfig.maxRetrievalDocuments): Promise<SearchResult[]> {
    if (!this.pinecone) {
      throw new Error('Pinecone not initialized');
    }

    // Generate embedding for the query
    const queryEmbedding = await aiClient.generateEmbedding({ text: query });

    const index = this.pinecone.Index(this.indexName);
    
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return queryResponse.matches?.map(match => ({
      id: match.id,
      score: match.score || 0,
      metadata: match.metadata || {},
      content: (match.metadata?.content as string) || '',
    })) || [];
  }

  async deleteDocument(id: string) {
    if (!this.pinecone) {
      throw new Error('Pinecone not initialized');
    }

    const index = this.pinecone.Index(this.indexName);
    await index.deleteOne(id);
  }

  async deleteDocuments(ids: string[]) {
    if (!this.pinecone) {
      throw new Error('Pinecone not initialized');
    }

    const index = this.pinecone.Index(this.indexName);
    await index.deleteMany(ids);
  }

  async clearIndex() {
    if (!this.pinecone) {
      throw new Error('Pinecone not initialized');
    }

    const index = this.pinecone.Index(this.indexName);
    await index.deleteAll();
  }
}

// Text chunking utilities
export function chunkText(text: string, chunkSize: number = aiConfig.chunkSize, overlap: number = aiConfig.chunkOverlap): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    
    if (end === text.length) break;
    start = end - overlap;
  }

  return chunks;
}

export function preprocessDocument(content: string, metadata: Record<string, any> = {}): Document[] {
  const chunks = chunkText(content);
  
  return chunks.map((chunk, index) => ({
    id: `${metadata.id || 'doc'}-chunk-${index}`,
    content: chunk,
    metadata: {
      ...metadata,
      chunkIndex: index,
      totalChunks: chunks.length,
    },
  }));
}

// Default vector store instance
export const vectorStore = new VectorStore();