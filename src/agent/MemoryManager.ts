import { Logger } from '../utils/Logger';

export interface Memory {
  id: string;
  content: string;
  timestamp: number;
  type: 'conversation' | 'skill' | 'knowledge' | 'execution';
  metadata?: Record<string, any>;
}

export class MemoryManager {
  private logger: Logger;
  private memories: Map<string, Memory> = new Map();
  private maxMemories = 10000;

  constructor() {
    this.logger = new Logger('hermes:memory');
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing memory manager');
    // TODO: Load from persistent storage
  }

  async addMemory(memory: Omit<Memory, 'id' | 'timestamp'>): Promise<Memory> {
    const fullMemory: Memory = {
      ...memory,
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    this.memories.set(fullMemory.id, fullMemory);

    // Evict old memories if needed
    if (this.memories.size > this.maxMemories) {
      this.evictOldestMemories();
    }

    return fullMemory;
  }

  async getRelevantHistory(query: string, limit = 10): Promise<Memory[]> {
    // TODO: Implement semantic similarity search
    // For now, return recent memories of the same type
    const memories = Array.from(this.memories.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    return memories;
  }

  private evictOldestMemories(count = 1000): void {
    const sorted = Array.from(this.memories.values())
      .sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 0; i < count && i < sorted.length; i++) {
      this.memories.delete(sorted[i].id);
    }

    this.logger.info(`Evicted ${count} oldest memories. Total memories: ${this.memories.size}`);
  }

  async clearMemories(): Promise<void> {
    this.memories.clear();
    this.logger.info('All memories cleared');
  }

  getMemoryStats(): { total: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    for (const memory of this.memories.values()) {
      byType[memory.type] = (byType[memory.type] || 0) + 1;
    }
    return { total: this.memories.size, byType };
  }
}
