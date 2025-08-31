import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractEntities } from '@/lib/ai/demos';

const entitiesSchema = z.object({
  text: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = entitiesSchema.parse(body);

    const entities = await extractEntities(text);

    // Group entities by type for easier visualization
    const entitiesByType = entities.reduce((acc, entity) => {
      if (!acc[entity.type]) {
        acc[entity.type] = [];
      }
      acc[entity.type].push(entity);
      return acc;
    }, {} as Record<string, typeof entities>);

    return NextResponse.json({
      entities,
      entitiesByType,
      totalEntities: entities.length,
      entityTypes: Object.keys(entitiesByType),
    });
  } catch (error) {
    console.error('Entity extraction error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Entity extraction failed' },
      { status: 500 }
    );
  }
}