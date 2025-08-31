import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { HfInference } from '@huggingface/inference';
import { CohereClient } from 'cohere-ai';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Replicate from 'replicate';
import { aiConfig } from './config';

export interface ProviderConfig {
  name: string;
  priority: number;
  maxRetries: number;
  timeoutMs: number;
  rateLimitDelay: number;
  healthCheck: () => Promise<boolean>;
}

export interface EnhancedChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  id?: string;
  metadata?: Record<string, any>;
}

export interface ChatCompletionRequest {
  messages: EnhancedChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemContext?: string;
  userContext?: Record<string, any>;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  provider: string;
  model: string;
  confidence?: number;
}

export interface ProviderResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  responseTime: number;
  confidence: number;
}

export class EnhancedAIProviders {
  private providers: Map<string, ProviderConfig> = new Map();
  private clients: Map<string, any> = new Map();
  private fallbackResponses = new Map<string, string[]>();

  constructor() {
    this.initializeProviders();
    this.initializeClients();
    this.initializeFallbackResponses();
  }

  private initializeProviders() {
    const configs: Array<[string, ProviderConfig]> = [
      ['groq', {
        name: 'Groq',
        priority: 9,
        maxRetries: 3,
        timeoutMs: 30000,
        rateLimitDelay: 1000,
        healthCheck: async () => this.testGroqConnection()
      }],
      ['openai', {
        name: 'OpenAI',
        priority: 8,
        maxRetries: 3,
        timeoutMs: 60000,
        rateLimitDelay: 2000,
        healthCheck: async () => this.testOpenAIConnection()
      }],
      ['anthropic', {
        name: 'Anthropic',
        priority: 8,
        maxRetries: 3,
        timeoutMs: 60000,
        rateLimitDelay: 1500,
        healthCheck: async () => this.testAnthropicConnection()
      }],
      ['google', {
        name: 'Google AI',
        priority: 7,
        maxRetries: 3,
        timeoutMs: 45000,
        rateLimitDelay: 1000,
        healthCheck: async () => this.testGoogleConnection()
      }],
      ['cohere', {
        name: 'Cohere',
        priority: 6,
        maxRetries: 3,
        timeoutMs: 45000,
        rateLimitDelay: 1500,
        healthCheck: async () => this.testCohereConnection()
      }],
      ['huggingface', {
        name: 'Hugging Face',
        priority: 5,
        maxRetries: 2,
        timeoutMs: 120000,
        rateLimitDelay: 3000,
        healthCheck: async () => this.testHuggingFaceConnection()
      }],
      ['together', {
        name: 'Together AI',
        priority: 7,
        maxRetries: 3,
        timeoutMs: 45000,
        rateLimitDelay: 1000,
        healthCheck: async () => this.testTogetherConnection()
      }],
      ['replicate', {
        name: 'Replicate',
        priority: 4,
        maxRetries: 2,
        timeoutMs: 180000,
        rateLimitDelay: 5000,
        healthCheck: async () => this.testReplicateConnection()
      }]
    ];

    configs.forEach(([key, config]) => {
      this.providers.set(key, config);
    });
  }

  private initializeClients() {
    // OpenAI
    if (aiConfig.openaiApiKey && this.isValidApiKey(aiConfig.openaiApiKey)) {
      this.clients.set('openai', new OpenAI({
        apiKey: aiConfig.openaiApiKey,
        timeout: this.providers.get('openai')?.timeoutMs,
      }));
    }

    // Anthropic
    if (aiConfig.anthropicApiKey && this.isValidApiKey(aiConfig.anthropicApiKey)) {
      this.clients.set('anthropic', new Anthropic({
        apiKey: aiConfig.anthropicApiKey,
        timeout: this.providers.get('anthropic')?.timeoutMs,
      }));
    }

    // Groq
    if (aiConfig.groqApiKey && this.isValidApiKey(aiConfig.groqApiKey)) {
      this.clients.set('groq', new Groq({
        apiKey: aiConfig.groqApiKey,
        timeout: this.providers.get('groq')?.timeoutMs,
      }));
    }

    // Google
    if (aiConfig.googleApiKey && this.isValidApiKey(aiConfig.googleApiKey)) {
      this.clients.set('google', new GoogleGenerativeAI(aiConfig.googleApiKey));
    }

    // Cohere
    if (aiConfig.cohereApiKey && this.isValidApiKey(aiConfig.cohereApiKey)) {
      this.clients.set('cohere', new CohereClient({
        token: aiConfig.cohereApiKey,
      }));
    }

    // Hugging Face
    if (aiConfig.huggingfaceApiKey && this.isValidApiKey(aiConfig.huggingfaceApiKey)) {
      this.clients.set('huggingface', new HfInference(aiConfig.huggingfaceApiKey));
    }

    // Together AI
    if (aiConfig.togetherApiKey && this.isValidApiKey(aiConfig.togetherApiKey)) {
      this.clients.set('together', new OpenAI({
        apiKey: aiConfig.togetherApiKey,
        baseURL: 'https://api.together.xyz',
        timeout: this.providers.get('together')?.timeoutMs,
      }));
    }

    // Replicate
    if (aiConfig.replicateApiKey && this.isValidApiKey(aiConfig.replicateApiKey)) {
      this.clients.set('replicate', new Replicate({
        auth: aiConfig.replicateApiKey,
      }));
    }
  }

  private initializeFallbackResponses() {
    this.fallbackResponses.set('greeting', [
      "Hello! I'm Vidibemus AI's intelligent assistant. I'm here to help you learn about our AI consulting services and how we can transform your business with cutting-edge artificial intelligence solutions.",
      "Welcome to Vidibemus AI! I can provide information about our AI consulting services, data science solutions, and how we help businesses implement successful AI strategies.",
      "Greetings! I'm your AI assistant from Vidibemus AI. I'm ready to discuss our enterprise AI solutions, custom development services, and how we can help accelerate your AI transformation."
    ]);

    this.fallbackResponses.set('services', [
      "Vidibemus AI offers comprehensive AI consulting services including custom machine learning development, data science analytics, process automation, and AI strategy consulting. We specialize in transforming businesses through intelligent automation and predictive analytics.",
      "Our core services include: AI strategy development, custom machine learning models, natural language processing solutions, computer vision applications, predictive analytics, and intelligent process automation. We work across industries to deliver measurable business value.",
      "We provide end-to-end AI solutions: from initial strategy and feasibility analysis to custom model development and production deployment. Our expertise spans machine learning, deep learning, NLP, computer vision, and MLOps."
    ]);

    this.fallbackResponses.set('pricing', [
      "Our pricing is tailored to each project's specific requirements. We offer flexible engagement models including hourly consulting ($200-400/hour), fixed-price projects (starting at $25K), and retainer agreements for ongoing support. I'd recommend scheduling a consultation for a customized proposal.",
      "We structure our pricing based on project scope and complexity. AI consulting services range from $200-400 per hour, while custom development projects typically start at $50K. For accurate pricing tailored to your needs, let's discuss your specific requirements.",
      "Our investment varies by project scope: AI strategy consulting ($200-400/hour), custom model development ($50K-500K+), and data science projects (starting at $25K). We provide detailed estimates after understanding your specific use case and requirements."
    ]);

    this.fallbackResponses.set('technical', [
      "Our technical stack includes TensorFlow, PyTorch, Scikit-learn for machine learning; BERT, GPT, and transformer models for NLP; OpenCV and custom CNNs for computer vision; and comprehensive MLOps pipelines for production deployment across AWS, Azure, and GCP.",
      "We work with cutting-edge AI technologies: deep learning frameworks (TensorFlow, PyTorch), NLP models (transformers, BERT, GPT), computer vision architectures (CNNs, YOLO), and modern MLOps tools for scalable deployment and monitoring.",
      "Our technology expertise spans machine learning (supervised/unsupervised learning, ensemble methods), deep learning (neural networks, CNNs, RNNs), NLP (transformer models, sentiment analysis), computer vision (object detection, image classification), and cloud-native AI deployments."
    ]);

    this.fallbackResponses.set('support', [
      "I'm here to help! For technical support, project inquiries, or general questions about our AI services, you can reach our team at contact@vidibemusai.com or schedule a consultation call. What specific challenge can I assist you with today?",
      "Our support team is ready to assist with any questions about AI implementation, project requirements, or technical challenges. Feel free to ask me anything about our services, or contact us directly at contact@vidibemusai.com for detailed discussions.",
      "I'm available to help with information about our AI solutions, technical capabilities, pricing, or project planning. For complex technical support or custom requirements, our expert team is available for consultation calls and detailed discussions."
    ]);
  }

  private isValidApiKey(key: string | undefined): boolean {
    if (!key) return false;
    if (key.length < 10) return false;
    if (key.includes('your-') || key.includes('sk-your') || key.includes('PLACEHOLDER')) return false;
    return true;
  }

  async getHealthyProviders(): Promise<string[]> {
    const healthyProviders: string[] = [];
    
    for (const [providerName, config] of this.providers) {
      if (this.clients.has(providerName)) {
        try {
          const isHealthy = await Promise.race([
            config.healthCheck(),
            new Promise<boolean>((_, reject) => 
              setTimeout(() => reject(new Error('Health check timeout')), 5000)
            )
          ]);
          
          if (isHealthy) {
            healthyProviders.push(providerName);
          }
        } catch (error) {
          console.warn(`Health check failed for ${providerName}:`, error);
        }
      }
    }

    // Sort by priority
    return healthyProviders.sort((a, b) => {
      const priorityA = this.providers.get(a)?.priority || 0;
      const priorityB = this.providers.get(b)?.priority || 0;
      return priorityB - priorityA;
    });
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ProviderResponse | AsyncGenerator<StreamChunk>> {
    const startTime = Date.now();
    
    if (request.stream) {
      return this.streamCompletion(request, startTime);
    }
    
    const healthyProviders = await this.getHealthyProviders();
    
    // Add available clients as fallback
    const allProviders = [...healthyProviders];
    for (const clientName of this.clients.keys()) {
      if (!allProviders.includes(clientName)) {
        allProviders.push(clientName);
      }
    }

    if (allProviders.length === 0) {
      return this.generateIntelligentFallback(request, startTime);
    }

    let lastError: any = null;

    for (const providerName of allProviders) {
      const provider = this.providers.get(providerName);
      const client = this.clients.get(providerName);
      
      if (!client || !provider) continue;

      for (let attempt = 1; attempt <= provider.maxRetries; attempt++) {
        try {
          console.log(`Attempting ${providerName} (attempt ${attempt}/${provider.maxRetries})`);
          
          const result = await this.callProvider(providerName, client, request);
          
          if (result) {
            return {
              ...result,
              responseTime: Date.now() - startTime,
              confidence: this.calculateConfidence(result.content, providerName)
            };
          }
        } catch (error) {
          console.error(`${providerName} attempt ${attempt} failed:`, error);
          lastError = error;
          
          if (attempt < provider.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, provider.rateLimitDelay * attempt));
          }
        }
      }
    }

    console.log('All providers failed, using intelligent fallback');
    return this.generateIntelligentFallback(request, startTime, lastError);
  }

  private async callProvider(providerName: string, client: any, request: ChatCompletionRequest): Promise<Partial<ProviderResponse> | null> {
    switch (providerName) {
      case 'openai':
        return await this.callOpenAI(client, request);
      case 'anthropic':
        return await this.callAnthropic(client, request);
      case 'groq':
        return await this.callGroq(client, request);
      case 'google':
        return await this.callGoogle(client, request);
      case 'cohere':
        return await this.callCohere(client, request);
      case 'huggingface':
        return await this.callHuggingFace(client, request);
      case 'together':
        return await this.callTogether(client, request);
      case 'replicate':
        return await this.callReplicate(client, request);
      default:
        return null;
    }
  }

  private async callOpenAI(client: OpenAI, request: ChatCompletionRequest): Promise<Partial<ProviderResponse>> {
    const response = await client.chat.completions.create({
      model: request.model || 'gpt-4-turbo-preview',
      messages: request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 1000,
      stream: false,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      provider: 'OpenAI',
      model: response.model,
      tokensUsed: response.usage?.total_tokens,
    };
  }

  private async callAnthropic(client: Anthropic, request: ChatCompletionRequest): Promise<Partial<ProviderResponse>> {
    const systemMessage = request.messages.find(m => m.role === 'system')?.content || '';
    const messages = request.messages.filter(m => m.role !== 'system');

    const response = await client.messages.create({
      model: request.model || 'claude-3-sonnet-20240229',
      system: systemMessage,
      messages: messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 1000,
    });

    const content = Array.isArray(response.content) 
      ? response.content.find(c => c.type === 'text')?.text || ''
      : '';

    return {
      content,
      provider: 'Anthropic',
      model: response.model,
      tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens,
    };
  }

  private async callGroq(client: Groq, request: ChatCompletionRequest): Promise<Partial<ProviderResponse>> {
    const response = await client.chat.completions.create({
      model: request.model || 'mixtral-8x7b-32768',
      messages: request.messages.map(msg => ({
        role: msg.role as any,
        content: msg.content,
      })),
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 1000,
      stream: false,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      provider: 'Groq',
      model: response.model,
      tokensUsed: response.usage?.total_tokens,
    };
  }

  private async callGoogle(client: GoogleGenerativeAI, request: ChatCompletionRequest): Promise<Partial<ProviderResponse>> {
    const model = client.getGenerativeModel({ model: request.model || 'gemini-pro' });
    
    const chat = model.startChat({
      history: request.messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || 1000,
      },
    });

    const result = await chat.sendMessage(request.messages[request.messages.length - 1].content);
    const response = await result.response;

    return {
      content: response.text() || '',
      provider: 'Google AI',
      model: request.model || 'gemini-pro',
    };
  }

  private async callCohere(client: CohereClient, request: ChatCompletionRequest): Promise<Partial<ProviderResponse>> {
    const messages = request.messages.filter(m => m.role !== 'system');
    const lastMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
      message: msg.content,
    }));

    const response = await client.chat({
      model: request.model || 'command',
      message: lastMessage.content,
      chatHistory: history,
      temperature: request.temperature || 0.7,
      maxTokens: request.maxTokens || 1000,
    });

    return {
      content: response.text || '',
      provider: 'Cohere',
      model: request.model || 'command',
      tokensUsed: response.meta?.tokens?.inputTokens + response.meta?.tokens?.outputTokens,
    };
  }

  private async callHuggingFace(client: HfInference, request: ChatCompletionRequest): Promise<Partial<ProviderResponse>> {
    const models = [
      'microsoft/DialoGPT-medium',
      'facebook/blenderbot-400M-distill',
      'google/flan-t5-base',
      'mistralai/Mistral-7B-Instruct-v0.2',
    ];

    const modelToTry = request.model && models.includes(request.model) ? request.model : models[0];
    const prompt = this.formatMessagesForHF(request.messages);

    const response = await client.textGeneration({
      model: modelToTry,
      inputs: prompt,
      parameters: {
        max_new_tokens: Math.min(request.maxTokens || 500, 500),
        temperature: request.temperature || 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    });

    return {
      content: response.generated_text || '',
      provider: 'Hugging Face',
      model: modelToTry,
    };
  }

  private async callTogether(client: OpenAI, request: ChatCompletionRequest): Promise<Partial<ProviderResponse>> {
    const response = await client.chat.completions.create({
      model: request.model || 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 1000,
      stream: false,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      provider: 'Together AI',
      model: response.model,
      tokensUsed: response.usage?.total_tokens,
    };
  }

  private async callReplicate(client: Replicate, request: ChatCompletionRequest): Promise<Partial<ProviderResponse>> {
    const modelId = 'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3';
    const systemPrompt = request.messages.find(m => m.role === 'system')?.content || '';
    const prompt = this.formatMessagesForReplicate(request.messages);

    const output = await client.run(modelId, {
      input: {
        prompt,
        system_prompt: systemPrompt,
        temperature: request.temperature || 0.7,
        max_new_tokens: request.maxTokens || 1000,
        top_p: 0.9,
      }
    });

    const content = Array.isArray(output) ? output.join('') : String(output);

    return {
      content,
      provider: 'Replicate',
      model: 'llama-2-70b-chat',
    };
  }

  private formatMessagesForHF(messages: EnhancedChatMessage[]): string {
    return messages.map(msg => {
      const prefix = msg.role === 'system' ? 'System: ' : 
                     msg.role === 'user' ? 'Human: ' : 
                     'Assistant: ';
      return prefix + msg.content;
    }).join('\n\n') + '\n\nAssistant:';
  }

  private formatMessagesForReplicate(messages: EnhancedChatMessage[]): string {
    const conversationMessages = messages.filter(m => m.role !== 'system');
    return conversationMessages.map(msg => {
      const prefix = msg.role === 'user' ? 'User: ' : 'Assistant: ';
      return prefix + msg.content;
    }).join('\n\n') + '\n\nAssistant:';
  }

  private generateIntelligentFallback(request: ChatCompletionRequest, startTime: number, error?: any): ProviderResponse {
    // Throw error to trigger proper knowledge base fallback in enterprise-chat-service
    // This ensures we use the smart responses with consultation focus for pricing
    throw new Error('All AI providers failed - triggering knowledge base fallback');
  }

  private calculateConfidence(content: string, provider: string): number {
    let confidence = 0.7; // Base confidence

    // Length check
    if (content.length > 100) confidence += 0.1;
    if (content.length > 300) confidence += 0.1;

    // Provider reliability
    const providerBonus = {
      'OpenAI': 0.1,
      'Anthropic': 0.1,
      'Groq': 0.05,
      'Google AI': 0.05,
      'Cohere': 0.05,
    }[provider] || 0;

    confidence += providerBonus;

    // Content quality indicators
    if (content.includes('•') || content.includes('**') || content.includes('###')) {
      confidence += 0.05; // Well-formatted response
    }

    return Math.min(confidence, 1.0);
  }

  private async *streamCompletion(request: ChatCompletionRequest, startTime: number): AsyncGenerator<StreamChunk> {
    const healthyProviders = await this.getHealthyProviders();
    
    // Add available clients as fallback
    const allProviders = [...healthyProviders];
    for (const clientName of this.clients.keys()) {
      if (!allProviders.includes(clientName)) {
        allProviders.push(clientName);
      }
    }

    if (allProviders.length === 0) {
      const fallbackResponse = this.generateIntelligentFallback(request, startTime);
      yield {
        content: fallbackResponse.content,
        done: true,
        provider: fallbackResponse.provider,
        model: fallbackResponse.model,
        confidence: fallbackResponse.confidence,
      };
      return;
    }

    let lastError: any = null;

    for (const providerName of allProviders) {
      const provider = this.providers.get(providerName);
      const client = this.clients.get(providerName);
      
      if (!client || !provider) continue;

      try {
        console.log(`Attempting streaming with ${providerName}`);
        
        const stream = await this.callProviderStream(providerName, client, request);
        
        if (stream) {
          let fullContent = '';
          for await (const chunk of stream) {
            fullContent += chunk.content;
            yield chunk;
          }
          
          // Final chunk with confidence calculation
          yield {
            content: '',
            done: true,
            provider: providerName,
            model: request.model || 'default',
            confidence: this.calculateConfidence(fullContent, providerName),
          };
          return;
        }
      } catch (error) {
        console.error(`Streaming ${providerName} failed:`, error);
        lastError = error;
        continue;
      }
    }

    // If all providers fail, yield fallback response
    const fallbackResponse = this.generateIntelligentFallback(request, startTime, lastError);
    yield {
      content: fallbackResponse.content,
      done: true,
      provider: fallbackResponse.provider,
      model: fallbackResponse.model,
      confidence: fallbackResponse.confidence,
    };
  }

  private async callProviderStream(providerName: string, client: any, request: ChatCompletionRequest): Promise<AsyncGenerator<StreamChunk> | null> {
    switch (providerName) {
      case 'openai':
        return await this.streamOpenAI(client, request);
      case 'anthropic':
        return await this.streamAnthropic(client, request);
      case 'groq':
        return await this.streamGroq(client, request);
      case 'together':
        return await this.streamTogether(client, request);
      case 'huggingface':
        return await this.streamHuggingFace(client, request);
      default:
        return null;
    }
  }

  private async *streamOpenAI(client: OpenAI, request: ChatCompletionRequest): AsyncGenerator<StreamChunk> {
    const stream = await client.chat.completions.create({
      model: request.model || 'gpt-4-turbo-preview',
      messages: request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 1000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield {
          content,
          done: false,
          provider: 'OpenAI',
          model: chunk.model,
        };
      }
    }
  }

  private async *streamAnthropic(client: Anthropic, request: ChatCompletionRequest): AsyncGenerator<StreamChunk> {
    const systemMessage = request.messages.find(m => m.role === 'system')?.content || '';
    const messages = request.messages.filter(m => m.role !== 'system');

    const stream = await client.messages.create({
      model: request.model || 'claude-3-sonnet-20240229',
      system: systemMessage,
      messages: messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 1000,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield {
          content: chunk.delta.text,
          done: false,
          provider: 'Anthropic',
          model: request.model || 'claude-3-sonnet-20240229',
        };
      }
    }
  }

  private async *streamGroq(client: Groq, request: ChatCompletionRequest): AsyncGenerator<StreamChunk> {
    const stream = await client.chat.completions.create({
      model: request.model || 'mixtral-8x7b-32768',
      messages: request.messages.map(msg => ({
        role: msg.role as any,
        content: msg.content,
      })),
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 1000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield {
          content,
          done: false,
          provider: 'Groq',
          model: chunk.model,
        };
      }
    }
  }

  private async *streamTogether(client: OpenAI, request: ChatCompletionRequest): AsyncGenerator<StreamChunk> {
    const stream = await client.chat.completions.create({
      model: request.model || 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 1000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield {
          content,
          done: false,
          provider: 'Together AI',
          model: chunk.model,
        };
      }
    }
  }

  private async *streamHuggingFace(client: HfInference, request: ChatCompletionRequest): AsyncGenerator<StreamChunk> {
    const models = [
      'microsoft/DialoGPT-medium',
      'facebook/blenderbot-400M-distill',
      'mistralai/Mistral-7B-Instruct-v0.2',
    ];

    const modelToTry = request.model && models.includes(request.model) ? request.model : models[0];
    const prompt = this.formatMessagesForHF(request.messages);

    try {
      const stream = await client.textGenerationStream({
        model: modelToTry,
        inputs: prompt,
        parameters: {
          max_new_tokens: Math.min(request.maxTokens || 500, 500),
          temperature: request.temperature || 0.7,
          top_p: 0.9,
          return_full_text: false,
        },
      });

      for await (const chunk of stream) {
        const content = chunk.token?.text || '';
        if (content) {
          yield {
            content,
            done: false,
            provider: 'Hugging Face',
            model: modelToTry,
          };
        }
      }
    } catch (error) {
      console.error('HuggingFace streaming failed:', error);
      // Fallback to non-streaming for HuggingFace
      const response = await this.callHuggingFace(client, request);
      if (response) {
        // Simulate streaming by breaking up the response
        const words = response.content.split(' ');
        for (let i = 0; i < words.length; i++) {
          const content = (i === 0 ? '' : ' ') + words[i];
          yield {
            content,
            done: i === words.length - 1,
            provider: 'Hugging Face',
            model: modelToTry,
          };
          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    }
  }

  // Health check methods
  private async testOpenAIConnection(): Promise<boolean> {
    try {
      const client = this.clients.get('openai');
      if (!client) return false;
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  private async testAnthropicConnection(): Promise<boolean> {
    try {
      const client = this.clients.get('anthropic');
      if (!client) return false;
      // Simple test - create a minimal message
      const response = await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      return response.content.length > 0;
    } catch {
      return false;
    }
  }

  private async testGroqConnection(): Promise<boolean> {
    try {
      const client = this.clients.get('groq');
      if (!client) return false;
      const response = await client.chat.completions.create({
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'mixtral-8x7b-32768',
        max_tokens: 10,
      });
      return response.choices.length > 0;
    } catch {
      return false;
    }
  }

  private async testGoogleConnection(): Promise<boolean> {
    try {
      const client = this.clients.get('google');
      if (!client) return false;
      const model = client.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent('Hi');
      const response = await result.response;
      return response.text().length > 0;
    } catch {
      return false;
    }
  }

  private async testCohereConnection(): Promise<boolean> {
    try {
      const client = this.clients.get('cohere');
      if (!client) return false;
      const response = await client.chat({
        message: 'Hi',
        maxTokens: 10,
      });
      return response.text !== undefined;
    } catch {
      return false;
    }
  }

  private async testHuggingFaceConnection(): Promise<boolean> {
    try {
      const client = this.clients.get('huggingface');
      if (!client) return false;
      const response = await client.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: 'Hi',
        parameters: { max_new_tokens: 10 },
      });
      return response.generated_text !== undefined;
    } catch {
      return false;
    }
  }

  private async testTogetherConnection(): Promise<boolean> {
    try {
      const client = this.clients.get('together');
      if (!client) return false;
      const response = await client.chat.completions.create({
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        max_tokens: 10,
      });
      return response.choices.length > 0;
    } catch {
      return false;
    }
  }

  private async testReplicateConnection(): Promise<boolean> {
    try {
      const client = this.clients.get('replicate');
      if (!client) return false;
      // Skip actual test due to cost - assume healthy if client exists
      return true;
    } catch {
      return false;
    }
  }
}

export const enhancedProviders = new EnhancedAIProviders();