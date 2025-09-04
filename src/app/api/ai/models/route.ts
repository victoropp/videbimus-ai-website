import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { modelShowcase } from '@/lib/ai/model-showcase';

const predictionSchema = z.object({
  modelId: z.string(),
  input: z.any(),
  options: z.object({
    explainability: z.boolean().optional(),
    confidence: z.boolean().optional(),
    alternativeOutputs: z.number().optional(),
  }).optional(),
});

// Get all models or make a prediction
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get('modelId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    if (modelId) {
      const model = modelShowcase.getModelById(modelId);
      if (!model) {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
      }
      return NextResponse.json(model);
    }

    let models = modelShowcase.getAllModels();

    if (type) {
      models = modelShowcase.getModelsByType(type as any);
    }

    if (status) {
      models = models.filter(model => model.status === status);
    }

    return NextResponse.json(models);
  } catch (error) {
    console.error('Models API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Make a prediction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelId, input, options } = predictionSchema.parse(body);

    const predictionRequest: any = {
      modelId,
      input,
    };
    
    if (options) {
      predictionRequest.options = options;
    }

    const result = await modelShowcase.makePrediction(predictionRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Prediction error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Prediction failed' },
      { status: 500 }
    );
  }
}