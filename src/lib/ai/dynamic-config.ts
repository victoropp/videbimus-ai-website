import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { config as dotenv } from 'dotenv';

// Dynamic AI Configuration with runtime reloading
export class DynamicAIConfig {
  private static instance: DynamicAIConfig;
  private config: Record<string, any> = {};
  private envPath: string;
  private lastModified: number = 0;
  private watchInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.envPath = path.resolve(process.cwd(), '.env.local');
    this.loadConfig();
    this.startWatching();
  }

  static getInstance(): DynamicAIConfig {
    if (!DynamicAIConfig.instance) {
      DynamicAIConfig.instance = new DynamicAIConfig();
    }
    return DynamicAIConfig.instance;
  }

  private loadConfig(): void {
    try {
      // Check if file exists
      if (!fs.existsSync(this.envPath)) {
        console.warn('No .env.local file found, using process.env');
        this.config = { ...process.env };
        return;
      }

      // Get file stats
      const stats = fs.statSync(this.envPath);
      const currentModified = stats.mtimeMs;

      // Only reload if file has changed
      if (currentModified <= this.lastModified) {
        return;
      }

      // Parse .env.local file
      const envContent = fs.readFileSync(this.envPath, 'utf-8');
      const parsed = dotenv({ path: this.envPath }).parsed || {};
      
      // Merge with existing process.env
      this.config = {
        ...process.env,
        ...parsed,
      };

      this.lastModified = currentModified;
      console.log('Environment configuration reloaded');
    } catch (error) {
      console.error('Error loading environment config:', error);
    }
  }

  private startWatching(): void {
    // Check for changes every 5 seconds
    this.watchInterval = setInterval(() => {
      this.loadConfig();
    }, 5000);
  }

  stopWatching(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
  }

  get(key: string): string | undefined {
    // Always check for updates before returning
    this.loadConfig();
    return this.config[key];
  }

  getAll(): Record<string, any> {
    this.loadConfig();
    return { ...this.config };
  }

  // AI Provider Configurations
  getAIProviderConfig() {
    this.loadConfig();
    
    return {
      // OpenAI
      openai: {
        apiKey: this.config.OPENAI_API_KEY,
        organization: this.config.OPENAI_ORG_ID,
        models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini'],
        enabled: !!this.config.OPENAI_API_KEY && this.config.OPENAI_API_KEY !== 'sk-your-openai-api-key',
      },
      
      // Anthropic
      anthropic: {
        apiKey: this.config.ANTHROPIC_API_KEY,
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022'],
        enabled: !!this.config.ANTHROPIC_API_KEY && this.config.ANTHROPIC_API_KEY !== 'sk-ant-your-anthropic-api-key',
      },
      
      // Hugging Face (with new token)
      huggingface: {
        apiKey: this.config.NEXT_PUBLIC_HUGGINGFACE_API_KEY || this.config.HUGGINGFACE_API_KEY,
        models: [
          'microsoft/DialoGPT-medium',
          'facebook/blenderbot-400M-distill',
          'mistralai/Mistral-7B-Instruct-v0.2',
          'google/flan-t5-xxl',
          'HuggingFaceH4/zephyr-7b-beta',
          'tiiuae/falcon-7b-instruct',
          'meta-llama/Llama-2-7b-chat-hf',
          'google/gemma-7b',
          'bigscience/bloom',
          'EleutherAI/gpt-j-6b',
          'stabilityai/stablelm-tuned-alpha-7b',
          'databricks/dolly-v2-12b',
          'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
          'Qwen/Qwen2.5-72B-Instruct',
        ],
        enabled: !!this.config.NEXT_PUBLIC_HUGGINGFACE_API_KEY || !!this.config.HUGGINGFACE_API_KEY,
      },
      
      // Groq
      groq: {
        apiKey: this.config.GROQ_API_KEY,
        models: ['mixtral-8x7b-32768', 'llama2-70b-4096', 'gemma-7b-it'],
        enabled: !!this.config.GROQ_API_KEY && this.config.GROQ_API_KEY !== 'gsk_your-groq-api-key',
      },
      
      // Cohere
      cohere: {
        apiKey: this.config.COHERE_API_KEY,
        models: ['command', 'command-nightly', 'command-light'],
        enabled: !!this.config.COHERE_API_KEY && this.config.COHERE_API_KEY !== 'your-cohere-api-key',
      },
      
      // Google Generative AI
      google: {
        apiKey: this.config.GOOGLE_API_KEY,
        models: ['gemini-pro', 'gemini-pro-vision', 'gemini-1.5-pro', 'gemini-1.5-flash'],
        enabled: !!this.config.GOOGLE_API_KEY && this.config.GOOGLE_API_KEY !== 'your-google-api-key',
      },
      
      // Together AI
      together: {
        apiKey: this.config.TOGETHER_API_KEY,
        models: [
          'mistralai/Mixtral-8x7B-Instruct-v0.1',
          'meta-llama/Llama-2-70b-chat-hf',
          'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
          'teknium/OpenHermes-2.5-Mistral-7B',
          'togethercomputer/llama-2-7b-chat',
        ],
        enabled: !!this.config.TOGETHER_API_KEY && this.config.TOGETHER_API_KEY !== 'your-together-api-key',
      },
      
      // Replicate
      replicate: {
        apiKey: this.config.REPLICATE_API_KEY,
        models: ['llama2-70b', 'llama2-13b', 'mistral-7b', 'mixtral-8x7b', 'codellama-70b'],
        enabled: !!this.config.REPLICATE_API_KEY && this.config.REPLICATE_API_KEY !== 'your-replicate-api-key',
      },
    };
  }

  // Get enabled providers
  getEnabledProviders() {
    const providers = this.getAIProviderConfig();
    return Object.entries(providers)
      .filter(([_, config]) => config.enabled)
      .map(([name, config]) => ({
        name,
        ...config,
      }));
  }

  // Get all available models across enabled providers
  getAvailableModels() {
    const providers = this.getAIProviderConfig();
    const models: Array<{ provider: string; model: string; enabled: boolean }> = [];
    
    Object.entries(providers).forEach(([provider, config]) => {
      if (config.models) {
        config.models.forEach((model: string) => {
          models.push({
            provider,
            model,
            enabled: config.enabled,
          });
        });
      }
    });
    
    return models;
  }

  // Validate a specific API key
  validateApiKey(provider: string): boolean {
    const providers = this.getAIProviderConfig();
    const providerConfig = providers[provider as keyof typeof providers];
    return providerConfig?.enabled || false;
  }

  // Get configuration for a specific provider
  getProviderConfig(provider: string) {
    const providers = this.getAIProviderConfig();
    return providers[provider as keyof typeof providers];
  }

  // Update configuration (for testing purposes)
  updateConfig(key: string, value: string): void {
    this.config[key] = value;
    // Note: This doesn't persist to .env.local file
    console.log(`Updated ${key} in runtime configuration`);
  }
}

// Export singleton instance
export const dynamicConfig = DynamicAIConfig.getInstance();

// Helper functions
export const getAIConfig = () => dynamicConfig.getAIProviderConfig();
export const getEnabledProviders = () => dynamicConfig.getEnabledProviders();
export const getAvailableModels = () => dynamicConfig.getAvailableModels();
export const validateApiKey = (provider: string) => dynamicConfig.validateApiKey(provider);
export const getProviderConfig = (provider: string) => dynamicConfig.getProviderConfig(provider);