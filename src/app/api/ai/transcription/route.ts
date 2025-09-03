import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { transcriptionService } from '@/lib/ai/transcription';
import { getServerSession, authOptions } from '@/auth';

const transcriptionOptionsSchema = z.object({
  language: z.string().optional(),
  prompt: z.string().optional(),
  temperature: z.number().min(0).max(1).optional(),
  includeSpeakerLabels: z.boolean().optional(),
  includeTimestamps: z.boolean().optional(),
});

const summaryOptionsSchema = z.object({
  transcription: z.string(),
  style: z.enum(['brief', 'detailed', 'action-items']).optional(),
  includeTimestamps: z.boolean().optional(),
});

// Transcribe audio file
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const optionsJson = formData.get('options') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    let options = {};
    if (optionsJson) {
      try {
        const parsedOptions = JSON.parse(optionsJson);
        options = transcriptionOptionsSchema.parse(parsedOptions);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid options format' },
          { status: 400 }
        );
      }
    }

    const result = await transcriptionService.transcribeAudio(audioFile, options);

    return NextResponse.json({
      ...result,
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Transcription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}

// Generate summary from transcription
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { transcription, style, includeTimestamps } = summaryOptionsSchema.parse(body);

    const summary = await transcriptionService.generateSummary(transcription, {
      style,
      includeTimestamps,
    });

    return NextResponse.json({
      summary,
      originalLength: transcription.length,
      summaryLength: summary.length,
      compressionRatio: ((summary.length / transcription.length) * 100).toFixed(1) + '%',
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Summary generation failed' },
      { status: 500 }
    );
  }
}

// Extract key points from transcription
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { transcription, maxPoints = 10 } = z.object({
      transcription: z.string(),
      maxPoints: z.number().min(1).max(20).optional(),
    }).parse(body);

    const keyPoints = await transcriptionService.extractKeyPoints(transcription, maxPoints);

    return NextResponse.json({
      keyPoints,
      totalPoints: keyPoints.length,
      transcriptionLength: transcription.length,
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Key points extraction error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Key points extraction failed' },
      { status: 500 }
    );
  }
}