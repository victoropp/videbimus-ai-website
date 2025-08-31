import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeSentiment } from '@/lib/ai/demos';

const sentimentSchema = z.object({
  text: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = sentimentSchema.parse(body);

    const result = await analyzeSentiment(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Sentiment analysis failed' },
      { status: 500 }
    );
  }
}