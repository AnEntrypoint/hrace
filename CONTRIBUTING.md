# Contributing to Hermes Agent (Bun Edition)

Thank you for your interest in contributing to Hermes Agent! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

### Prerequisites
- Bun 1.0.0 or later
- Node.js 20.0.0 or later
- Git
- TypeScript knowledge

### Development Setup

```bash
# Clone the repository
git clone https://github.com/AnEntrypoint/hrace.git
cd hrace

# Install dependencies
bun install

# Create a development branch
git checkout -b feature/your-feature-name

# Start development mode
bun run dev
```

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/tests/HermesAgent.test.ts

# Run with coverage
bun test --coverage
```

### Code Quality

```bash
# Type checking
bun run type-check

# Linting
bun run lint

# Code formatting
bun run format
```

## Development Workflow

### Creating a New Skill

1. Create a file in `src/skills/YourSkill.ts`:

```typescript
import { Skill, SkillDefinition } from './Skill';
import { ExecutionContext, ToolResult } from '../types/context';

export class YourSkill extends Skill {
  constructor() {
    const def: SkillDefinition = {
      name: 'yourskill',
      description: 'Description of what your skill does',
      parameters: {
        param1: { type: 'string', description: 'First parameter' }
      }
    };
    super(def);
  }

  async execute(args: Record<string, any>, context: ExecutionContext): Promise<ToolResult> {
    try {
      // Implement skill logic here
      return this.createResult(true, { result: 'success' });
    } catch (error) {
      return this.createResult(false, undefined, String(error));
    }
  }
}
```

2. Add tests in `src/tests/`:

```typescript
import { describe, it, expect } from 'vitest';
import { YourSkill } from '../skills/YourSkill';

describe('YourSkill', () => {
  it('should execute successfully', async () => {
    const skill = new YourSkill();
    const result = await skill.execute({ param1: 'value' }, context);
    expect(result.success).toBe(true);
  });
});
```

3. Register in SkillManager or dynamically load

### Adding a New Provider

1. Create `src/providers/NewProvider.ts`:

```typescript
import { Logger } from '../utils/Logger';
import { AgentConfig } from '../types/config';

export class NewProvider {
  private logger: Logger;
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.logger = new Logger('hermes:newprovider');
  }

  async reasoning(params: any): Promise<any> {
    // Implement reasoning logic
  }

  async complete(params: any): Promise<string> {
    // Implement completion logic
  }

  async chat(messages: any[]): Promise<string> {
    // Implement chat logic
  }
}
```

2. Update `HermesAgent.initialize()` to support the new provider

3. Add tests and documentation

### Creating a New Integration

1. Create `src/integrations/YourIntegration.ts`
2. Implement the integration interface
3. Add error handling and logging
4. Write comprehensive tests
5. Document the API

## Commit Guidelines

- Use conventional commits:
  - `feat: Add new feature`
  - `fix: Fix bug`
  - `docs: Update documentation`
  - `test: Add tests`
  - `refactor: Code refactoring`
  - `perf: Performance improvement`

- Keep commits focused and logical
- Include the session URL in commit messages
- Write descriptive commit messages

Example:
```
feat: Add semantic search to MemoryManager

Implement vector similarity search for memory retrieval using
embeddings. Improves memory relevance and reduces unnecessary
history scanning.

Related to PR #1
https://claude.ai/code/session_...
```

## Pull Request Process

1. **Before Submitting:**
   - Run tests: `bun test`
   - Run linter: `bun run lint`
   - Format code: `bun run format`
   - Type check: `bun run type-check`

2. **PR Description:** Include:
   - Clear description of changes
   - Motivation and context
   - Testing approach
   - Any breaking changes

3. **Code Review:**
   - Address reviewer comments
   - Request re-review if changes were made
   - Maintain respectful discussion

4. **Merging:**
   - Ensure all checks pass
   - Squash or rebase if requested
   - Delete feature branch after merge

## Architecture Decisions

When making significant architectural changes:

1. **Open an issue** to discuss the change
2. **Document the decision** in ARCHITECTURE.md
3. **Update relevant files** (API.md, README, etc.)
4. **Provide migration guide** if breaking changes
5. **Update tests and examples**

## Performance Guidelines

- Profile before optimizing
- Benchmark critical paths
- Document performance impacts
- Consider memory usage
- Test with realistic datasets

## Documentation Standards

- Every class should have JSDoc comments
- Every public method needs documentation
- Document complex logic with inline comments
- Keep README.md and docs/ updated
- Update API.md for interface changes

Example:
```typescript
/**
 * Executes a skill with the given arguments.
 * 
 * @param args - Arguments to pass to the skill
 * @param context - Execution context containing skills and memory
 * @returns The result of skill execution
 * 
 * @throws Error if skill execution fails and recovery fails
 */
async execute(args: Record<string, any>, context: ExecutionContext): Promise<ToolResult>
```

## Testing Guidelines

- Aim for 80%+ code coverage
- Test both happy path and error cases
- Use descriptive test names
- Test integration between components
- Mock external API calls

## Security Considerations

- **Never commit secrets** (API keys, passwords)
- Use environment variables for sensitive data
- Validate user input before processing
- Sanitize error messages
- Be cautious with code execution features
- Review security implications of new features

## Reporting Issues

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Bun version, Node version)
- Error messages and stack traces
- Relevant code snippets

## Performance Benchmarking

```bash
# Simple benchmark
time bun src/index.ts exec "your command"

# Detailed profiling
bun --inspect src/index.ts
```

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release commit
4. Tag release: `git tag v1.0.0`
5. Push tag: `git push origin v1.0.0`
6. Create GitHub Release with notes

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- Architecture Overview: [ARCHITECTURE.md](ARCHITECTURE.md)
- API Reference: [API.md](API.md)

## Questions?

- Open a GitHub issue
- Check existing documentation
- Review closed issues for solutions
- Ask in pull request discussions

## Acknowledgments

Contributors will be recognized in CONTRIBUTORS.md and release notes.

Thank you for contributing to make Hermes Agent better!
