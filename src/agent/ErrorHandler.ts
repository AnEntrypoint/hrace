import { Logger } from '../utils/Logger';

export interface ErrorContext {
  error: Error;
  timestamp: number;
  context?: Record<string, any>;
  stackTrace?: string;
}

export interface RecoveryStrategy {
  name: string;
  priority: number;
  condition: (error: Error) => boolean;
  recovery: (error: Error) => Promise<any>;
}

export class ErrorHandler {
  private logger: Logger;
  private strategies: RecoveryStrategy[] = [];
  private errorHistory: ErrorContext[] = [];

  constructor() {
    this.logger = new Logger('hermes:errors');
    this.setupDefaultStrategies();
  }

  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  async handle(error: Error, context?: Record<string, any>): Promise<any> {
    const errorCtx: ErrorContext = {
      error,
      timestamp: Date.now(),
      context,
      stackTrace: error.stack
    };

    this.errorHistory.push(errorCtx);
    this.logger.error('Error occurred:', { message: error.message, context });

    // Try to find and apply a recovery strategy
    for (const strategy of this.strategies) {
      if (strategy.condition(error)) {
        try {
          this.logger.info('Applying recovery strategy:', strategy.name);
          const result = await strategy.recovery(error);
          return result;
        } catch (recoveryError) {
          this.logger.warn('Recovery strategy failed:', strategy.name, recoveryError);
        }
      }
    }

    // If no strategy worked, re-throw
    throw error;
  }

  getErrorHistory(limit = 10): ErrorContext[] {
    return this.errorHistory.slice(-limit);
  }

  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  private setupDefaultStrategies(): void {
    // Timeout recovery
    this.registerStrategy({
      name: 'timeout-recovery',
      priority: 100,
      condition: (e) => e.message.includes('timeout') || e.message.includes('TIMEOUT'),
      recovery: async (e) => {
        this.logger.info('Timeout detected, retrying with extended timeout');
        return { retryable: true, suggestion: 'Retry with longer timeout' };
      }
    });

    // Rate limit recovery
    this.registerStrategy({
      name: 'rate-limit-recovery',
      priority: 95,
      condition: (e) => e.message.includes('429') || e.message.includes('rate limit'),
      recovery: async (e) => {
        const delay = Math.random() * 5000 + 1000; // 1-6s exponential backoff
        this.logger.info(`Rate limited, waiting ${delay}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return { retryable: true, delay };
      }
    });

    // Connection recovery
    this.registerStrategy({
      name: 'connection-recovery',
      priority: 90,
      condition: (e) => e.message.includes('ECONNREFUSED') || e.message.includes('connection'),
      recovery: async (e) => {
        this.logger.info('Connection error, will retry');
        return { retryable: true, suggestion: 'Check network connection and retry' };
      }
    });

    // Memory recovery
    this.registerStrategy({
      name: 'memory-recovery',
      priority: 85,
      condition: (e) => e.message.includes('OutOfMemory') || e.message.includes('heap'),
      recovery: async (e) => {
        if (global.gc) {
          this.logger.info('Running garbage collection');
          global.gc();
        }
        return { retryable: true, suggestion: 'Garbage collection triggered' };
      }
    });
  }
}
