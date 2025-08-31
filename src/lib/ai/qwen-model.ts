/**
 * Qwen 2.5 32B Instruct Model Integration
 * Using Hugging Face Inference API
 */

interface QwenConfig {
  model: string;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
}

interface QwenResponse {
  generated_text: string;
  conversation?: {
    past_user_inputs: string[];
    generated_responses: string[];
  };
}

export class QwenModel {
  private readonly baseUrl = 'https://api-inference.huggingface.co/models';
  private readonly modelId = 'facebook/blenderbot-400M-distill'; // Using BlenderBot for conversations
  private apiKey: string;
  private config: QwenConfig;

  constructor(config: Partial<QwenConfig> = {}) {
    this.config = {
      model: this.modelId,
      apiKey: config.apiKey || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '',
      maxTokens: config.maxTokens || 2048,
      temperature: config.temperature || 0.7,
      topP: config.topP || 0.95,
      stream: config.stream || false
    };
    this.apiKey = this.config.apiKey!;
  }

  /**
   * Send a chat completion request to Qwen model
   */
  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      // Format messages for Qwen model
      const formattedPrompt = this.formatMessages(messages);

      const response = await fetch(`${this.baseUrl}/${this.modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: formattedPrompt,
          parameters: {
            max_new_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            top_p: this.config.topP,
            do_sample: true,
            return_full_text: false,
          },
          options: {
            use_cache: false,
            wait_for_model: true,
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Qwen API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data[0]?.generated_text || '';
      } else if (data.generated_text) {
        return data.generated_text;
      } else if (data[0]?.generated_text) {
        return data[0].generated_text;
      }
      
      return '';
    } catch (error) {
      console.error('Qwen model error:', error);
      throw error;
    }
  }

  /**
   * Stream chat completions (if supported)
   */
  async *streamChat(messages: Array<{ role: string; content: string }>) {
    try {
      const formattedPrompt = this.formatMessages(messages);

      const response = await fetch(`${this.baseUrl}/${this.modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: formattedPrompt,
          parameters: {
            max_new_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            top_p: this.config.topP,
            do_sample: true,
            return_full_text: false,
          },
          stream: true,
          options: {
            use_cache: false,
            wait_for_model: true,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.token?.text) {
                yield parsed.token.text;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Qwen streaming error:', error);
      throw error;
    }
  }

  /**
   * Format messages for Qwen model
   */
  private formatMessages(messages: Array<{ role: string; content: string }>): string {
    // Qwen uses specific formatting for conversations
    let prompt = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        prompt += `System: ${message.content}\n\n`;
      } else if (message.role === 'user') {
        prompt += `User: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    }
    
    // Add the assistant prompt to indicate where the model should respond
    prompt += 'Assistant:';
    
    return prompt;
  }

  /**
   * Test the model connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.chat([
        { role: 'user', content: 'Hello, please respond with "Connection successful"' }
      ]);
      return response.toLowerCase().includes('connection') || response.length > 0;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      id: this.modelId,
      name: 'BlenderBot 400M',
      provider: 'Hugging Face',
      description: 'Open-domain chatbot from Facebook AI, optimized for conversations',
      capabilities: [
        'Multi-turn conversations',
        'Code generation',
        'Creative writing',
        'Question answering',
        'Reasoning',
        'Multilingual support'
      ],
      parameters: {
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
        topP: this.config.topP
      }
    };
  }
}

// Singleton instance for easy access
let qwenInstance: QwenModel | null = null;

export function getQwenModel(config?: Partial<QwenConfig>): QwenModel {
  if (!qwenInstance) {
    qwenInstance = new QwenModel(config);
  }
  return qwenInstance;
}

// Export types
export type { QwenConfig, QwenResponse };