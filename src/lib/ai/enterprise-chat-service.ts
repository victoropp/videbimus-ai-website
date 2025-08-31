import { v4 as uuidv4 } from 'uuid';
import { enhancedProviders, EnhancedChatMessage, ProviderResponse } from './enhanced-providers';
import { enterpriseKnowledgeBase, QueryIntent, KnowledgeDocument } from './enterprise-knowledge-base';
import { aiConfig } from './config';
import { semanticCache } from './semantic-cache';
import { agentOrchestrator } from './agent-orchestrator';

export interface ConversationContext {
  userId?: string;
  sessionId: string;
  intent: QueryIntent;
  knowledgeUsed: KnowledgeDocument[];
  conversationTone: 'professional' | 'casual' | 'technical';
  businessContext: Record<string, any>;
  previousTopics: string[];
  escalationNeeded: boolean;
  satisfactionScore?: number;
}

export interface EnhancedChatSession {
  id: string;
  userId?: string;
  title: string;
  messages: EnhancedChatMessage[];
  context: ConversationContext;
  analytics: SessionAnalytics;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface SessionAnalytics {
  messageCount: number;
  averageResponseTime: number;
  providersUsed: string[];
  topicsDiscussed: string[];
  userSatisfaction: number;
  issuesResolved: number;
  escalationTriggered: boolean;
  knowledgeBaseHits: number;
}

export interface ChatOptions {
  sessionId?: string;
  userId?: string;
  systemPrompt?: string;
  useKnowledgeBase?: boolean;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  conversationTone?: 'professional' | 'casual' | 'technical';
  enableAnalytics?: boolean;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  messageId: string;
  intent: QueryIntent;
  confidence: number;
  responseTime: number;
  provider: string;
  knowledgeUsed: KnowledgeDocument[];
  suggestions: string[];
  escalationRecommended: boolean;
}

export class EnterpriseChatService {
  private sessions: Map<string, EnhancedChatSession> = new Map();
  private conversationMemory: Map<string, ConversationContext> = new Map();

  async createSession(userId?: string, title?: string): Promise<EnhancedChatSession> {
    const sessionId = uuidv4();
    const context: ConversationContext = {
      userId,
      sessionId,
      intent: { type: 'general', confidence: 0, entities: [], sentiment: 'neutral' },
      knowledgeUsed: [],
      conversationTone: 'professional',
      businessContext: {},
      previousTopics: [],
      escalationNeeded: false,
    };

    const session: EnhancedChatSession = {
      id: sessionId,
      userId,
      title: title || 'New Conversation',
      messages: [],
      context,
      analytics: {
        messageCount: 0,
        averageResponseTime: 0,
        providersUsed: [],
        topicsDiscussed: [],
        userSatisfaction: 5,
        issuesResolved: 0,
        escalationTriggered: false,
        knowledgeBaseHits: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add welcome message
    const welcomeMessage: EnhancedChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: this.generateWelcomeMessage(context),
      timestamp: new Date(),
      metadata: { type: 'welcome', automated: true }
    };

    session.messages.push(welcomeMessage);
    this.sessions.set(sessionId, session);
    this.conversationMemory.set(sessionId, context);

    return session;
  }

  async getSession(sessionId: string): Promise<EnhancedChatSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getUserSessions(userId: string): Promise<EnhancedChatSession[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const deleted = this.sessions.delete(sessionId);
    this.conversationMemory.delete(sessionId);
    return deleted;
  }

  async sendMessage(message: string, options: ChatOptions = {}): Promise<ChatResponse> {
    const startTime = Date.now();
    const {
      sessionId,
      userId,
      systemPrompt,
      useKnowledgeBase = true,
      temperature,
      maxTokens,
      model,
      conversationTone = 'professional',
      enableAnalytics = true,
    } = options;

    // Get or create session
    let session = sessionId ? await this.getSession(sessionId) : null;
    if (!session) {
      session = await this.createSession(userId);
    }

    // Create user message
    const userMessage: EnhancedChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata: { originalQuery: message }
    };

    session.messages.push(userMessage);
    session.analytics.messageCount++;

    // Analyze user intent and sentiment
    const intent = await enterpriseKnowledgeBase.analyzeIntent(message);
    session.context.intent = intent;
    session.context.conversationTone = conversationTone;

    // Update conversation memory
    this.updateConversationContext(session, intent, message);

    // Search knowledge base
    let knowledgeDocuments: KnowledgeDocument[] = [];
    if (useKnowledgeBase) {
      try {
        knowledgeDocuments = await enterpriseKnowledgeBase.searchKnowledge(message, intent);
        session.analytics.knowledgeBaseHits += knowledgeDocuments.length;
        session.context.knowledgeUsed = knowledgeDocuments;
      } catch (error) {
        console.warn('Knowledge base search failed:', error);
      }
    }

    // Prepare enhanced context for AI
    const enhancedMessages = this.prepareEnhancedContext(session, systemPrompt, knowledgeDocuments);

    // Check semantic cache first for similar queries
    let providerResponse: ProviderResponse;
    const cachedResponse = await semanticCache.hybridSearch(message);
    
    if (cachedResponse && cachedResponse.metadata.confidence > 0.92) {
      // Use cached response for very similar queries
      console.log(`Cache hit! Confidence: ${cachedResponse.metadata.confidence}`);
      providerResponse = {
        content: cachedResponse.response,
        provider: `${cachedResponse.metadata.model} (cached)`,
        model: cachedResponse.metadata.model,
        responseTime: Date.now() - startTime,
        confidence: cachedResponse.metadata.confidence,
        tokensUsed: 0, // No new tokens used
      };
      
      // Update analytics for cache hit
      session.analytics.knowledgeBaseHits++;
    } else {
      // Get AI response using enhanced providers
      try {
        providerResponse = await enhancedProviders.chatCompletion({
          messages: enhancedMessages,
          model,
          temperature,
          maxTokens,
          systemContext: this.buildSystemContext(session, knowledgeDocuments),
          userContext: {
            intent: intent.type,
            sentiment: intent.sentiment,
            tone: conversationTone,
            previousTopics: session.context.previousTopics,
          }
        });
        
        // Cache the response for future use
        await semanticCache.set(message, providerResponse.content, {
          model: providerResponse.model || 'gpt-4',
          tokens: providerResponse.tokensUsed || 0,
          cost: this.estimateCost(providerResponse),
        });
      } catch (error) {
        console.error('Enhanced AI providers failed:', error);
        // Fallback to knowledge base response
        console.log('Using fallback with docs:', knowledgeDocuments.length, 'Intent:', intent.type);
        if (knowledgeDocuments.length > 0 || intent.type) {
          const fallbackResponse = await enterpriseKnowledgeBase.generateContextualResponse(message, knowledgeDocuments, intent);
          providerResponse = {
            content: fallbackResponse,
            provider: 'Enterprise Knowledge Base',
            model: 'fallback',
            responseTime: Date.now() - startTime,
            confidence: 0.8,
          };
        } else {
          throw new Error('All AI systems unavailable');
        }
      }
    }

    // Post-process response
    const processedContent = this.postProcessResponse(providerResponse.content, session.context);

    // Create assistant message
    const assistantMessage: EnhancedChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: processedContent,
      timestamp: new Date(),
      metadata: {
        provider: providerResponse.provider,
        model: providerResponse.model,
        confidence: providerResponse.confidence,
        tokensUsed: providerResponse.tokensUsed,
        knowledgeDocuments: knowledgeDocuments.length,
        intent: intent.type,
      }
    };

    session.messages.push(assistantMessage);
    session.updatedAt = new Date();

    // Update analytics
    if (enableAnalytics) {
      this.updateAnalytics(session, providerResponse, intent);
    }

    // Update session title if it's the first exchange
    if (session.messages.length === 3 && session.title === 'New Conversation') {
      session.title = this.generateSessionTitle(message);
    }

    // Generate suggestions for next questions
    const suggestions = this.generateSuggestions(intent, knowledgeDocuments, session.context);

    // Check if escalation is recommended
    const escalationRecommended = this.shouldRecommendEscalation(session, intent, providerResponse.confidence);

    // Save session
    this.sessions.set(session.id, session);

    return {
      response: processedContent,
      sessionId: session.id,
      messageId: assistantMessage.id!,
      intent,
      confidence: providerResponse.confidence,
      responseTime: providerResponse.responseTime,
      provider: providerResponse.provider,
      knowledgeUsed: knowledgeDocuments,
      suggestions,
      escalationRecommended,
    };
  }

  private generateWelcomeMessage(context: ConversationContext): string {
    const welcomeMessages = [
      "Hello! I'm Vidibemus AI's enterprise assistant. I can help you explore our AI consulting services, discuss technical solutions, provide pricing information, and answer questions about our capabilities. How can I assist you today?",
      "Welcome to Vidibemus AI! I'm here to help you discover how our AI solutions can transform your business. Whether you're interested in custom AI development, data science consulting, or process automation, I'm ready to assist. What would you like to know?",
      "Greetings! I'm your AI consultant from Vidibemus AI. I can provide insights into our machine learning services, discuss implementation strategies, explain our methodologies, and help you understand how AI can drive your business forward. What brings you here today?"
    ];

    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  }

  private updateConversationContext(session: EnhancedChatSession, intent: QueryIntent, message: string) {
    const context = session.context;
    
    // Add topics from entities
    for (const entity of intent.entities) {
      if (!context.previousTopics.includes(entity)) {
        context.previousTopics.push(entity);
      }
    }

    // Track intent changes
    if (context.intent.type !== intent.type) {
      context.previousTopics.push(context.intent.type);
    }

    // Update business context based on conversation
    const businessKeywords = {
      'healthcare': { industry: 'healthcare', compliance: 'HIPAA' },
      'finance': { industry: 'finance', compliance: 'SOX' },
      'retail': { industry: 'retail', focus: 'customer-analytics' },
      'manufacturing': { industry: 'manufacturing', focus: 'quality-control' },
    };

    for (const [keyword, context_data] of Object.entries(businessKeywords)) {
      if (message.toLowerCase().includes(keyword)) {
        Object.assign(context.businessContext, context_data);
      }
    }

    // Adjust conversation tone based on technical depth
    const technicalTerms = ['api', 'algorithm', 'model', 'neural', 'tensorflow', 'pytorch', 'deployment'];
    const hasTechnicalTerms = technicalTerms.some(term => message.toLowerCase().includes(term));
    
    if (hasTechnicalTerms && context.conversationTone !== 'technical') {
      context.conversationTone = 'technical';
    }

    this.conversationMemory.set(session.id, context);
  }

  private prepareEnhancedContext(session: EnhancedChatSession, systemPrompt?: string, knowledgeDocuments?: KnowledgeDocument[]): EnhancedChatMessage[] {
    const messages: EnhancedChatMessage[] = [];

    // Enhanced system prompt
    const enhancedSystemPrompt = systemPrompt || this.buildSystemContext(session, knowledgeDocuments);
    
    if (enhancedSystemPrompt) {
      messages.push({
        id: uuidv4(),
        role: 'system',
        content: enhancedSystemPrompt,
        timestamp: new Date(),
      });
    }

    // Add conversation history with context awareness
    const recentMessages = session.messages.slice(-10); // Last 10 messages for context
    
    // Enhance messages with metadata
    for (const msg of recentMessages) {
      if (msg.role !== 'system') {
        messages.push({
          ...msg,
          metadata: {
            ...msg.metadata,
            conversationTone: session.context.conversationTone,
            businessContext: session.context.businessContext,
          }
        });
      }
    }

    return messages;
  }

  private buildSystemContext(session: EnhancedChatSession, knowledgeDocuments?: KnowledgeDocument[]): string {
    const context = session.context;
    const businessInfo = enterpriseKnowledgeBase.getBusinessContext();

    let systemContext = `You are an enterprise-grade AI assistant for ${businessInfo.get('company_name')}, a leading ${businessInfo.get('industry')} firm specializing in ${businessInfo.get('specialties')}.

## Your Role & Capabilities:
- Provide accurate, professional information about AI consulting services
- Offer technical guidance on machine learning and data science solutions
- Discuss pricing and project scoping with business stakeholders
- Maintain a ${context.conversationTone} conversation tone
- Focus on business value and practical implementation

## Current Conversation Context:
- User Intent: ${context.intent.type} (${Math.round(context.intent.confidence * 100)}% confidence)
- Sentiment: ${context.intent.sentiment}
- Topics Discussed: ${context.previousTopics.join(', ') || 'None'}
- Business Context: ${Object.keys(context.businessContext).length > 0 ? JSON.stringify(context.businessContext) : 'General inquiry'}

## Guidelines:
1. **Accuracy**: Use the provided knowledge base information when available
2. **Professionalism**: Maintain enterprise-level communication standards
3. **Value Focus**: Emphasize business outcomes and ROI
4. **Technical Balance**: Match technical depth to user's apparent expertise level
5. **Call-to-Action**: Include relevant next steps when appropriate`;

    if (knowledgeDocuments && knowledgeDocuments.length > 0) {
      systemContext += `\n\n## Knowledge Base Context:\n`;
      knowledgeDocuments.forEach((doc, index) => {
        systemContext += `### ${doc.title}\n${doc.content}\n\n`;
      });
    }

    if (context.escalationNeeded) {
      systemContext += `\n\n## Escalation Note: Complex query detected. Consider suggesting a consultation with our technical team.`;
    }

    return systemContext;
  }

  private postProcessResponse(content: string, context: ConversationContext): string {
    let processedContent = content;

    // Add personalization based on context
    if (context.businessContext.industry) {
      const industry = context.businessContext.industry;
      const industryInsights = {
        'healthcare': 'Our healthcare AI solutions comply with HIPAA and focus on patient outcomes.',
        'finance': 'We ensure financial AI solutions meet regulatory requirements and risk management standards.',
        'retail': 'Our retail AI focuses on customer experience optimization and inventory management.',
        'manufacturing': 'We specialize in quality control AI and predictive maintenance for manufacturing.',
      };

      if (industryInsights[industry] && !processedContent.includes('healthcare') && !processedContent.includes('finance')) {
        processedContent += `\n\n💡 *Industry Insight*: ${industryInsights[industry]}`;
      }
    }

    // Add conversational elements based on tone
    if (context.conversationTone === 'professional' && !processedContent.includes('Would you like')) {
      processedContent += '\n\nWould you like to schedule a consultation to discuss your specific requirements in detail?';
    }

    return processedContent;
  }

  private updateAnalytics(session: EnhancedChatSession, response: ProviderResponse, intent: QueryIntent) {
    const analytics = session.analytics;
    
    // Update average response time
    const currentAvg = analytics.averageResponseTime;
    const messageCount = analytics.messageCount;
    analytics.averageResponseTime = (currentAvg * (messageCount - 1) + response.responseTime) / messageCount;

    // Track providers used
    if (!analytics.providersUsed.includes(response.provider)) {
      analytics.providersUsed.push(response.provider);
    }

    // Track topics discussed
    if (!analytics.topicsDiscussed.includes(intent.type)) {
      analytics.topicsDiscussed.push(intent.type);
    }

    // Update satisfaction based on confidence and intent sentiment
    if (intent.sentiment === 'positive' && response.confidence > 0.8) {
      analytics.userSatisfaction = Math.min(analytics.userSatisfaction + 0.1, 5.0);
    } else if (intent.sentiment === 'negative' || response.confidence < 0.5) {
      analytics.userSatisfaction = Math.max(analytics.userSatisfaction - 0.2, 1.0);
    }

    // Check for issue resolution
    if (intent.type === 'support' && response.confidence > 0.7) {
      analytics.issuesResolved++;
    }
  }

  private generateSessionTitle(firstMessage: string): string {
    const maxLength = 50;
    let title = firstMessage.slice(0, maxLength);
    
    // Try to cut at word boundary
    if (firstMessage.length > maxLength) {
      const lastSpace = title.lastIndexOf(' ');
      if (lastSpace > 20) {
        title = title.slice(0, lastSpace) + '...';
      } else {
        title += '...';
      }
    }

    // Capitalize first letter
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  private generateSuggestions(intent: QueryIntent, knowledgeDocuments: KnowledgeDocument[], context: ConversationContext): string[] {
    const suggestions: string[] = [];

    // Intent-based suggestions
    const intentSuggestions = {
      'pricing': [
        'What factors influence AI project pricing?',
        'Can you provide a detailed cost breakdown?',
        'What payment models do you offer?'
      ],
      'services': [
        'What industries do you specialize in?',
        'Can you show me case studies?',
        'How do you ensure project success?'
      ],
      'technical': [
        'What technologies do you use?',
        'How do you handle data security?',
        'What is your deployment process?'
      ],
      'consultation': [
        'How do I schedule a consultation?',
        'What should I prepare for our meeting?',
        'Can you sign an NDA?'
      ],
      'general': [
        'Tell me about your AI consulting services',
        'What makes Vidibemus AI different?',
        'Can you help with my specific use case?'
      ]
    };

    // Add intent-based suggestions
    const intentBasedSuggestions = intentSuggestions[intent.type] || intentSuggestions['general'];
    suggestions.push(...intentBasedSuggestions.slice(0, 2));

    // Knowledge-based suggestions
    if (knowledgeDocuments.length > 0) {
      const categories = [...new Set(knowledgeDocuments.map(doc => doc.category))];
      const categorySuggestions = {
        'services': 'What other AI services do you offer?',
        'pricing': 'How do you calculate project ROI?',
        'technical': 'What are your technical capabilities?',
        'usecases': 'Do you have similar client success stories?',
      };

      for (const category of categories) {
        if (categorySuggestions[category] && suggestions.length < 4) {
          suggestions.push(categorySuggestions[category]);
        }
      }
    }

    // Context-aware suggestions
    if (context.previousTopics.includes('pricing') && intent.type !== 'consultation') {
      suggestions.push('Should we schedule a call to discuss pricing?');
    }

    if (context.businessContext.industry && suggestions.length < 3) {
      suggestions.push(`What AI solutions work best for ${context.businessContext.industry}?`);
    }

    return [...new Set(suggestions)].slice(0, 3);
  }

  private shouldRecommendEscalation(session: EnhancedChatSession, intent: QueryIntent, confidence: number): boolean {
    // Escalate for complex technical questions with low confidence
    if (intent.type === 'technical' && confidence < 0.6) return true;
    
    // Escalate for pricing discussions after multiple messages
    if (intent.type === 'pricing' && session.analytics.messageCount > 5) return true;
    
    // Escalate for support issues with negative sentiment
    if (intent.type === 'support' && intent.sentiment === 'negative') return true;
    
    // Escalate if user satisfaction is declining
    if (session.analytics.userSatisfaction < 3.0) return true;
    
    return false;
  }

  async clearHistory(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;

    // Keep welcome message
    const welcomeMessage = session.messages.find(m => m.metadata?.type === 'welcome');
    session.messages = welcomeMessage ? [welcomeMessage] : [];
    
    // Reset context but keep basic info
    session.context = {
      ...session.context,
      intent: { type: 'general', confidence: 0, entities: [], sentiment: 'neutral' },
      knowledgeUsed: [],
      previousTopics: [],
      escalationNeeded: false,
    };

    // Reset analytics
    session.analytics = {
      messageCount: 0,
      averageResponseTime: 0,
      providersUsed: [],
      topicsDiscussed: [],
      userSatisfaction: 5,
      issuesResolved: 0,
      escalationTriggered: false,
      knowledgeBaseHits: 0,
    };

    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);
    return true;
  }

  async streamMessage(message: string, options: ChatOptions = {}): Promise<AsyncGenerator<{
    content: string;
    done: boolean;
    sessionId: string;
    messageId?: string;
    provider?: string;
    confidence?: number;
  }>> {
    const {
      sessionId,
      userId,
      systemPrompt,
      useKnowledgeBase = true,
      temperature,
      maxTokens,
      model,
      conversationTone = 'professional',
    } = options;

    // Get or create session
    let session = sessionId ? await this.getSession(sessionId) : null;
    if (!session) {
      session = await this.createSession(userId);
    }

    // Create user message
    const userMessage: EnhancedChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata: { originalQuery: message }
    };

    session.messages.push(userMessage);
    session.analytics.messageCount++;

    // Analyze intent
    const intent = await enterpriseKnowledgeBase.analyzeIntent(message);
    session.context.intent = intent;
    
    // Update context
    this.updateConversationContext(session, intent, message);

    // Search knowledge base
    let knowledgeDocuments: KnowledgeDocument[] = [];
    if (useKnowledgeBase) {
      try {
        knowledgeDocuments = await enterpriseKnowledgeBase.searchKnowledge(message, intent);
        session.context.knowledgeUsed = knowledgeDocuments;
      } catch (error) {
        console.warn('Knowledge base search failed:', error);
      }
    }

    const enhancedMessages = this.prepareEnhancedContext(session, systemPrompt, knowledgeDocuments);
    
    return this.processStreamingResponse(session, enhancedMessages, {
      model,
      temperature,
      maxTokens,
      systemContext: this.buildSystemContext(session, knowledgeDocuments),
    });
  }

  private async *processStreamingResponse(
    session: EnhancedChatSession,
    messages: EnhancedChatMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemContext?: string;
    }
  ): AsyncGenerator<{
    content: string;
    done: boolean;
    sessionId: string;
    messageId?: string;
    provider?: string;
    confidence?: number;
  }> {
    const startTime = Date.now();
    let fullResponse = '';
    let provider = 'Unknown';
    let messageId = uuidv4();

    try {
      const stream = await enhancedProviders.chatCompletion({
        messages,
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        stream: true,
        systemContext: options.systemContext,
      });

      // Type guard to check if it's a stream
      if (Symbol.asyncIterator in (stream as any)) {
        for await (const chunk of stream as AsyncGenerator<any>) {
          if (chunk.content) {
            fullResponse += chunk.content;
            provider = chunk.provider;
            
            yield {
              content: chunk.content,
              done: false,
              sessionId: session.id,
              messageId,
              provider: chunk.provider,
              confidence: chunk.confidence,
            };
          }

          if (chunk.done) {
            break;
          }
        }
      }
    } catch (error) {
      console.error('Streaming failed, using fallback:', error);
      // Fallback to knowledge base response
      if (session.context.knowledgeUsed.length > 0) {
        const fallbackResponse = await enterpriseKnowledgeBase.generateContextualResponse(
          session.messages[session.messages.length - 1].content,
          session.context.knowledgeUsed,
          session.context.intent
        );
        
        // Simulate streaming for fallback
        const words = fallbackResponse.split(' ');
        for (let i = 0; i < words.length; i++) {
          const content = (i === 0 ? '' : ' ') + words[i];
          fullResponse += content;
          
          yield {
            content,
            done: i === words.length - 1,
            sessionId: session.id,
            messageId,
            provider: 'Enterprise Knowledge Base',
            confidence: 0.8,
          };
          
          // Small delay to simulate typing
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      } else {
        const errorMessage = "I apologize, but I'm experiencing technical difficulties. Please try again or contact our support team for assistance.";
        yield {
          content: errorMessage,
          done: true,
          sessionId: session.id,
          messageId,
          provider: 'Error Handler',
          confidence: 1.0,
        };
        fullResponse = errorMessage;
      }
    }

    // Create assistant message
    const assistantMessage: EnhancedChatMessage = {
      id: messageId,
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date(),
      metadata: {
        provider,
        confidence: 0.8,
        responseTime: Date.now() - startTime,
        intent: session.context.intent.type,
        knowledgeDocuments: session.context.knowledgeUsed.length,
      }
    };

    session.messages.push(assistantMessage);
    session.updatedAt = new Date();

    // Update session title if needed
    if (session.messages.length === 3 && session.title === 'New Conversation') {
      session.title = this.generateSessionTitle(session.messages[0].content);
    }

    // Update analytics
    this.updateAnalytics(session, {
      content: fullResponse,
      provider,
      model: options.model || 'default',
      responseTime: Date.now() - startTime,
      confidence: 0.8,
    }, session.context.intent);

    // Save session
    this.sessions.set(session.id, session);

    // Final done message
    yield {
      content: '',
      done: true,
      sessionId: session.id,
      messageId,
      provider,
      confidence: 0.8,
    };
  }

  async exportSession(sessionId: string): Promise<string | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const exportData = {
      ...session,
      exportedAt: new Date(),
      version: '2.0-enterprise'
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Analytics and monitoring
  async getSessionAnalytics(sessionId: string): Promise<SessionAnalytics | null> {
    const session = await this.getSession(sessionId);
    return session ? session.analytics : null;
  }

  async getGlobalAnalytics(): Promise<{
    totalSessions: number;
    averageSessionLength: number;
    topIntents: Array<{ intent: string; count: number }>;
    providerPerformance: Array<{ provider: string; usage: number; avgConfidence: number }>;
    satisfactionScore: number;
  }> {
    const sessions = Array.from(this.sessions.values());
    
    const intentCounts = new Map<string, number>();
    const providerStats = new Map<string, { count: number; totalConfidence: number }>();
    let totalSatisfaction = 0;
    let totalMessages = 0;

    for (const session of sessions) {
      // Intent analysis
      for (const topic of session.analytics.topicsDiscussed) {
        intentCounts.set(topic, (intentCounts.get(topic) || 0) + 1);
      }

      // Provider analysis
      for (const message of session.messages) {
        if (message.role === 'assistant' && message.metadata?.provider) {
          const provider = message.metadata.provider;
          const confidence = message.metadata.confidence || 0.5;
          
          if (!providerStats.has(provider)) {
            providerStats.set(provider, { count: 0, totalConfidence: 0 });
          }
          
          const stats = providerStats.get(provider)!;
          stats.count++;
          stats.totalConfidence += confidence;
        }
      }

      totalSatisfaction += session.analytics.userSatisfaction;
      totalMessages += session.analytics.messageCount;
    }

    const topIntents = Array.from(intentCounts.entries())
      .map(([intent, count]) => ({ intent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const providerPerformance = Array.from(providerStats.entries())
      .map(([provider, stats]) => ({
        provider,
        usage: stats.count,
        avgConfidence: stats.count > 0 ? stats.totalConfidence / stats.count : 0
      }))
      .sort((a, b) => b.usage - a.usage);

    return {
      totalSessions: sessions.length,
      averageSessionLength: sessions.length > 0 ? totalMessages / sessions.length : 0,
      topIntents,
      providerPerformance,
      satisfactionScore: sessions.length > 0 ? totalSatisfaction / sessions.length : 5.0,
    };
  }

  /**
   * Estimate cost for API usage
   */
  private estimateCost(response: ProviderResponse): number {
    const tokens = response.tokensUsed || 0;
    const model = response.model || 'gpt-4';
    
    // Approximate costs per 1K tokens (as of 2024)
    const costPerThousand: Record<string, number> = {
      'gpt-4': 0.03,
      'gpt-4-turbo': 0.01,
      'gpt-3.5-turbo': 0.0015,
      'claude-3-opus': 0.015,
      'claude-3-sonnet': 0.003,
      'claude-3-haiku': 0.00025,
      'gemini-pro': 0.00125,
      'mixtral-8x7b': 0.0007,
      'llama-3': 0.0004,
      'fallback': 0,
    };
    
    const rate = costPerThousand[model] || 0.01;
    return (tokens / 1000) * rate;
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return semanticCache.getStats();
  }
}

// Default enterprise chat service instance
export const enterpriseChatService = new EnterpriseChatService();