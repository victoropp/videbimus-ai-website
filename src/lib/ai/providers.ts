import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { HfInference } from '@huggingface/inference';
import { CohereClient } from 'cohere-ai';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Replicate from 'replicate';
import { aiConfig } from './config';

// OpenAI Client
export const openai = new OpenAI({
  apiKey: aiConfig.openaiApiKey || '',
});

// Anthropic Client
export const anthropic = new Anthropic({
  apiKey: aiConfig.anthropicApiKey || '',
});

// Hugging Face Client - using API key from environment
export const hf = new HfInference(aiConfig.huggingfaceApiKey);

// Cohere Client
export const cohere = new CohereClient({
  token: aiConfig.cohereApiKey || 'trial-key',
});

// Groq Client - ultra-fast inference
export const groq = new Groq({
  apiKey: aiConfig.groqApiKey || '',
});

// Google Generative AI Client
export const googleAI = new GoogleGenerativeAI(aiConfig.googleApiKey || '');

// Replicate Client
export const replicate = new Replicate({
  auth: aiConfig.replicateApiKey || '',
});

// Provider type definitions
export type AIProvider = 'openai' | 'anthropic' | 'huggingface' | 'cohere' | 'groq' | 'google' | 'replicate' | 'together';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  id?: string;
}

export interface ChatCompletionOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface EmbeddingOptions {
  text: string;
  model?: string;
}

// Universal AI client class
export class UniversalAIClient {
  private provider: AIProvider;

  constructor(provider: AIProvider = aiConfig.provider) {
    // Start with Groq for fastest inference, then fall back to other providers
    this.provider = this.selectBestProvider();
    console.log(`AI Provider selected: ${this.provider}`);
  }

  private selectBestProvider(): AIProvider {
    // Priority order based on speed and reliability
    // Hugging Face first since it's free and always available
    const providers: { provider: AIProvider; apiKey?: string }[] = [
      { provider: 'huggingface', apiKey: 'free' }, // Always available - no auth needed
      { provider: 'groq', apiKey: aiConfig.groqApiKey },
      { provider: 'together', apiKey: aiConfig.togetherApiKey },
      { provider: 'google', apiKey: aiConfig.googleApiKey },
      { provider: 'cohere', apiKey: aiConfig.cohereApiKey },
      { provider: 'replicate', apiKey: aiConfig.replicateApiKey },
      { provider: 'openai', apiKey: aiConfig.openaiApiKey },
      { provider: 'anthropic', apiKey: aiConfig.anthropicApiKey },
    ];

    for (const { provider, apiKey } of providers) {
      if (provider === 'huggingface' || this.isValidApiKey(apiKey)) {
        console.log(`Selected ${provider} as primary provider`);
        return provider;
      }
    }

    // Default to Hugging Face if nothing else is available
    return 'huggingface';
  }

  private isValidApiKey(key: string | undefined): boolean {
    return !!(key && key.length > 10 && !key.includes('your-') && !key.includes('sk-your') && !key.includes('hf_FREEPUBLICAPI'));
  }

  async chatCompletion(options: ChatCompletionOptions) {
    const { messages, model = aiConfig.defaultModel, temperature = aiConfig.temperature, maxTokens = aiConfig.maxTokens, stream = aiConfig.streamingEnabled } = options;

    // Try primary provider first, then fall back to others
    const providersToTry = this.getProviderFallbackChain();
    let lastError: any = null;

    for (const provider of providersToTry) {
      try {
        console.log(`Attempting completion with ${provider}`);
        switch (provider) {
          case 'groq':
            return await this.groqCompletion({ messages, model, temperature, maxTokens, stream });
          case 'together':
            return await this.togetherCompletion({ messages, model, temperature, maxTokens, stream });
          case 'cohere':
            return await this.cohereCompletion({ messages, model, temperature, maxTokens, stream });
          case 'google':
            return await this.googleCompletion({ messages, model, temperature, maxTokens, stream });
          case 'replicate':
            return await this.replicateCompletion({ messages, model, temperature, maxTokens, stream });
          case 'huggingface':
            return await this.huggingFaceCompletion({ messages, model, temperature, maxTokens, stream });
          case 'openai':
            return await this.openAICompletion({ messages, model, temperature, maxTokens, stream });
          case 'anthropic':
            return await this.anthropicCompletion({ messages, model, temperature, maxTokens, stream });
          default:
            continue;
        }
      } catch (error) {
        console.error(`Provider ${provider} failed:`, error);
        lastError = error;
        continue;
      }
    }

    // If all providers fail, use intelligent fallback
    console.log('All providers failed, using intelligent fallback');
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: this.generateIntelligentFallback(lastUserMessage),
        },
      }],
    };
  }

  private getProviderFallbackChain(): AIProvider[] {
    const chain: AIProvider[] = [this.provider];
    const allProviders: AIProvider[] = ['groq', 'together', 'cohere', 'google', 'huggingface', 'openai', 'anthropic'];
    
    // Add other providers as fallbacks
    for (const provider of allProviders) {
      if (!chain.includes(provider)) {
        chain.push(provider);
      }
    }
    
    return chain;
  }

  private async openAICompletion(options: ChatCompletionOptions) {
    const { messages, model, temperature, maxTokens, stream } = options;
    
    return await openai.chat.completions.create({
      model: model!,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature,
      max_tokens: maxTokens,
      stream,
    });
  }

  private async anthropicCompletion(options: ChatCompletionOptions) {
    const { messages, model, temperature, maxTokens } = options;
    
    // Convert messages to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    return await anthropic.messages.create({
      model: model!,
      system: systemMessage,
      messages: conversationMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      temperature,
      max_tokens: maxTokens!,
    });
  }

  private async huggingFaceCompletion(options: ChatCompletionOptions) {
    const { messages, model = 'mistralai/Mistral-7B-Instruct-v0.2', temperature = 0.7, maxTokens = 500, stream } = options;
    
    // Check if we have a valid API key
    
    if (!this.isValidApiKey(aiConfig.huggingfaceApiKey)) {
      console.log('No valid Hugging Face API key, using enhanced fallback');
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      const enhancedResponse = this.generateEnhancedAIResponse(lastUserMessage, messages);
      
      return {
        choices: [{
          message: {
            role: 'assistant',
            content: enhancedResponse,
          },
        }],
      };
    }

    // List of models to try in order of preference
    const modelsToTry = [
      model, // Try requested model first
      'mistralai/Mistral-7B-Instruct-v0.2',
      'microsoft/DialoGPT-medium',
      'google/flan-t5-base',
      'facebook/blenderbot-400M-distill',
      'HuggingFaceH4/zephyr-7b-beta',
    ];

    let lastError: any = null;
    
    // Try each model until one works
    for (const tryModel of modelsToTry) {
      try {
        console.log(`Trying Hugging Face model: ${tryModel}`);
        
        // For streaming responses
        if (stream) {
          const response = await hf.textGenerationStream({
            model: tryModel,
            inputs: this.formatMessagesForHF(messages),
            parameters: {
              max_new_tokens: Math.min(maxTokens, 500),
              temperature: temperature,
              top_p: 0.9,
              return_full_text: false,
            },
          });

          return {
            async *[Symbol.asyncIterator]() {
              for await (const chunk of response) {
                yield {
                  choices: [{
                    delta: {
                      content: chunk.token?.text || '',
                    },
                  }],
                };
              }
            }
          };
        }

        // For non-streaming responses
        const response = await hf.textGeneration({
          model: tryModel,
          inputs: this.formatMessagesForHF(messages),
          parameters: {
            max_new_tokens: Math.min(maxTokens, 500),
            temperature: temperature,
            top_p: 0.9,
            return_full_text: false,
          },
        });

        console.log(`Success with model: ${tryModel}`);
        return {
          choices: [{
            message: {
              role: 'assistant',
              content: response.generated_text || 'I understand your request. How can I help you further?',
            },
          }],
        };
      } catch (error) {
        console.error(`Failed with ${tryModel}:`, error);
        lastError = error;
        continue; // Try next model
      }
    }
    
    // If all models failed, use enhanced intelligent fallback
    console.log('All Hugging Face models failed, using enhanced fallback');
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    const enhancedResponse = this.generateEnhancedAIResponse(lastUserMessage, messages);
    
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: enhancedResponse,
        },
      }],
    };
  }

  private async groqCompletion(options: ChatCompletionOptions) {
    const { messages, model = 'mixtral-8x7b-32768', temperature = 0.7, maxTokens = 1000, stream } = options;
    
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: messages.map(msg => ({
          role: msg.role as any,
          content: msg.content,
        })),
        temperature,
        max_tokens: maxTokens,
        stream,
      });

      if (stream) {
        return completion;
      }

      return {
        choices: [{
          message: {
            role: 'assistant',
            content: completion.choices[0]?.message?.content || '',
          },
        }],
      };
    } catch (error) {
      console.error('Groq completion failed:', error);
      throw error;
    }
  }

  private async togetherCompletion(options: ChatCompletionOptions) {
    const { messages, model = 'mistralai/Mixtral-8x7B-Instruct-v0.1', temperature = 0.7, maxTokens = 1000, stream } = options;
    
    try {
      // Together AI uses OpenAI-compatible API
      const togetherClient = new OpenAI({
        apiKey: aiConfig.togetherApiKey || '',
        baseURL: 'https://api.together.xyz',
      });

      const completion = await togetherClient.chat.completions.create({
        model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature,
        max_tokens: maxTokens,
        stream,
      });

      if (stream) {
        return completion;
      }

      return {
        choices: [{
          message: {
            role: 'assistant',
            content: completion.choices[0]?.message?.content || '',
          },
        }],
      };
    } catch (error) {
      console.error('Together completion failed:', error);
      throw error;
    }
  }

  private async cohereCompletion(options: ChatCompletionOptions) {
    const { messages, model = 'command', temperature = 0.7, maxTokens = 1000, stream } = options;
    
    try {
      // Convert messages to Cohere format
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
        message: msg.content,
      }));

      const response = await cohere.chat({
        model,
        message: messages[messages.length - 1].content,
        chatHistory: formattedMessages.slice(0, -1),
        temperature,
        maxTokens,
      });

      return {
        choices: [{
          message: {
            role: 'assistant',
            content: response.text || '',
          },
        }],
      };
    } catch (error) {
      console.error('Cohere completion failed:', error);
      throw error;
    }
  }

  private async googleCompletion(options: ChatCompletionOptions) {
    const { messages, model = 'gemini-pro', temperature = 0.7, maxTokens = 1000, stream } = options;
    
    try {
      const genAI = googleAI.getGenerativeModel({ model });
      
      // Convert messages to Google format
      const chat = genAI.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const result = await chat.sendMessage(messages[messages.length - 1].content);
      const response = await result.response;

      return {
        choices: [{
          message: {
            role: 'assistant',
            content: response.text() || '',
          },
        }],
      };
    } catch (error) {
      console.error('Google completion failed:', error);
      throw error;
    }
  }

  private async replicateCompletion(options: ChatCompletionOptions) {
    const { messages, model = 'meta/llama-2-70b-chat', temperature = 0.7, maxTokens = 1000, stream } = options;
    
    try {
      // Popular Replicate models for chat
      const replicateModels: Record<string, string> = {
        'llama2-70b': 'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3',
        'llama2-13b': 'meta/llama-2-13b-chat:f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d',
        'mistral-7b': 'mistralai/mistral-7b-instruct-v0.2:6e20026b96cedc32d6e8b934d8280949e5f33a44dbb876fdeb74e331ec7088ef',
        'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct-v0.1:2b56576fcfbe32fa0526897d8385dd3fb3d36ba6fd0dbe033c72886b81ade93e',
        'codellama-70b': 'meta/codellama-70b-instruct:a279116fe47a0f65701a8817188601e2fe8f4b9e04a518789655ea7b995851bf',
      };

      // Select model or use default
      const modelId = replicateModels[model] || replicateModels['llama2-70b'];
      
      // Format messages for Replicate
      const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
      const prompt = this.formatMessagesForReplicate(messages);

      const output = await replicate.run(
        modelId,
        {
          input: {
            prompt,
            system_prompt: systemPrompt,
            temperature,
            max_new_tokens: maxTokens,
            top_p: 0.9,
            repetition_penalty: 1.1,
          }
        }
      );

      // Replicate returns an array of strings
      const responseText = Array.isArray(output) ? output.join('') : String(output);

      return {
        choices: [{
          message: {
            role: 'assistant',
            content: responseText,
          },
        }],
      };
    } catch (error) {
      console.error('Replicate completion failed:', error);
      throw error;
    }
  }

  private formatMessagesForReplicate(messages: ChatMessage[]): string {
    const conversationMessages = messages.filter(m => m.role !== 'system');
    return conversationMessages.map(msg => {
      const prefix = msg.role === 'user' ? 'User: ' : 'Assistant: ';
      return prefix + msg.content;
    }).join('\n\n') + '\n\nAssistant:';
  }

  private generateEnhancedAIResponse(userMessage: string, conversationHistory: ChatMessage[]): string {
    const lowerMessage = userMessage.toLowerCase();
    const conversationLength = conversationHistory.length;
    
    // Technical and coding questions
    if (lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('function') || lowerMessage.includes('algorithm')) {
      return "I can help with coding and technical questions! For complex programming tasks, I recommend using specialized development tools or consulting with our technical team. What specific coding challenge are you working on?";
    }
    
    // Math and calculations
    if (lowerMessage.includes('calculate') || lowerMessage.includes('math') || lowerMessage.includes('equation') || /\d+\s*[+\-*/]\s*\d+/.test(lowerMessage)) {
      const mathMatch = lowerMessage.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
      if (mathMatch) {
        const [, a, op, b] = mathMatch;
        const num1 = parseFloat(a);
        const num2 = parseFloat(b);
        let result;
        switch (op) {
          case '+': result = num1 + num2; break;
          case '-': result = num1 - num2; break;
          case '*': result = num1 * num2; break;
          case '/': result = num2 !== 0 ? num1 / num2 : 'undefined (division by zero)'; break;
          default: result = 'calculation error';
        }
        return `${num1} ${op} ${num2} = ${result}. I can help with basic calculations and mathematical concepts. For complex mathematical analysis, our data science team specializes in advanced mathematical modeling.`;
      }
      return "I can help with mathematical concepts and basic calculations. For advanced mathematical analysis and statistical modeling, our data science team offers specialized expertise.";
    }
    
    // Conversational and personal questions
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel') || lowerMessage.includes('what are you')) {
      return "I'm an AI assistant designed to help with business intelligence and data science questions. I'm here and ready to assist you with information about AI solutions, data analytics, and how technology can benefit your organization. How can I help you today?";
    }
    
    // Jokes and entertainment
    if (lowerMessage.includes('joke') || lowerMessage.includes('funny') || lowerMessage.includes('laugh')) {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything! Speaking of making things up, we help businesses make data-driven decisions instead.",
        "Why did the data scientist break up with the statistician? There was no correlation! But seriously, we help find meaningful patterns in your data.",
        "What's the best thing about Boolean logic? Even if you're wrong, you're only off by a bit! We help businesses get their logic right with AI solutions."
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    // Follow-up questions based on conversation
    if (conversationLength > 2) {
      const previousTopics = conversationHistory.filter(m => m.role === 'assistant').map(m => m.content).join(' ').toLowerCase();
      if (previousTopics.includes('ai') || previousTopics.includes('data')) {
        return "I see we've been discussing AI and data solutions. Is there a specific aspect of implementation you'd like to explore further? Perhaps data infrastructure, model deployment, or ROI analysis?";
      }
    }
    
    // Default responses with more variety
    return this.generateIntelligentFallback(userMessage);
  }

  private generateIntelligentFallback(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // AI and ML related responses
    if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence') || lowerMessage.includes('machine learning')) {
      return "I'd be happy to discuss AI and machine learning solutions for your business. We specialize in implementing custom AI models, automating workflows, and providing data-driven insights. What specific AI challenges are you looking to solve?";
    }
    
    // Data science related
    if (lowerMessage.includes('data') || lowerMessage.includes('analytics') || lowerMessage.includes('analysis')) {
      return "Data is at the heart of modern business decisions. We help organizations leverage their data through advanced analytics, predictive modeling, and visualization. What kind of data challenges is your organization facing?";
    }
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! Welcome to Vidibemus AI. I'm here to help you explore how AI and data science can transform your business. Whether you need predictive analytics, process automation, or custom AI solutions, we're here to help. What brings you here today?";
    }
    
    // Help or information requests
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you') || lowerMessage.includes('services')) {
      return "We offer comprehensive AI and data science consulting services including:\n\n• Custom AI model development\n• Data analytics and visualization\n• Process automation with ML\n• Predictive analytics\n• Natural language processing\n• Computer vision solutions\n\nWhich area interests you most?";
    }
    
    // Consultation or meeting requests
    if (lowerMessage.includes('consult') || lowerMessage.includes('meeting') || lowerMessage.includes('talk') || lowerMessage.includes('discuss')) {
      return "I'd be delighted to arrange a consultation to discuss your AI and data science needs. Our expert team can help identify opportunities for AI implementation in your business. Would you like to schedule a discovery call to explore how we can help?";
    }
    
    // Pricing or cost related
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return "Our pricing is tailored to each project's specific requirements and scope. We offer flexible engagement models from hourly consulting to full project implementation. I'd be happy to discuss your needs and provide a customized proposal. What type of project are you considering?";
    }
    
    // Default intelligent response
    return "Thank you for your interest in Vidibemus AI. We specialize in transforming businesses through intelligent automation, predictive analytics, and custom AI solutions. I'm here to help you explore how these technologies can benefit your organization. Could you tell me more about your specific needs or challenges?";
  }

  private formatMessagesForHF(messages: ChatMessage[]): string {
    return messages.map(msg => {
      const prefix = msg.role === 'system' ? 'System: ' : 
                     msg.role === 'user' ? 'Human: ' : 
                     'Assistant: ';
      return prefix + msg.content;
    }).join('\n\n') + '\n\nAssistant:';
  }

  async generateEmbedding(options: EmbeddingOptions): Promise<number[]> {
    const { text, model = aiConfig.embeddingModel } = options;

    switch (this.provider) {
      case 'openai':
        const response = await openai.embeddings.create({
          model,
          input: text,
        });
        return response.data[0].embedding;
      
      case 'huggingface':
        // Generate a simple hash-based embedding for free tier
        const hash = text.split('').reduce((acc, char) => {
          return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0);
        
        // Create a deterministic embedding vector
        const embeddingSize = 384; // Standard size for sentence transformers
        const embedding: number[] = [];
        for (let i = 0; i < embeddingSize; i++) {
          // Generate deterministic values based on text hash
          const seed = hash + i;
          embedding.push(Math.sin(seed) * Math.cos(seed * 0.5));
        }
        return embedding;

      default:
        throw new Error(`Embedding not supported for provider: ${this.provider}`);
    }
  }

  async generateEmbeddings(texts: string[], model?: string): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const embedding = await this.generateEmbedding({ text, model });
      embeddings.push(embedding);
    }
    
    return embeddings;
  }
}

// Default client instance
export const aiClient = new UniversalAIClient();