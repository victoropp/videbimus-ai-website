import { HfInference } from '@huggingface/inference';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { CohereClient } from 'cohere-ai';
import Replicate from 'replicate';
import { dynamicConfig } from './dynamic-config';

// AI Provider Factory with dynamic configuration
export class AIProviderFactory {
  private static instances: Map<string, any> = new Map();

  // Get or create Hugging Face client
  static getHuggingFaceClient(): HfInference | null {
    const config = dynamicConfig.getProviderConfig('huggingface');
    if (!config?.enabled) return null;

    const key = `huggingface-${config.apiKey}`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new HfInference(config.apiKey));
    }
    return this.instances.get(key);
  }

  // Get or create OpenAI client
  static getOpenAIClient(): OpenAI | null {
    const config = dynamicConfig.getProviderConfig('openai');
    if (!config?.enabled) return null;

    const key = `openai-${config.apiKey}`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new OpenAI({
        apiKey: config.apiKey,
        organization: 'organization' in config ? config.organization : undefined,
      }));
    }
    return this.instances.get(key);
  }

  // Get or create Anthropic client
  static getAnthropicClient(): Anthropic | null {
    const config = dynamicConfig.getProviderConfig('anthropic');
    if (!config?.enabled) return null;

    const key = `anthropic-${config.apiKey}`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new Anthropic({
        apiKey: config.apiKey,
      }));
    }
    return this.instances.get(key);
  }

  // Get or create Google Generative AI client
  static getGoogleClient(): GoogleGenerativeAI | null {
    const config = dynamicConfig.getProviderConfig('google');
    if (!config?.enabled) return null;

    const key = `google-${config.apiKey}`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new GoogleGenerativeAI(config.apiKey));
    }
    return this.instances.get(key);
  }

  // Get or create Groq client
  static getGroqClient(): Groq | null {
    const config = dynamicConfig.getProviderConfig('groq');
    if (!config?.enabled) return null;

    const key = `groq-${config.apiKey}`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new Groq({
        apiKey: config.apiKey,
      }));
    }
    return this.instances.get(key);
  }

  // Get or create Cohere client
  static getCohereClient(): CohereClient | null {
    const config = dynamicConfig.getProviderConfig('cohere');
    if (!config?.enabled) return null;

    const key = `cohere-${config.apiKey}`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new CohereClient({
        token: config.apiKey,
      }));
    }
    return this.instances.get(key);
  }

  // Get or create Replicate client
  static getReplicateClient(): Replicate | null {
    const config = dynamicConfig.getProviderConfig('replicate');
    if (!config?.enabled) return null;

    const key = `replicate-${config.apiKey}`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new Replicate({
        auth: config.apiKey,
      }));
    }
    return this.instances.get(key);
  }

  // Get Together AI configuration (using OpenAI-compatible API)
  static getTogetherClient(): OpenAI | null {
    const config = dynamicConfig.getProviderConfig('together');
    if (!config?.enabled) return null;

    const key = `together-${config.apiKey}`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new OpenAI({
        apiKey: config.apiKey,
        baseURL: 'https://api.together.xyz/v1',
      }));
    }
    return this.instances.get(key);
  }

  // Clear all cached instances (useful when config changes)
  static clearCache(): void {
    this.instances.clear();
  }

  // Get client by provider name
  static getClient(provider: string): any {
    switch (provider.toLowerCase()) {
      case 'huggingface':
        return this.getHuggingFaceClient();
      case 'openai':
        return this.getOpenAIClient();
      case 'anthropic':
        return this.getAnthropicClient();
      case 'google':
        return this.getGoogleClient();
      case 'groq':
        return this.getGroqClient();
      case 'cohere':
        return this.getCohereClient();
      case 'replicate':
        return this.getReplicateClient();
      case 'together':
        return this.getTogetherClient();
      default:
        return null;
    }
  }

  // Test all configured providers
  static async testAllProviders(): Promise<Record<string, { success: boolean; error?: string }>> {
    const results: Record<string, { success: boolean; error?: string }> = {};
    const enabledProviders = dynamicConfig.getEnabledProviders();

    for (const provider of enabledProviders) {
      try {
        const client = this.getClient(provider.name);
        if (client) {
          // Basic connectivity test for each provider
          switch (provider.name) {
            case 'huggingface':
              await (client as HfInference).textGeneration({
                model: 'gpt2',
                inputs: 'test',
                parameters: { max_new_tokens: 1 },
              });
              break;
            case 'openai':
              await (client as OpenAI).models.list();
              break;
            case 'anthropic':
              // Anthropic doesn't have a simple list endpoint, so we'll just check the client exists
              if (client) {
                results[provider.name] = { success: true };
                continue;
              }
              break;
            case 'google':
              const model = (client as GoogleGenerativeAI).getGenerativeModel({ model: 'gemini-pro' });
              await model.generateContent('test');
              break;
            case 'groq':
              await (client as Groq).models.list();
              break;
            case 'cohere':
              await (client as CohereClient).generate({
                prompt: 'test',
                maxTokens: 1,
              });
              break;
            case 'replicate':
              // Replicate doesn't have a simple test endpoint
              if (client) {
                results[provider.name] = { success: true };
                continue;
              }
              break;
            case 'together':
              await (client as OpenAI).models.list();
              break;
          }
          results[provider.name] = { success: true };
        } else {
          results[provider.name] = { success: false, error: 'Client not configured' };
        }
      } catch (error) {
        results[provider.name] = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }

    return results;
  }
}

// Export convenience functions
export const getHuggingFaceClient = () => AIProviderFactory.getHuggingFaceClient();
export const getOpenAIClient = () => AIProviderFactory.getOpenAIClient();
export const getAnthropicClient = () => AIProviderFactory.getAnthropicClient();
export const getGoogleClient = () => AIProviderFactory.getGoogleClient();
export const getGroqClient = () => AIProviderFactory.getGroqClient();
export const getCohereClient = () => AIProviderFactory.getCohereClient();
export const getReplicateClient = () => AIProviderFactory.getReplicateClient();
export const getTogetherClient = () => AIProviderFactory.getTogetherClient();
export const testAllProviders = () => AIProviderFactory.testAllProviders();