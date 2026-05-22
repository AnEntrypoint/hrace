import { describe, it, expect } from 'vitest';
import { SearchSkill, CalculatorSkill, FileSkill } from '../skills/DefaultSkills';
import { ExecutionContext } from '../types/context';
import { MemoryManager } from '../agent/MemoryManager';

describe('Skills', () => {
  let context: ExecutionContext;

  beforeEach(async () => {
    const memory = new MemoryManager();
    await memory.initialize();
    context = {
      command: 'test',
      timestamp: Date.now(),
      skills: [],
      memory
    };
  });

  describe('SearchSkill', () => {
    it('should search for information', async () => {
      const skill = new SearchSkill();
      const result = await skill.execute({ query: 'typescript' }, context);

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
    });

    it('should fail without query parameter', async () => {
      const skill = new SearchSkill();
      const result = await skill.execute({}, context);

      expect(result.success).toBe(false);
    });
  });

  describe('CalculatorSkill', () => {
    it('should evaluate math expressions', async () => {
      const skill = new CalculatorSkill();
      const result = await skill.execute({ expression: '2 + 2' }, context);

      expect(result.success).toBe(true);
      expect(result.output?.result).toBe(4);
    });

    it('should handle complex expressions', async () => {
      const skill = new CalculatorSkill();
      const result = await skill.execute({ expression: '(10 + 5) * 2' }, context);

      expect(result.success).toBe(true);
      expect(result.output?.result).toBe(30);
    });

    it('should reject invalid expressions', async () => {
      const skill = new CalculatorSkill();
      const result = await skill.execute({ expression: 'invalid!' }, context);

      expect(result.success).toBe(false);
    });
  });
});

describe('Skill integration', () => {
  it('should handle skill execution in context', async () => {
    const memory = new MemoryManager();
    await memory.initialize();

    const searchSkill = new SearchSkill();

    const context: ExecutionContext = {
      command: 'search',
      timestamp: Date.now(),
      skills: [searchSkill],
      memory
    };

    expect(context.skills.length).toBe(1);
    expect(context.skills[0].name).toBe('search');
  });
});
