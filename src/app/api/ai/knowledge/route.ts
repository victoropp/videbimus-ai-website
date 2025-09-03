import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { vectorStore, preprocessDocument } from '@/lib/ai/vector-store';
import { getServerSession, authOptions } from '@/auth';

const uploadDocumentSchema = z.object({
  content: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(['webpage', 'document', 'faq', 'knowledge']).default('knowledge'),
  metadata: z.record(z.any()).optional(),
});

const searchSchema = z.object({
  query: z.string().min(1),
  topK: z.number().min(1).max(20).default(5),
});

// Upload documents to knowledge base
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Only allow admins to upload to knowledge base
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content, title, type, metadata } = uploadDocumentSchema.parse(body);

    // Preprocess document into chunks
    const documents = preprocessDocument(content, {
      title,
      type,
      uploadedBy: session.user.id,
      uploadedAt: new Date().toISOString(),
      ...metadata,
    });

    // Add documents to vector store
    await vectorStore.addDocuments(documents);

    return NextResponse.json({
      success: true,
      documentsAdded: documents.length,
      documentIds: documents.map(doc => doc.id),
    });
  } catch (error) {
    console.error('Knowledge upload error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

// Search knowledge base
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const topK = searchParams.get('topK');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const { query: validatedQuery, topK: validatedTopK } = searchSchema.parse({
      query,
      topK: topK ? parseInt(topK) : undefined,
    });

    const results = await vectorStore.similaritySearch(validatedQuery, validatedTopK);

    return NextResponse.json({
      query: validatedQuery,
      results: results.map(result => ({
        id: result.id,
        content: result.content,
        score: result.score,
        metadata: result.metadata,
      })),
      totalResults: results.length,
    });
  } catch (error) {
    console.error('Knowledge search error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

// Delete documents from knowledge base
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    await vectorStore.deleteDocument(documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Knowledge delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}