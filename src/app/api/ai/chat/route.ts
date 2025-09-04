import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { enterpriseChatService } from '@/lib/ai/enterprise-chat-service';
import { auth } from '@/auth';

const chatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().optional(),
  systemPrompt: z.string().optional(),
  useRAG: z.boolean().default(true),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4096).optional(),
  model: z.string().optional(),
  stream: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    // Await headers before using auth to fix Next.js warnings
    await req.headers;
    const session = await auth();
    const body = await req.json();
    const { message, sessionId, systemPrompt, useRAG, temperature, maxTokens, model, stream } = 
      chatRequestSchema.parse(body);

    // Route to BlenderBot model if selected
    if (model === 'blenderbot-400m') {
      const qwenResponse = await fetch(new URL('/api/ai/chat/qwen', req.url).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt || 'You are a helpful AI assistant.' },
            { role: 'user', content: message }
          ],
          settings: {
            maxTokens,
            temperature,
            stream,
          }
        }),
      });

      if (stream) {
        return new NextResponse(qwenResponse.body, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } else {
        const data = await qwenResponse.json();
        return NextResponse.json(data);
      }
    }

    const userId = session?.user?.id;

    if (stream) {
      // Handle streaming response with enterprise chat service
      const messageStream = await enterpriseChatService.streamMessage(message, {
        sessionId: sessionId || '',
        userId: userId || '',
        systemPrompt: systemPrompt || '',
        useKnowledgeBase: useRAG,
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 1000,
        model: model || 'gpt-3.5-turbo',
      });

      // Create streaming response
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of messageStream) {
              const data = JSON.stringify(chunk);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              
              if (chunk.done) {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                break;
              }
            }
          } catch (error) {
            console.error('Streaming error:', error);
            // Send error message through stream
            const errorChunk = JSON.stringify({
              content: "I apologize for the technical difficulty. Please try again or contact our support team.",
              done: true,
              error: true,
            });
            controller.enqueue(encoder.encode(`data: ${errorChunk}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } else {
      // Handle regular response with enterprise chat service
      const result = await enterpriseChatService.sendMessage(message, {
        sessionId: sessionId || '',
        userId: userId || '',
        systemPrompt: systemPrompt || '',
        useKnowledgeBase: useRAG,
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 1000,
        model: model || 'gpt-3.5-turbo',
        enableAnalytics: true,
      });

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Await headers before using auth to fix Next.js warnings
    await req.headers;
    const session = await auth();
    
    // For non-authenticated users, return empty sessions
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific session
      const chatSession = await enterpriseChatService.getSession(sessionId);
      if (!chatSession || (chatSession.userId && chatSession.userId !== session.user.id)) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      return NextResponse.json(chatSession);
    } else {
      // Get all user sessions
      const sessions = await enterpriseChatService.getUserSessions(session.user.id);
      return NextResponse.json(sessions);
    }
  } catch (error) {
    console.error('Get chat sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Await headers before using auth to fix Next.js warnings
    await req.headers;
    const session = await auth();
    
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // For non-authenticated users, still allow deletion of their session
    const chatSession = await enterpriseChatService.getSession(sessionId);
    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // If user is authenticated, verify ownership
    if (session?.user?.id && chatSession.userId && chatSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const success = await enterpriseChatService.deleteSession(sessionId);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Delete chat session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}// Force rebuild
