import { describe, it, expect, beforeEach } from 'vitest';
import { HermesAgent } from '../agent/HermesAgent';
import { MemoryManager } from '../agent/MemoryManager';
import { SkillManager } from '../skills/SkillManager';

describe('HermesAgent', () => {
  let agent: HermesAgent;

  beforeEach(async () => {
    agent = new HermesAgent({
      model: 'gpt-4-turbo',
      provider: 'openai',
      temperature: 0.7
    });
  });

  it('should initialize successfully', async () => {
    await agent.initialize();
    expect(agent).toBeDefined();
  });

  it('should execute commands', async () => {
    await agent.initialize();
    const result = await agent.executeCommand('test command');
    expect(result).toBeDefined();
  });

  it('should manage skills', async () => {
    await agent.initialize();
    // Test skill management
  });

  it('should track memory', async () => {
    await agent.initialize();
    // Test memory management
  });
});

describe('MemoryManager', () => {
  let memory: MemoryManager;

  beforeEach(async () => {
    memory = new MemoryManager();
    await memory.initialize();
  });

  it('should add memories', async () => {
    const m = await memory.addMemory({
      content: 'test memory',
      type: 'conversation'
    });
    expect(m.id).toBeDefined();
    expect(m.content).toBe('test memory');
  });

  it('should retrieve history', async () => {
    await memory.addMemory({ content: 'test 1', type: 'conversation' });
    await memory.addMemory({ content: 'test 2', type: 'conversation' });

    const history = await memory.getRelevantHistory('test');
    expect(history.length).toBeGreaterThan(0);
  });

  it('should clear memories', async () => {
    await memory.addMemory({ content: 'test', type: 'conversation' });
    await memory.clearMemories();

    const stats = memory.getMemoryStats();
    expect(stats.total).toBe(0);
  });
});

describe('SkillManager', () => {
  let skillManager: SkillManager;

  beforeEach(() => {
    skillManager = new SkillManager();
  });

  it('should register skills', () => {
    expect(skillManager.getSkillCount()).toBe(0);
  });

  it('should retrieve skills', () => {
    const skills = skillManager.getSkills();
    expect(Array.isArray(skills)).toBe(true);
  });

  it('should check skill existence', () => {
    expect(skillManager.hasSkill('nonexistent')).toBe(false);
  });
});
