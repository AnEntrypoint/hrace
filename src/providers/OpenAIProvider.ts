import OpenAI from 'openai';
import { Logger } from '../utils/Logger';
import { AgentConfig } from '../types/config';
import { ReasoningResult } from '../types/context';

export class OpenAIProvider {
  private client: OpenAI;
  private logger: Logger;
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.logger = new Logger('hermes:openai');

    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      baseURL: config.baseURL,
      timeout: config.timeout || 30000
    });
  }

  async reasoning(params: {
    prompt: string;
    skills?: any[];
    history?: any[];
    temperature?: number;
  }): Promise<ReasoningResult> {
    this.logger.debug('Reasoning about prompt');

    const skillDescriptions = (params.skills || [])
      .map(s => `- ${s.name}: ${s.description}`)
      .join('\n');

    const systemPrompt = `You are Hermes, an intelligent AI agent. You have access to the following skills:
${skillDescriptions}

Analyze the user's request and determine which skill to use, or if you should respond directly.
Respond in JSON format: { "skill": "skill_name" | null, "args": {...}, "confidence": 0-1, "explanation": "..." }`;

    const messages: OpenAI.Messages.MessageParam[] = [];

    // Add history context
    if (params.history && params.history.length > 0) {
      for (const item of params.history) {
        messages.push({
          role: 'user',
          content: item.content || ''
        });
      }
    }

    messages.push({
      role: 'user',
      content: params.prompt
    });

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 1024,
        temperature: params.temperature || 0.7,
        system: systemPrompt,
        messages
      });

      const content = response.content[0];
      if (content.type === 'text') {
        try {
          return JSON.parse(content.text);
        } catch (e) {
          this.logger.warn('Failed to parse reasoning response as JSON', { text: content.text });
          return { skill: null, confidence: 0.5 };
        }
      }

      return { skill: null, confidence: 0.5 };
    } catch (error) {
      this.logger.error('Error in reasoning call', error);
      throw error;
    }
  }

  async complete(params: {
    prompt: string;
    context?: any;
    maxTokens?: number;
  }): Promise<string> {
    this.logger.debug('Generating completion');

    const messages: OpenAI.Messages.MessageParam[] = [
      {
        role: 'user',
        content: params.prompt
      }
    ];

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: params.maxTokens || this.config.maxTokens,
        temperature: this.config.temperature,
        messages
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      return '';
    } catch (error) {
      this.logger.error('Error in completion call', error);
      throw error;
    }
  }

  async chat(messages: any[], params?: Partial<AgentConfig>): Promise<string> {
    this.logger.debug('Chat with', messages.length, 'messages');

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: params?.maxTokens || this.config.maxTokens,
        temperature: params?.temperature !== undefined ? params.temperature : this.config.temperature,
        messages
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      return '';
    } catch (error) {
      this.logger.error('Error in chat call', error);
      throw error;
    }
  }
}
