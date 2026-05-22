import { Logger } from '../utils/Logger';
import { ExecutionContext } from '../types/context';

export interface WorkflowStep {
  id: string;
  type: 'skill' | 'decision' | 'loop' | 'parallel';
  skillName?: string;
  args?: Record<string, any>;
  condition?: (context: ExecutionContext) => boolean;
  steps?: WorkflowStep[];
  retries?: number;
}

export interface ExecutionPlan {
  steps: WorkflowStep[];
  metadata: {
    createdAt: number;
    estimatedDuration: number;
    complexity: number;
  };
}

export class ExecutionPlanner {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('hermes:planner');
  }

  async createPlan(command: string, context: ExecutionContext): Promise<ExecutionPlan> {
    this.logger.info('Creating execution plan for:', command);

    const plan: ExecutionPlan = {
      steps: await this.buildSteps(command, context),
      metadata: {
        createdAt: Date.now(),
        estimatedDuration: 0,
        complexity: 0
      }
    };

    return plan;
  }

  async executePlan(plan: ExecutionPlan, context: ExecutionContext): Promise<any> {
    this.logger.info('Executing plan with', plan.steps.length, 'steps');

    const results: any[] = [];

    for (const step of plan.steps) {
      try {
        const result = await this.executeStep(step, context);
        results.push(result);
      } catch (error) {
        this.logger.error('Step execution failed:', error);
        if (step.retries && step.retries > 0) {
          step.retries--;
          // Retry
          const result = await this.executeStep(step, context);
          results.push(result);
        } else {
          throw error;
        }
      }
    }

    return results;
  }

  private async buildSteps(command: string, context: ExecutionContext): Promise<WorkflowStep[]> {
    // TODO: Implement intelligent step planning
    return [
      {
        id: 'step_1',
        type: 'skill',
        skillName: 'search',
        args: { query: command }
      }
    ];
  }

  private async executeStep(step: WorkflowStep, context: ExecutionContext): Promise<any> {
    this.logger.debug('Executing step:', step.id);

    switch (step.type) {
      case 'skill': {
        if (!step.skillName) throw new Error('Skill name required');
        const skill = context.skills.find(s => s.name === step.skillName);
        if (!skill) throw new Error(`Skill not found: ${step.skillName}`);
        const result = await skill.execute(step.args || {}, context);
        return result;
      }

      case 'decision': {
        if (!step.condition) throw new Error('Condition required');
        return step.condition(context);
      }

      case 'parallel': {
        if (!step.steps) throw new Error('Steps required for parallel');
        return Promise.all(step.steps.map(s => this.executeStep(s, context)));
      }

      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  analyzeComplexity(command: string): number {
    // Simple complexity analysis
    const words = command.split(/\s+/).length;
    const hasMultipleVerbs = (command.match(/\band\b|\bor\b|\bthen\b/gi) || []).length;
    return Math.min(10, words / 2 + hasMultipleVerbs);
  }
}
