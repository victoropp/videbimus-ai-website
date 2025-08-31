import { v4 as uuidv4 } from 'uuid';
import { aiClient, ChatMessage } from './providers';
import { vectorStore } from './vector-store';
import { aiConfig } from './config';

export interface ChatSession {
  id: string;
  userId?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface ChatOptions {
  sessionId?: string;
  userId?: string;
  systemPrompt?: string;
  useRAG?: boolean;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export class ChatService {
  private sessions: Map<string, ChatSession> = new Map();

  async createSession(userId?: string, title?: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: uuidv4(),
      userId,
      title: title || 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getUserSessions(userId: string): Promise<ChatSession[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }

  async sendMessage(
    message: string,
    options: ChatOptions = {}
  ): Promise<{
    response: string;
    sessionId: string;
    messageId: string;
  }> {
    const {
      sessionId,
      userId,
      systemPrompt,
      useRAG = true,
      temperature,
      maxTokens,
      model,
    } = options;

    // Get or create session
    let session = sessionId ? await this.getSession(sessionId) : null;
    if (!session) {
      session = await this.createSession(userId);
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    // Add user message to session
    session.messages.push(userMessage);

    // Prepare context for AI
    let context = '';
    let messages: ChatMessage[] = [];

    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Use RAG for knowledge-based responses
    if (useRAG) {
      try {
        const relevantDocs = await vectorStore.similaritySearch(message);
        if (relevantDocs.length > 0) {
          context = relevantDocs
            .map(doc => `Context: ${doc.content}`)
            .join('\n\n');
          
          const ragSystemPrompt = `You are an AI assistant for Vidibemus AI. Use the following context to answer questions accurately and helpfully. If the context doesn't contain relevant information, use your general knowledge but mention that the information isn't from the knowledge base.

Context:
${context}

Instructions:
- Provide accurate, helpful responses
- Reference the context when applicable
- If unsure, ask for clarification
- Maintain a professional but friendly tone`;

          messages = [
            {
              role: 'system',
              content: ragSystemPrompt,
            }
          ];
        }
      } catch (error) {
        console.warn('RAG search failed, falling back to standard chat:', error);
      }
    }

    // Add conversation history (last 10 messages to manage context)
    const recentMessages = session.messages.slice(-10);
    messages.push(...recentMessages);

    // Get AI response
    try {
      const completion = await aiClient.chatCompletion({
        messages,
        model,
        temperature,
        maxTokens,
        stream: false,
      });

      let responseContent: string;

      // Handle different provider response formats
      if ('choices' in completion) {
        // OpenAI format
        responseContent = completion.choices[0]?.message?.content || '';
      } else if ('content' in completion) {
        // Anthropic format
        responseContent = Array.isArray(completion.content) 
          ? completion.content[0]?.text || ''
          : completion.content;
      } else {
        // Hugging Face or other formats
        responseContent = completion.generated_text || completion.response || '';
      }

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      // Add assistant message to session
      session.messages.push(assistantMessage);
      session.updatedAt = new Date();

      // Update session title if it's the first message
      if (session.messages.length === 2 && session.title === 'New Chat') {
        session.title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
      }

      // Save session
      this.sessions.set(session.id, session);

      return {
        response: responseContent,
        sessionId: session.id,
        messageId: assistantMessage.id!,
      };

    } catch (error) {
      console.error('Chat completion error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async streamMessage(
    message: string,
    options: ChatOptions = {}
  ): Promise<AsyncGenerator<{
    content: string;
    done: boolean;
    sessionId: string;
  }>> {
    const {
      sessionId,
      userId,
      systemPrompt,
      useRAG = true,
      temperature,
      maxTokens,
      model,
    } = options;

    // Get or create session
    let session = sessionId ? await this.getSession(sessionId) : null;
    if (!session) {
      session = await this.createSession(userId);
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    session.messages.push(userMessage);

    // Prepare context (same as sendMessage)
    let messages: ChatMessage[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    if (useRAG) {
      try {
        const relevantDocs = await vectorStore.similaritySearch(message);
        if (relevantDocs.length > 0) {
          const context = relevantDocs
            .map(doc => `Context: ${doc.content}`)
            .join('\n\n');
          
          const ragSystemPrompt = `You are an AI assistant for Vidibemus AI. Use the following context to answer questions accurately.

Context:
${context}`;

          messages = [
            {
              role: 'system',
              content: ragSystemPrompt,
            }
          ];
        }
      } catch (error) {
        console.warn('RAG search failed:', error);
      }
    }

    const recentMessages = session.messages.slice(-10);
    messages.push(...recentMessages);

    // Stream AI response
    const completion = await aiClient.chatCompletion({
      messages,
      model,
      temperature,
      maxTokens,
      stream: true,
    });

    return this.processStream(completion, session);
  }

  private async *processStream(
    stream: any,
    session: ChatSession
  ): AsyncGenerator<{
    content: string;
    done: boolean;
    sessionId: string;
  }> {
    let fullResponse = '';

    try {
      for await (const chunk of stream) {
        let content = '';
        
        // Handle different streaming formats
        if (chunk.choices && chunk.choices[0]?.delta?.content) {
          // OpenAI format
          content = chunk.choices[0].delta.content;
        } else if (chunk.delta && chunk.delta.text) {
          // Anthropic format
          content = chunk.delta.text;
        } else if (chunk.token) {
          // Hugging Face format
          content = chunk.token.text;
        }

        if (content) {
          fullResponse += content;
          yield {
            content,
            done: false,
            sessionId: session.id,
          };
        }
      }

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      };

      session.messages.push(assistantMessage);
      session.updatedAt = new Date();

      // Update session title if needed
      if (session.messages.length === 2 && session.title === 'New Chat') {
        const userMessage = session.messages[0].content;
        session.title = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
      }

      this.sessions.set(session.id, session);

      yield {
        content: '',
        done: true,
        sessionId: session.id,
      };

    } catch (error) {
      console.error('Stream processing error:', error);
      throw error;
    }
  }

  async clearHistory(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;

    session.messages = [];
    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);
    return true;
  }

  async exportSession(sessionId: string): Promise<string | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    return JSON.stringify(session, null, 2);
  }
}

// Default chat service instance
export const chatService = new ChatService();