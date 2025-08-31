import { NextRequest, NextResponse } from 'next/server';
import { getQwenModel } from '@/lib/ai/qwen-model';

export async function POST(request: NextRequest) {
  try {
    const { messages, settings } = await request.json();

    // Initialize Qwen model with settings
    const qwen = getQwenModel({
      maxTokens: settings?.maxTokens || 2048,
      temperature: settings?.temperature || 0.7,
      topP: settings?.topP || 0.95,
    });

    // Check if streaming is requested
    if (settings?.stream) {
      // Create a streaming response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of qwen.streamChat(messages)) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
            }
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Regular non-streaming response
      const response = await qwen.chat(messages);
      
      return NextResponse.json({
        message: response,
        model: 'qwen-2.5-32b-instruct',
        usage: {
          prompt_tokens: messages.reduce((acc: number, m: any) => acc + m.content.length / 4, 0),
          completion_tokens: response.length / 4,
          total_tokens: (messages.reduce((acc: number, m: any) => acc + m.content.length / 4, 0) + response.length / 4),
        }
      });
    }
  } catch (error: any) {
    console.error('Qwen API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Test endpoint
export async function GET() {
  try {
    const qwen = getQwenModel();
    const info = qwen.getModelInfo();
    const isConnected = await qwen.testConnection();

    return NextResponse.json({
      status: isConnected ? 'connected' : 'disconnected',
      model: info,
      message: isConnected 
        ? 'Qwen 2.5 32B model is ready to use!' 
        : 'Unable to connect to Qwen model. Please check your API key.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to test connection' },
      { status: 500 }
    );
  }
}