import { ExecutionContext, ToolResult } from '../types/context';
import { Logger } from '../utils/Logger';

export interface SkillDefinition {
  name: string;
  description: string;
  parameters?: Record<string, any>;
  requiredCapabilities?: string[];
}

export abstract class Skill {
  protected logger: Logger;
  public definition: SkillDefinition;

  constructor(definition: SkillDefinition) {
    this.definition = definition;
    this.logger = new Logger(`hermes:skill:${definition.name}`);
  }

  get name(): string {
    return this.definition.name;
  }

  get description(): string {
    return this.definition.description;
  }

  abstract execute(args: Record<string, any>, context: ExecutionContext): Promise<ToolResult>;

  protected createResult(success: boolean, output?: any, error?: string): ToolResult {
    return {
      success,
      output,
      error,
      executionTime: Date.now()
    };
  }
}
