import { Logger } from '../utils/Logger';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { SkillManager } from '../skills/SkillManager';
import { MemoryManager } from './MemoryManager';
import { ExecutionContext } from '../types/context';
import { AgentConfig } from '../types/config';

export class HermesAgent {
  private logger: Logger;
  private config: AgentConfig;
  private provider: any;
  private skillManager: SkillManager;
  private memoryManager: MemoryManager;
  private executionContext: ExecutionContext;

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = {
      model: config.model || 'gpt-4-turbo',
      provider: config.provider || 'openai',
      maxTokens: config.maxTokens || 8192,
      temperature: config.temperature || 0.7,
      ...config
    };
    this.logger = new Logger(`hermes:${this.config.provider}`);
    this.skillManager = new SkillManager();
    this.memoryManager = new MemoryManager();
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing agent with model:', this.config.model);

    // Initialize provider
    switch (this.config.provider) {
      case 'openai':
        this.provider = new OpenAIProvider(this.config);
        break;
      case 'anthropic':
        // TODO: Implement Anthropic provider
        throw new Error('Anthropic provider not yet implemented');
      default:
        throw new Error(`Unknown provider: ${this.config.provider}`);
    }

    // Load skills
    await this.skillManager.loadDefaultSkills();
    this.logger.info('Skills loaded:', this.skillManager.getSkillNames());

    // Initialize memory
    await this.memoryManager.initialize();
    this.logger.info('Memory manager initialized');
  }

  async executeCommand(command: string): Promise<any> {
    this.logger.info('Executing command:', command);

    const context: ExecutionContext = {
      command,
      timestamp: Date.now(),
      skills: this.skillManager.getSkills(),
      memory: this.memoryManager
    };

    return this.reasonAndExecute(command, context);
  }

  private async reasonAndExecute(command: string, context: ExecutionContext): Promise<any> {
    this.logger.debug('Reasoning about command:', command);

    // Use LLM to reason about the command
    const reasoning = await this.provider.reasoning({
      prompt: command,
      skills: context.skills,
      history: await context.memory.getRelevantHistory(command),
      temperature: this.config.temperature
    });

    this.logger.debug('Reasoning result:', reasoning);

    // Execute the determined skill
    if (reasoning.skill) {
      const skill = context.skills.find(s => s.name === reasoning.skill);
      if (skill) {
        return await skill.execute(reasoning.args, context);
      }
    }

    // If no specific skill, use agent reasoning
    return await this.provider.complete({
      prompt: command,
      context: reasoning,
      maxTokens: this.config.maxTokens
    });
  }

  async startREPL(): Promise<void> {
    this.logger.info('Starting Hermes Agent REPL');
    console.log('Hermes Agent (Bun Edition) - Type "help" for available commands\n');

    // TODO: Implement interactive REPL
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const prompt = () => {
      rl.question('hermes> ', async (input: string) => {
        if (input === 'exit' || input === 'quit') {
          rl.close();
          process.exit(0);
        }
        try {
          const result = await this.executeCommand(input);
          console.log('Result:', result);
        } catch (error) {
          this.logger.error('Error executing command:', error);
        }
        prompt();
      });
    };

    prompt();
  }
}
