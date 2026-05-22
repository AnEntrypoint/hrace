import { Skill } from '../skills/Skill';
import { MemoryManager } from '../agent/MemoryManager';

export interface ExecutionContext {
  command: string;
  timestamp: number;
  skills: Skill[];
  memory: MemoryManager;
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ToolResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime: number;
}

export interface ReasoningResult {
  skill?: string;
  args?: Record<string, any>;
  confidence: number;
  explanation?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}
