export interface AgentConfig {
  model: string;
  provider: 'openai' | 'anthropic' | 'mistral' | 'groq';
  maxTokens: number;
  temperature: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  apiKey?: string;
  baseURL?: string;
  timeout?: number;
  retryPolicy?: RetryPolicy;
}

export interface RetryPolicy {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface ToolConfig {
  name: string;
  description: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface GatewayConfig {
  host: string;
  port: number;
  ssl: boolean;
  auth?: {
    type: 'apikey' | 'oauth' | 'jwt';
    token?: string;
  };
}

export interface StorageConfig {
  type: 'memory' | 'sqlite' | 'postgresql';
  path?: string;
  connectionString?: string;
}
