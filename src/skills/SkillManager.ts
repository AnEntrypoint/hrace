import { Logger } from '../utils/Logger';
import { Skill } from './Skill';

export class SkillManager {
  private logger: Logger;
  private skills: Map<string, Skill> = new Map();

  constructor() {
    this.logger = new Logger('hermes:skills');
  }

  async loadDefaultSkills(): Promise<void> {
    this.logger.info('Loading default skills');
    // TODO: Load built-in skills from ./default-skills directory
    // For now, we'll add placeholder skills
  }

  registerSkill(skill: Skill): void {
    this.skills.set(skill.name, skill);
    this.logger.info(`Skill registered: ${skill.name}`);
  }

  unregisterSkill(name: string): void {
    this.skills.delete(name);
    this.logger.info(`Skill unregistered: ${name}`);
  }

  getSkill(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  getSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  getSkillNames(): string[] {
    return Array.from(this.skills.keys());
  }

  hasSkill(name: string): boolean {
    return this.skills.has(name);
  }

  getSkillCount(): number {
    return this.skills.size;
  }

  getSkillsByCapability(capability: string): Skill[] {
    return this.getSkills().filter(s =>
      s.definition.requiredCapabilities?.includes(capability)
    );
  }
}
