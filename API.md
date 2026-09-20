# Hermes Agent API Reference

## Core Classes

### HermesAgent

Main agent class for orchestrating AI operations.

```typescript
class HermesAgent {
  constructor(config: Partial<AgentConfig>)
  async initialize(): Promise<void>
  async executeCommand(command: string): Promise<any>
  async startREPL(): Promise<void>
}
```

#### Methods

**initialize()**
- Initializes the agent with configured LLM provider
- Loads default skills
- Sets up memory management
- Returns: Promise<void>

**executeCommand(command: string)**
- Executes a user command
- Analyzes intent and selects appropriate skills
- Returns: Promise<any> - Result of command execution

**startREPL()**
- Starts interactive REPL mode
- Prompts for user input and processes commands
- Returns: Promise<void>

### MemoryManager

Manages conversation and skill history.

```typescript
class MemoryManager {
  async initialize(): Promise<void>
  async addMemory(memory: Omit<Memory, 'id' | 'timestamp'>): Promise<Memory>
  async getRelevantHistory(query: string, limit?: number): Promise<Memory[]>
  async clearMemories(): Promise<void>
  getMemoryStats(): { total: number; byType: Record<string, number> }
}
```

#### Methods

**addMemory(memory)**
- Adds a new memory entry
- Parameters:
  - content: string
  - type: 'conversation' | 'skill' | 'knowledge' | 'execution'
  - metadata?: Record<string, any>
- Returns: Promise<Memory> - Created memory with ID and timestamp

**getRelevantHistory(query, limit)**
- Retrieves memories relevant to a query
- Parameters:
  - query: string - Search query
  - limit: number - Maximum results (default: 10)
- Returns: Promise<Memory[]> - Relevant memories

**clearMemories()**
- Clears all memories
- Returns: Promise<void>

**getMemoryStats()**
- Returns statistics about stored memories
- Returns: { total: number; byType: Record<string, number> }

### SkillManager

Manages skill registration and discovery.

```typescript
class SkillManager {
  registerSkill(skill: Skill): void
  unregisterSkill(name: string): void
  getSkill(name: string): Skill | undefined
  getSkills(): Skill[]
  getSkillNames(): string[]
  hasSkill(name: string): boolean
  getSkillCount(): number
  getSkillsByCapability(capability: string): Skill[]
}
```

### Skill (Abstract)

Base class for all skills.

```typescript
abstract class Skill {
  constructor(definition: SkillDefinition)
  get name(): string
  get description(): string
  abstract execute(args: Record<string, any>, context: ExecutionContext): Promise<ToolResult>
  protected createResult(success: boolean, output?: any, error?: string): ToolResult
}
```

### ReasoningEngine

Analyzes commands and matches to skills.

```typescript
class ReasoningEngine {
  async analyze(command: string, context: ExecutionContext): Promise<ReasoningResult>
  async plan(command: string, skills: Skill[]): Promise<Plan>
}
```

#### Return Types

**ReasoningResult**
```typescript
{
  skill?: string
  args?: Record<string, any>
  confidence: number
  explanation?: string
}
```

### ExecutionPlanner

Creates and executes multi-step plans.

```typescript
class ExecutionPlanner {
  async createPlan(command: string, context: ExecutionContext): Promise<ExecutionPlan>
  async executePlan(plan: ExecutionPlan, context: ExecutionContext): Promise<any>
}
```

### ErrorHandler

Handles errors with recovery strategies.

```typescript
class ErrorHandler {
  registerStrategy(strategy: RecoveryStrategy): void
  async handle(error: Error, context?: Record<string, any>): Promise<any>
  getErrorHistory(limit?: number): ErrorContext[]
  clearErrorHistory(): void
}
```

### GatewayServer

HTTP/WebSocket server for agent access.

```typescript
class GatewayServer {
  constructor(agent: HermesAgent, config?: Partial<GatewayConfig>)
  async start(): Promise<void>
  async stop(): Promise<void>
}
```

## REST API Endpoints

### POST /agent/execute

Execute a command.

**Request:**
```json
{
  "command": "search for TypeScript tips"
}
```

**Response:**
```json
{
  "result": {...},
  "status": "success"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

### WebSocket /ws

Real-time command execution.

**Message Format:**
```json
{
  "command": "search for neural networks"
}
```

**Response:**
```json
{
  "status": "success",
  "result": {...}
}
```

## Built-in Skills

### search
Web search capability
- Parameters: query (string), maxResults (number)
- Returns: SearchResult[]

### calculator
Math expression evaluation
- Parameters: expression (string)
- Returns: number

### file
File operations
- Parameters: action (read|write|append), path (string), content? (string)
- Returns: file operation result

### code_execution
Sandboxed code execution
- Parameters: code (string), language (typescript|javascript|python)
- Returns: execution result

### research
Multi-source research
- Parameters: topic (string), depth (shallow|medium|deep)
- Returns: research findings

### github
GitHub API integration
- Parameters: action (list-repos|search|create-issue|create-pr)
- Returns: GitHub API result

### web_scraping
Web content extraction
- Parameters: url (string), extractors (array), format (html|json|text)
- Returns: extracted content

### data_analysis
Data processing
- Parameters: data (array), analysis (summary|statistics|trends|anomalies)
- Returns: analysis result

### document_processing
Document handling
- Parameters: action (extract|summarize|translate|convert), fileType, content
- Returns: processed document

### workflow_automation
Task automation
- Parameters: action (create|trigger|schedule|monitor), workflowName, params
- Returns: workflow result

## Configuration

### AgentConfig

```typescript
interface AgentConfig {
  model: string  // 'gpt-4-turbo', 'gpt-3.5-turbo', etc.
  provider: 'openai' | 'anthropic' | 'mistral' | 'groq'
  maxTokens: number
  temperature: number  // 0-1
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  apiKey?: string
  baseURL?: string
  timeout?: number
  retryPolicy?: RetryPolicy
}
```

### Environment Variables

```bash
HERMES_MODEL=gpt-4-turbo
HERMES_PROVIDER=openai
OPENAI_API_KEY=sk-...
LOG_LEVEL=info
NODE_ENV=development
```

## Type Definitions

### ExecutionContext

```typescript
interface ExecutionContext {
  command: string
  timestamp: number
  skills: Skill[]
  memory: MemoryManager
  variables?: Record<string, any>
  metadata?: Record<string, any>
}
```

### ToolResult

```typescript
interface ToolResult {
  success: boolean
  output?: any
  error?: string
  executionTime: number
}
```

### Memory

```typescript
interface Memory {
  id: string
  content: string
  timestamp: number
  type: 'conversation' | 'skill' | 'knowledge' | 'execution'
  metadata?: Record<string, any>
}
```

## Error Handling

All API calls return a result object with success flag and optional error:

```typescript
{
  success: boolean
  output?: any
  error?: string
  executionTime: number
}
```

Errors are caught and logged automatically. Recovery strategies are attempted based on error type.

## Examples

### Command Execution

```typescript
const agent = new HermesAgent({
  model: 'gpt-4-turbo',
  provider: 'openai'
});

await agent.initialize();
const result = await agent.executeCommand('Search for TypeScript best practices');
console.log(result);
```

### Skill Management

```typescript
const agent = new HermesAgent({ ... });
const skillManager = new SkillManager();

// Register custom skill
skillManager.registerSkill(new CustomSkill({
  name: 'myskill',
  description: 'Does something useful'
}));

// Query skills
const skills = skillManager.getSkills();
console.log(skills.map(s => s.name));
```

### Memory Operations

```typescript
const memory = new MemoryManager();
await memory.initialize();

// Add memory
await memory.addMemory({
  content: 'User asked about TypeScript',
  type: 'conversation'
});

// Retrieve relevant history
const history = await memory.getRelevantHistory('TypeScript');
console.log(history);
```

### Error Handling

```typescript
const errorHandler = new ErrorHandler();

// Register custom recovery strategy
errorHandler.registerStrategy({
  name: 'custom-recovery',
  priority: 100,
  condition: (e) => e.message.includes('custom error'),
  recovery: async (e) => {
    console.log('Recovering from custom error');
    return { recovered: true };
  }
});

// Handle errors
try {
  // ... some operation
} catch (error) {
  const result = await errorHandler.handle(error);
}
```

## Logging

All operations are logged using structured logging:

```typescript
const logger = new Logger('mycomponent');
logger.info('Message', { key: 'value' });
logger.debug('Debug info', data);
logger.warn('Warning', data);
logger.error('Error occurred', error);
```

Set `LOG_LEVEL` environment variable to control logging verbosity.
