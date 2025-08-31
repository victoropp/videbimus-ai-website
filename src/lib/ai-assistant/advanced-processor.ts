import { 
  customerCareResponses, 
  intentPatterns, 
  journeyResponses,
  emotionalResponses,
  CustomerIntent,
  CustomerProfile
} from './customer-care-knowledge';
import { queryProcessor } from './query-processor';

export interface ConversationContext {
  userId: string;
  sessionId: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    intent?: string;
  }>;
  customerInfo?: {
    name?: string;
    email?: string;
    company?: string;
    phone?: string;
    interests: string[];
  };
  stage: 'awareness' | 'consideration' | 'decision' | 'retention';
  sentiment: 'positive' | 'neutral' | 'negative';
  lastInteraction?: Date;
}

export class AdvancedCustomerCareProcessor {
  private contexts: Map<string, ConversationContext> = new Map();
  
  // Detect customer intent from message
  detectIntent(message: string): CustomerIntent {
    const lowerMessage = message.toLowerCase();
    let detectedType: CustomerIntent['type'] = 'inquiry';
    let urgency: CustomerIntent['urgency'] = 'medium';
    let requiresHuman = false;

    // Check for appointment/scheduling intent
    if (intentPatterns.appointment.some(pattern => lowerMessage.includes(pattern))) {
      detectedType = 'appointment';
      urgency = 'high';
    }
    // Check for pricing intent
    else if (intentPatterns.pricing.some(pattern => lowerMessage.includes(pattern))) {
      detectedType = 'pricing';
      urgency = 'high';
    }
    // Check for support intent
    else if (intentPatterns.support.some(pattern => lowerMessage.includes(pattern))) {
      detectedType = 'support';
      urgency = 'high';
      requiresHuman = lowerMessage.includes('urgent') || lowerMessage.includes('emergency');
    }
    // Check for complaint
    else if (intentPatterns.complaint.some(pattern => lowerMessage.includes(pattern))) {
      detectedType = 'complaint';
      urgency = 'high';
      requiresHuman = true;
    }
    // Check for technical questions
    else if (intentPatterns.technical.some(pattern => lowerMessage.includes(pattern))) {
      detectedType = 'technical';
    }
    // Default to sales for general inquiries
    else if (intentPatterns.sales.some(pattern => lowerMessage.includes(pattern))) {
      detectedType = 'sales';
    }

    return { type: detectedType, urgency, requiresHuman };
  }

  // Analyze sentiment
  analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    const positive = ['good', 'great', 'excellent', 'love', 'amazing', 'perfect', 'thank'];
    const negative = ['bad', 'terrible', 'hate', 'angry', 'frustrated', 'disappointed', 'problem'];
    
    const lowerMessage = message.toLowerCase();
    const positiveCount = positive.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negative.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Get or create conversation context
  getContext(userId: string): ConversationContext {
    if (!this.contexts.has(userId)) {
      this.contexts.set(userId, {
        userId,
        sessionId: `session_${Date.now()}`,
        history: [],
        customerInfo: { interests: [] },
        stage: 'awareness',
        sentiment: 'neutral',
        lastInteraction: new Date()
      });
    }
    return this.contexts.get(userId)!;
  }

  // Extract customer information from message
  extractCustomerInfo(message: string, context: ConversationContext): void {
    // Extract email
    const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      context.customerInfo!.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = message.match(/\b\d{10,}\b|\+\d{1,3}\s?\d{4,}/);
    if (phoneMatch) {
      context.customerInfo!.phone = phoneMatch[0];
    }

    // Extract company mentions
    const companyPatterns = ['company', 'work at', 'from', 'represent'];
    companyPatterns.forEach(pattern => {
      const regex = new RegExp(`${pattern}\\s+([A-Z][\\w\\s]+)`, 'i');
      const match = message.match(regex);
      if (match) {
        context.customerInfo!.company = match[1].trim();
      }
    });

    // Track interests based on keywords
    const interests = ['ai implementation', 'machine learning', 'automation', 'data analytics', 'consulting'];
    interests.forEach(interest => {
      if (message.toLowerCase().includes(interest) && !context.customerInfo!.interests.includes(interest)) {
        context.customerInfo!.interests.push(interest);
      }
    });
  }

  // Update customer journey stage
  updateJourneyStage(context: ConversationContext, intent: CustomerIntent): void {
    const historyLength = context.history.length;
    
    if (intent.type === 'pricing' || intent.type === 'appointment') {
      context.stage = 'decision';
    } else if (historyLength > 5 && context.customerInfo?.email) {
      context.stage = 'consideration';
    } else if (historyLength > 10) {
      context.stage = 'retention';
    }
  }

  // Generate contextual response
  generateResponse(
    message: string, 
    userId: string,
    isFirstMessage: boolean = false
  ): {
    response: string;
    suggestedActions?: string[];
    requiresHuman?: boolean;
    customerInfo?: any;
  } {
    const context = this.getContext(userId);
    const intent = this.detectIntent(message);
    const sentiment = this.analyzeSentiment(message);
    
    // Update context
    context.sentiment = sentiment;
    context.lastInteraction = new Date();
    this.extractCustomerInfo(message, context);
    this.updateJourneyStage(context, intent);

    // Add to history
    context.history.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
      intent: intent.type
    });

    let response = '';
    let suggestedActions: string[] = [];

    // Handle first message
    if (isFirstMessage || context.history.length === 1) {
      const isReturning = context.history.length > 10;
      response = isReturning 
        ? customerCareResponses.greetings.returning[0]
        : customerCareResponses.greetings.new[0];
    }
    // Handle based on intent
    else {
      switch (intent.type) {
        case 'appointment':
          response = customerCareResponses.appointment.initial;
          suggestedActions = ['Schedule for this week', 'Learn more first', 'Check availability'];
          break;

        case 'pricing':
          response = customerCareResponses.pricing.general;
          if (context.stage === 'decision') {
            response += '\n\n' + customerCareResponses.urgency.limitedTime;
          }
          suggestedActions = ['Get custom quote', 'See ROI calculator', 'Start with pilot'];
          break;

        case 'support':
          response = customerCareResponses.support.general;
          if (sentiment === 'negative') {
            response = emotionalResponses.frustrated + '\n\n' + response;
          }
          suggestedActions = ['Email support', 'Schedule call', 'View documentation'];
          break;

        case 'complaint':
          response = emotionalResponses.frustrated;
          intent.requiresHuman = true;
          break;

        case 'sales':
          if (context.stage === 'awareness') {
            response = customerCareResponses.sales.discovery[0];
          } else if (context.stage === 'consideration') {
            response = customerCareResponses.sales.qualification[0];
          } else {
            response = customerCareResponses.closing.medium;
          }
          suggestedActions = ['Book consultation', 'See case studies', 'Get pricing'];
          break;

        case 'technical':
          // First try the basic query processor
          const basicResponse = queryProcessor.processQuery(message);
          if (basicResponse.confidence > 0.7) {
            response = basicResponse.answer;
          } else {
            response = customerCareResponses.support.technical;
            suggestedActions = ['Technical documentation', 'Speak to engineer', 'See API docs'];
          }
          break;

        default:
          // Use basic query processor for general inquiries
          const queryResponse = queryProcessor.processQuery(message);
          response = queryResponse.answer;
          
          // Add contextual enhancements
          if (context.stage === 'decision' && !context.customerInfo?.email) {
            response += '\n\n' + customerCareResponses.leadCapture.email;
          }
      }
    }

    // Add trust builders periodically
    if (context.history.length % 5 === 0 && sentiment !== 'negative') {
      const trustKeys = Object.keys(customerCareResponses.trust);
      const randomTrust = trustKeys[Math.floor(Math.random() * trustKeys.length)];
      response += '\n\n💡 ' + customerCareResponses.trust[randomTrust as keyof typeof customerCareResponses.trust];
    }

    // Lead capture if we don't have email and conversation is progressing
    if (context.history.length > 3 && !context.customerInfo?.email && intent.urgency === 'high') {
      response += '\n\n' + customerCareResponses.leadCapture.email;
      suggestedActions.push('Share contact info');
    }

    // Add to history
    context.history.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });

    return {
      response,
      suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
      requiresHuman: intent.requiresHuman,
      customerInfo: context.customerInfo
    };
  }

  // Get conversation summary
  getConversationSummary(userId: string): string {
    const context = this.getContext(userId);
    const info = context.customerInfo;
    
    return `
📊 Conversation Summary:
- Stage: ${context.stage}
- Sentiment: ${context.sentiment}
- Messages: ${context.history.length}
- Customer: ${info?.name || 'Unknown'}
- Email: ${info?.email || 'Not provided'}
- Company: ${info?.company || 'Not provided'}
- Interests: ${info?.interests.join(', ') || 'None identified'}
- Last Intent: ${context.history[context.history.length - 1]?.intent || 'Unknown'}
    `.trim();
  }

  // Check if human handoff is needed
  shouldHandoff(userId: string): boolean {
    const context = this.getContext(userId);
    
    // Handoff conditions
    if (context.sentiment === 'negative' && context.history.length > 5) return true;
    if (context.history.some(h => h.content.toLowerCase().includes('speak to human'))) return true;
    if (context.history.some(h => h.content.toLowerCase().includes('real person'))) return true;
    if (context.history.filter(h => h.role === 'user').length > 15) return true;
    
    return false;
  }
}

export const customerCareProcessor = new AdvancedCustomerCareProcessor();