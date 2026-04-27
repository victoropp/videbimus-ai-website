import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

// All heavy imports are lazy to avoid Lambda startup crashes
async function getChatService() {
  const { enterpriseChatService } = await import('@/lib/ai/enterprise-chat-service');
  return enterpriseChatService;
}

async function getRateLimiters() {
  const { rateLimiters, getRequestIdentifier, createRateLimitResponse } = await import('@/lib/middleware/rate-limit');
  return { rateLimiters, getRequestIdentifier, createRateLimitResponse };
}

async function getSanitize() {
  const { validateAndSanitize } = await import('@/lib/security/sanitize');
  return validateAndSanitize;
}

async function getSession() {
  try {
    const { auth } = await import('@/auth');
    return await auth();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { rateLimiters, getRequestIdentifier, createRateLimitResponse } = await getRateLimiters();
    const identifier = getRequestIdentifier(req);
    const rateLimitResult = await rateLimiters.aiChat.check(identifier, 'chat');

    if (!rateLimitResult.success) {
      return createRateLimitResponse(
        rateLimitResult,
        'Too many chat requests. Please wait a moment before sending another message.'
      );
    }

    const body = await req.json();
    const { message, sessionId, systemPrompt, useRAG, temperature, maxTokens, model, stream } =
      chatRequestSchema.parse(body);

    const validateAndSanitize = await getSanitize();
    const sanitizeResult = validateAndSanitize(message, 'chat');
    if (!sanitizeResult.isValid) {
      return NextResponse.json(
        { error: 'Invalid message content', details: sanitizeResult.errors },
        { status: 400 }
      );
    }

    const sanitizedMessage = sanitizeResult.sanitized;
    const session = await getSession();
    const userId = session?.user?.id;

    // Route to BlenderBot model if selected
    if (model === 'blenderbot-400m') {
      const qwenResponse = await fetch(new URL('/api/ai/chat/qwen', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt || 'You are a helpful AI assistant.' },
            { role: 'user', content: sanitizedMessage }
          ],
          settings: { maxTokens, temperature, stream },
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
      }
      const data = await qwenResponse.json();
      return NextResponse.json(data);
    }

    const chatService = await getChatService();

    if (stream) {
      const messageStream = await chatService.streamMessage(sanitizedMessage, {
        sessionId: sessionId || '',
        userId: userId || '',
        systemPrompt: systemPrompt || '',
        useKnowledgeBase: useRAG,
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 1000,
        model: model || 'llama3-8b-8192',
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of messageStream) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
              if (chunk.done) {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                break;
              }
            }
          } catch (error) {
            console.error('Streaming error:', error);
            const errorChunk = JSON.stringify({
              content: 'I apologize for the technical difficulty. Please try again.',
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
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }

    const result = await chatService.sendMessage(sanitizedMessage, {
      sessionId: sessionId || '',
      userId: userId || '',
      systemPrompt: systemPrompt || '',
      useKnowledgeBase: useRAG,
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 1000,
      model: model || 'llama3-8b-8192',
      enableAnalytics: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal server error', detail: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { rateLimiters, getRequestIdentifier, createRateLimitResponse } = await getRateLimiters();
    const identifier = getRequestIdentifier(req);
    const rateLimitResult = await rateLimiters.api.check(identifier, 'get-sessions');
    if (!rateLimitResult.success) return createRateLimitResponse(rateLimitResult);

    const session = await getSession();
    if (!session?.user?.id) return NextResponse.json([]);

    const chatService = await getChatService();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const chatSession = await chatService.getSession(sessionId);
      if (!chatSession || (chatSession.userId && chatSession.userId !== session.user.id)) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      return NextResponse.json(chatSession);
    }

    const sessions = await chatService.getUserSessions(session.user.id);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Get chat sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { rateLimiters, getRequestIdentifier, createRateLimitResponse } = await getRateLimiters();
    const identifier = getRequestIdentifier(req);
    const rateLimitResult = await rateLimiters.api.check(identifier, 'delete-session');
    if (!rateLimitResult.success) return createRateLimitResponse(rateLimitResult);

    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 });

    const chatService = await getChatService();
    const chatSession = await chatService.getSession(sessionId);
    if (!chatSession) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    if (session?.user?.id && chatSession.userId && chatSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const success = await chatService.deleteSession(sessionId);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Delete chat session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
