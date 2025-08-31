import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { answerQuestion } from '@/lib/ai/demos';

const qaSchema = z.object({
  question: z.string().min(1).max(500),
  context: z.string().min(1).max(10000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, context } = qaSchema.parse(body);

    const result = await answerQuestion(question, context);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Question answering error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Question answering failed' },
      { status: 500 }
    );
  }
}