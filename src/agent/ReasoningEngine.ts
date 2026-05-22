import { Logger } from '../utils/Logger';
import { ExecutionContext, ReasoningResult } from '../types/context';
import { Skill } from '../skills/Skill';

export interface Plan {
  steps: PlanStep[];
  reasoning: string;
  estimatedTime: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PlanStep {
  id: string;
  skill: string;
  args: Record<string, any>;
  dependencies: string[];
  retryPolicy?: { maxRetries: number; backoff: number };
}

export class ReasoningEngine {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('hermes:reasoning');
  }

  async analyze(command: string, context: ExecutionContext): Promise<ReasoningResult> {
    this.logger.debug('Analyzing command:', command);

    // Parse command intent
    const intent = this.parseIntent(command);
    this.logger.debug('Parsed intent:', intent);

    // Find matching skills
    const matchingSkills = this.findMatchingSkills(intent, context.skills);
    this.logger.debug('Found matching skills:', matchingSkills.map(s => s.name));

    if (matchingSkills.length === 0) {
      return {
        skill: undefined,
        confidence: 0,
        explanation: 'No matching skills found for this command'
      };
    }

    // Select best skill based on confidence
    const best = matchingSkills[0];
    const args = this.extractArgs(command, best);

    return {
      skill: best.name,
      args,
      confidence: 0.8,
      explanation: `Using ${best.name} skill for this request`
    };
  }

  async plan(command: string, skills: Skill[]): Promise<Plan> {
    this.logger.debug('Creating plan for:', command);

    // TODO: Implement advanced planning with multi-step reasoning
    return {
      steps: [],
      reasoning: 'Basic single-step execution',
      estimatedTime: 5000,
      riskLevel: 'low'
    };
  }

  private parseIntent(command: string): { verb: string; object: string; modifiers: string[] } {
    // Simple intent parsing - can be enhanced with NLP
    const parts = command.toLowerCase().split(/\s+/);
    return {
      verb: parts[0] || '',
      object: parts.slice(1).join(' '),
      modifiers: []
    };
  }

  private findMatchingSkills(intent: any, skills: Skill[]): Skill[] {
    // Match skills based on intent
    return skills.filter(skill => {
      const name = skill.definition.name.toLowerCase();
      const desc = skill.definition.description.toLowerCase();
      const verb = intent.verb.toLowerCase();

      return name.includes(verb) || desc.includes(verb);
    });
  }

  private extractArgs(command: string, skill: Skill): Record<string, any> {
    // Extract arguments for skill execution
    const args: Record<string, any> = {};

    if (skill.definition.parameters) {
      for (const [key, param] of Object.entries(skill.definition.parameters)) {
        // Simple extraction - can be enhanced
        args[key] = command;
      }
    }

    return args;
  }
}
