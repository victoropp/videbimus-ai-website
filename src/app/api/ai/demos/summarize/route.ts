import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { summarizeText, SummaryOptions } from '@/lib/ai/demos';

const summarizeSchema = z.object({
  text: z.string().min(10).max(10000),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
  style: z.enum(['bullet-points', 'paragraph', 'executive']).default('paragraph'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, length, style } = summarizeSchema.parse(body);

    const options: SummaryOptions = { length, style };
    const summary = await summarizeText(text, options);

    return NextResponse.json({
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: (summary.length / text.length * 100).toFixed(1) + '%',
    });
  } catch (error) {
    console.error('Text summarization error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Text summarization failed' },
      { status: 500 }
    );
  }
}