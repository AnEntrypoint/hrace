# Hermes Agent - Bun Edition

A complete rebuild of the Hermes Agent as a modern Bun-based TypeScript application. The self-improving AI agent that creates skills from experience, improves them during use, and runs anywhere.

## Build Status

✅ **Core Foundation Complete**
- Bun TypeScript project initialized
- Package configuration with 25+ dependencies
- Core agent runtime (HermesAgent, MemoryManager)
- Skill system (Skill base class, SkillManager, 5 default skills)
- LLM Provider integration (OpenAI)
- Gateway/HTTP server (native Bun)
- CLI interface (Commander)
- Type definitions and utils

## Architecture

### Core Components
- **HermesAgent**: Main agent orchestrator
- **MemoryManager**: Conversation and skill history
- **SkillManager**: Dynamic skill registry
- **Providers**: LLM provider abstraction (OpenAI, extensible)
- **GatewayServer**: HTTP/WebSocket API (native Bun)
- **HermesCLI**: Command-line interface

### Default Skills
- **search**: Web search (Exa, Firecrawl integration)
- **calculator**: Math expression evaluation
- **file**: File read/write operations
- **code_execution**: Sandboxed code execution
- **research**: Multi-source research capability

## Tech Stack

- **Bun 1.3.11**: Fast JavaScript runtime
- **TypeScript 5.9**: Type-safe development
- **OpenAI SDK 4.104**: LLM integration
- **Commander 12**: CLI framework
- **Zod 3.25**: Schema validation
- **Pino 9.14**: Structured logging
- **Vitest 1.6**: Testing framework

## Quick Start

```bash
# Install dependencies
bun install

# Run development mode
bun run dev

# Build for production
bun run build

# Execute a command
bun src/index.ts

# Run tests
bun test
```

## Project Structure

```
src/
├── agent/              # Core agent engine
├── gateway/            # HTTP/WebSocket server
├── cli/                # Command-line interface
├── skills/             # Agent skills system
├── providers/          # LLM providers
├── types/              # TypeScript definitions
├── utils/              # Utilities
├── config/             # Configuration
├── storage/            # Persistence
├── integrations/       # Third-party integrations
└── index.ts            # Entry point
```

## Next Steps

1. **Core Modules**: Implement advanced reasoning, planning, and execution
2. **Integrations**: GitHub, web search, tool providers
3. **CLI**: Full command interface
4. **Testing**: Unit and integration tests
5. **Documentation**: API reference and guides

## Original Project

Based on [Hermes Agent](https://github.com/nousresearch/hermes-agent) by Nous Research.
