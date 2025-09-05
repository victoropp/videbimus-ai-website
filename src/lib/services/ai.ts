import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { HfInference } from '@huggingface/inference';
import { getAIConfig } from '../config/services';
import { withErrorHandling, ServiceErrorType, CustomServiceError } from './error-handler';
import { getErrorMessage, toError } from '../utils';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
}

export interface ChatCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  streaming?: boolean;
  systemPrompt?: string;
  tools?: any[];
  toolChoice?: 'auto' | 'none' | any;
}

export interface ChatResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
  toolCalls?: any[];
}

export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'huggingface';
  type: 'chat' | 'embedding' | 'completion';
  maxTokens: number;
  contextWindow: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
  costPer1kTokens: {
    input: number;
    output: number;
  };
}

// Model definitions
const MODELS: Record<string, ModelInfo> = {
  // OpenAI Models
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4 Omni',
    provider: 'openai',
    type: 'chat',
    maxTokens: 4096,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsTools: true,
    costPer1kTokens: { input: 0.005, output: 0.015 },
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4 Omni Mini',
    provider: 'openai',
    type: 'chat',
    maxTokens: 16384,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsTools: true,
    costPer1kTokens: { input: 0.00015, output: 0.0006 },
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    type: 'chat',
    maxTokens: 4096,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsTools: true,
    costPer1kTokens: { input: 0.01, output: 0.03 },
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    type: 'chat',
    maxTokens: 4096,
    contextWindow: 16384,
    supportsStreaming: true,
    supportsTools: true,
    costPer1kTokens: { input: 0.0015, output: 0.002 },
  },
  
  // Anthropic Models
  'claude-3-5-sonnet-20241022': {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    type: 'chat',
    maxTokens: 8192,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsTools: true,
    costPer1kTokens: { input: 0.003, output: 0.015 },
  },
  'claude-3-opus-20240229': {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    type: 'chat',
    maxTokens: 4096,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsTools: true,
    costPer1kTokens: { input: 0.015, output: 0.075 },
  },
  'claude-3-haiku-20240307': {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    type: 'chat',
    maxTokens: 4096,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsTools: false,
    costPer1kTokens: { input: 0.00025, output: 0.00125 },
  },
  
  // Embedding Models
  'text-embedding-3-large': {
    id: 'text-embedding-3-large',
    name: 'Text Embedding 3 Large',
    provider: 'openai',
    type: 'embedding',
    maxTokens: 8191,
    contextWindow: 8191,
    supportsStreaming: false,
    supportsTools: false,
    costPer1kTokens: { input: 0.00013, output: 0 },
  },
  'text-embedding-3-small': {
    id: 'text-embedding-3-small',
    name: 'Text Embedding 3 Small',
    provider: 'openai',
    type: 'embedding',
    maxTokens: 8191,
    contextWindow: 8191,
    supportsStreaming: false,
    supportsTools: false,
    costPer1kTokens: { input: 0.00002, output: 0 },
  },
};

class AIService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private huggingface: HfInference;
  private config: ReturnType<typeof getAIConfig>;
  private usageTracking: Map<string, { tokens: number; requests: number; cost: number }> = new Map();

  constructor() {
    this.config = getAIConfig();
    
    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: this.config.openai.apiKey,
      baseURL: this.config.openai.baseUrl,
      organization: this.config.openai.organization,
      timeout: this.config.openai.timeout,
      maxRetries: 0, // We handle retries ourselves
    });
    
    // Initialize Anthropic
    this.anthropic = new Anthropic({
      apiKey: this.config.anthropic.apiKey,
      baseURL: this.config.anthropic.baseUrl,
      timeout: this.config.anthropic.timeout,
      maxRetries: 0, // We handle retries ourselves
    });
    
    // Initialize Hugging Face
    this.huggingface = new HfInference(this.config.huggingface.apiKey);
  }

  // Get available models
  getAvailableModels(type?: 'chat' | 'embedding' | 'completion'): ModelInfo[] {
    const models = Object.values(MODELS);
    return type ? models.filter(model => model.type === type) : models;
  }

  // Get model info
  getModelInfo(modelId: string): ModelInfo | null {
    return MODELS[modelId] || null;
  }

  // Chat completion
  async chatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<ChatResponse> {
    const model = options.model || this.config.openai.defaultModel;
    const modelInfo = this.getModelInfo(model);
    
    if (!modelInfo) {
      throw new CustomServiceError({
        type: ServiceErrorType.VALIDATION,
        service: 'ai',
        operation: 'chatCompletion',
        message: `Unknown model: ${model}`,
        retryable: false,
        metadata: { model },
      });
    }

    try {
      let response: ChatResponse;

      if (modelInfo.provider === 'openai') {
        response = await this.openaiChatCompletion(messages, options, modelInfo);
      } else if (modelInfo.provider === 'anthropic') {
        response = await this.anthropicChatCompletion(messages, options, modelInfo);
      } else if (modelInfo.provider === 'huggingface') {
        response = await this.huggingfaceChatCompletion(messages, options, modelInfo);
      } else {
        throw new Error(`Unsupported provider: ${modelInfo.provider}`);
      }

      // Track usage
      this.trackUsage(model, response.usage.totalTokens, 1, this.calculateCost(modelInfo, response.usage));
      
      return response;
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.AI_SERVICE,
        service: 'ai',
        operation: 'chatCompletion',
        message: `Chat completion failed: ${getErrorMessage(error)}`,
        retryable: this.isRetryableError(error),
        originalError: error as Error,
        metadata: { model, provider: modelInfo.provider },
      });
    }
  }

  private async openaiChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions,
    modelInfo: ModelInfo
  ): Promise<ChatResponse> {
    const systemPrompt = options.systemPrompt;
    const chatMessages = systemPrompt 
      ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
      : messages;

    const completion = await this.openai.chat.completions.create({
      model: modelInfo.id,
      messages: chatMessages,
      max_tokens: Math.min(options.maxTokens || modelInfo.maxTokens, modelInfo.maxTokens),
      temperature: options.temperature ?? 0.7,
      stream: options.streaming ?? false,
      tools: options.tools,
      tool_choice: options.toolChoice,
    });

    // Handle streaming vs non-streaming responses
    if ('choices' in completion && completion.choices) {
      const choice = completion.choices[0];
      if (!choice) {
        throw new Error('No completion choice returned');
      }

      return {
        content: choice.message?.content || '',
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        model: completion.model,
        finishReason: choice.finish_reason || 'unknown',
        toolCalls: choice.message?.tool_calls,
      };
    } else {
      // Handle streaming response case
      throw new Error('Streaming responses not supported in this context');
    }
  }

  private async anthropicChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions,
    modelInfo: ModelInfo
  ): Promise<ChatResponse> {
    const systemPrompt = options.systemPrompt || '';
    const userMessages = messages.filter(m => m.role !== 'system');

    const completion = await this.anthropic.messages.create({
      model: modelInfo.id,
      system: systemPrompt,
      messages: userMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      max_tokens: Math.min(options.maxTokens || modelInfo.maxTokens, modelInfo.maxTokens),
      temperature: options.temperature ?? 0.7,
      stream: options.streaming ?? false,
      tools: options.tools,
      tool_choice: options.toolChoice,
    });

    // Handle streaming vs non-streaming responses
    if ('content' in completion && Array.isArray(completion.content)) {
      const textContent = completion.content
        .filter(c => c.type === 'text')
        .map(c => (c as any).text)
        .join('\n');

      return {
        content: textContent,
        usage: {
          promptTokens: completion.usage?.input_tokens || 0,
          completionTokens: completion.usage?.output_tokens || 0,
          totalTokens: (completion.usage?.input_tokens || 0) + (completion.usage?.output_tokens || 0),
        },
        model: completion.model || 'anthropic',
        finishReason: completion.stop_reason || 'unknown',
        toolCalls: completion.content.filter(c => c.type === 'tool_use'),
      };
    } else {
      // Handle streaming response case
      throw new Error('Streaming responses not supported in this context');
    }
  }

  private async huggingfaceChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions,
    modelInfo: ModelInfo
  ): Promise<ChatResponse> {
    const prompt = this.formatMessagesForHuggingFace(messages, options.systemPrompt);
    
    const result = await this.huggingface.textGeneration({
      model: modelInfo.id,
      inputs: prompt,
      parameters: {
        max_new_tokens: Math.min(options.maxTokens || modelInfo.maxTokens, modelInfo.maxTokens),
        temperature: options.temperature ?? 0.7,
        return_full_text: false,
      },
    });

    const generatedText = typeof result === 'string' ? result : result.generated_text;
    const tokens = this.estimateTokens(generatedText);

    return {
      content: generatedText,
      usage: {
        promptTokens: this.estimateTokens(prompt),
        completionTokens: tokens,
        totalTokens: this.estimateTokens(prompt) + tokens,
      },
      model: modelInfo.id,
      finishReason: 'stop',
    };
  }

  // Generate embeddings
  async generateEmbeddings(
    texts: string[],
    options: EmbeddingOptions = {}
  ): Promise<EmbeddingResponse> {
    const model = options.model || 'text-embedding-3-small';
    const modelInfo = this.getModelInfo(model);

    if (!modelInfo || modelInfo.type !== 'embedding') {
      throw new CustomServiceError({
        type: ServiceErrorType.VALIDATION,
        service: 'ai',
        operation: 'generateEmbeddings',
        message: `Invalid embedding model: ${model}`,
        retryable: false,
        metadata: { model },
      });
    }

    try {
      const response = await this.openai.embeddings.create({
        model: modelInfo.id,
        input: texts,
        dimensions: options.dimensions,
      });

      const embeddings = response.data.map(item => item.embedding);
      
      // Track usage
      const totalTokens = response.usage.total_tokens;
      this.trackUsage(model, totalTokens, 1, this.calculateCost(modelInfo, { 
        promptTokens: totalTokens,
        completionTokens: 0
      }));

      return {
        embeddings,
        usage: {
          promptTokens: response.usage.total_tokens,
          totalTokens: response.usage.total_tokens,
        },
        model: response.model,
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.AI_SERVICE,
        service: 'ai',
        operation: 'generateEmbeddings',
        message: `Embedding generation failed: ${getErrorMessage(error)}`,
        retryable: this.isRetryableError(error),
        originalError: error as Error,
        metadata: { model, textsCount: texts.length },
      });
    }
  }

  // Stream chat completion
  async *streamChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): AsyncIterable<{ content: string; done: boolean; usage?: ChatResponse['usage'] }> {
    const model = options.model || this.config.openai.defaultModel;
    const modelInfo = this.getModelInfo(model);
    
    if (!modelInfo || !modelInfo.supportsStreaming) {
      throw new CustomServiceError({
        type: ServiceErrorType.VALIDATION,
        service: 'ai',
        operation: 'streamChatCompletion',
        message: `Model ${model} does not support streaming`,
        retryable: false,
        metadata: { model },
      });
    }

    try {
      if (modelInfo.provider === 'openai') {
        yield* this.streamOpenAIChat(messages, options, modelInfo);
      } else if (modelInfo.provider === 'anthropic') {
        yield* this.streamAnthropicChat(messages, options, modelInfo);
      } else {
        throw new Error(`Streaming not supported for provider: ${modelInfo.provider}`);
      }
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.AI_SERVICE,
        service: 'ai',
        operation: 'streamChatCompletion',
        message: `Streaming chat completion failed: ${getErrorMessage(error)}`,
        retryable: this.isRetryableError(error),
        originalError: error as Error,
        metadata: { model, provider: modelInfo.provider },
      });
    }
  }

  private async *streamOpenAIChat(
    messages: ChatMessage[],
    options: ChatCompletionOptions,
    modelInfo: ModelInfo
  ): AsyncIterable<{ content: string; done: boolean; usage?: ChatResponse['usage'] }> {
    const systemPrompt = options.systemPrompt;
    const chatMessages = systemPrompt 
      ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
      : messages;

    const stream = await this.openai.chat.completions.create({
      model: modelInfo.id,
      messages: chatMessages,
      max_tokens: Math.min(options.maxTokens || modelInfo.maxTokens, modelInfo.maxTokens),
      temperature: options.temperature ?? 0.7,
      stream: true,
      tools: options.tools,
      tool_choice: options.toolChoice,
    });

    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      if (!choice) continue;

      const content = choice.delta.content || '';
      const done = choice.finish_reason !== null;
      
      if (done && chunk.usage) {
        yield {
          content,
          done: true,
          usage: {
            promptTokens: chunk.usage.prompt_tokens || 0,
            completionTokens: chunk.usage.completion_tokens || 0,
            totalTokens: chunk.usage.total_tokens || 0,
          },
        };
      } else {
        yield { content, done: false };
      }
    }
  }

  private async *streamAnthropicChat(
    messages: ChatMessage[],
    options: ChatCompletionOptions,
    modelInfo: ModelInfo
  ): AsyncIterable<{ content: string; done: boolean; usage?: ChatResponse['usage'] }> {
    const systemPrompt = options.systemPrompt || '';
    const userMessages = messages.filter(m => m.role !== 'system');

    const stream = await this.anthropic.messages.create({
      model: modelInfo.id,
      system: systemPrompt,
      messages: userMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      max_tokens: Math.min(options.maxTokens || modelInfo.maxTokens, modelInfo.maxTokens),
      temperature: options.temperature ?? 0.7,
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield { content: event.delta.text, done: false };
      } else if (event.type === 'message_stop') {
        // Note: Anthropic doesn't provide usage in streaming mode
        yield { content: '', done: true };
      }
    }
  }

  // Health check
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    // Test OpenAI
    try {
      await this.openai.models.list();
      results.openai = true;
    } catch {
      results.openai = false;
    }

    // Test Anthropic
    try {
      await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      });
      results.anthropic = true;
    } catch {
      results.anthropic = false;
    }

    // Test Hugging Face - simple model list
    try {
      await this.huggingface.textGeneration({
        model: 'gpt2',
        inputs: 'test',
        parameters: { max_new_tokens: 1 },
      });
      results.huggingface = true;
    } catch {
      results.huggingface = false;
    }

    return results;
  }

  // Get usage statistics
  getUsageStats(): Record<string, { tokens: number; requests: number; cost: number }> {
    return Object.fromEntries(this.usageTracking.entries());
  }

  // Reset usage statistics
  resetUsageStats(): void {
    this.usageTracking.clear();
  }

  // Utility methods
  private trackUsage(model: string, tokens: number, requests: number, cost: number): void {
    const current = this.usageTracking.get(model) || { tokens: 0, requests: 0, cost: 0 };
    this.usageTracking.set(model, {
      tokens: current.tokens + tokens,
      requests: current.requests + requests,
      cost: current.cost + cost,
    });
  }

  private calculateCost(modelInfo: ModelInfo, usage: { promptTokens: number; completionTokens: number }): number {
    const inputCost = (usage.promptTokens / 1000) * modelInfo.costPer1kTokens.input;
    const outputCost = (usage.completionTokens / 1000) * modelInfo.costPer1kTokens.output;
    return inputCost + outputCost;
  }

  private isRetryableError(error: any): boolean {
    if (error.status || error.statusCode) {
      const status = error.status || error.statusCode;
      return [408, 429, 500, 502, 503, 504].includes(status);
    }
    
    const message = error.message?.toLowerCase() || '';
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('rate limit') ||
      message.includes('service unavailable')
    );
  }

  private formatMessagesForHuggingFace(messages: ChatMessage[], systemPrompt?: string): string {
    let prompt = systemPrompt ? `${systemPrompt}\n\n` : '';
    
    for (const message of messages) {
      if (message.role === 'user') {
        prompt += `Human: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    }
    
    prompt += 'Assistant:';
    return prompt;
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

// Create wrapped methods with error handling and retry logic
const rawAIService = new AIService();

export const aiService = {
  getAvailableModels: rawAIService.getAvailableModels.bind(rawAIService),
  getModelInfo: rawAIService.getModelInfo.bind(rawAIService),
  chatCompletion: withErrorHandling('ai', 'chatCompletion', rawAIService.chatCompletion.bind(rawAIService), {
    maxAttempts: 3,
    baseDelay: 1000,
  }),
  generateEmbeddings: withErrorHandling('ai', 'generateEmbeddings', rawAIService.generateEmbeddings.bind(rawAIService), {
    maxAttempts: 3,
    baseDelay: 1000,
  }),
  streamChatCompletion: rawAIService.streamChatCompletion.bind(rawAIService), // Streaming can't be easily wrapped
  healthCheck: withErrorHandling('ai', 'healthCheck', rawAIService.healthCheck.bind(rawAIService), { maxAttempts: 1 }),
  getUsageStats: rawAIService.getUsageStats.bind(rawAIService),
  resetUsageStats: rawAIService.resetUsageStats.bind(rawAIService),
};

export { AIService, MODELS };
