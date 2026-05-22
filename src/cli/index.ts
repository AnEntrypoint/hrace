#!/usr/bin/env bun
import { HermesAgent } from '../agent/HermesAgent';
import { HermesCLI } from './HermesCLI';
import { Logger } from '../utils/Logger';

const logger = new Logger('hermes:cli');

async function main(): Promise<void> {
  try {
    logger.info('Hermes Agent CLI v1.0.0');

    // Initialize agent
    const agent = new HermesAgent({
      model: process.env.HERMES_MODEL || 'gpt-4-turbo',
      provider: process.env.HERMES_PROVIDER || 'openai',
      apiKey: process.env.OPENAI_API_KEY
    });

    logger.info('Initializing agent...');
    await agent.initialize();

    // Create and run CLI
    const cli = new HermesCLI(agent);
    const args = process.argv.slice(2);

    if (args.length === 0) {
      // Interactive REPL mode
      await agent.startREPL();
    } else {
      // Execute command from arguments
      await cli.run(process.argv);
    }
  } catch (error) {
    logger.error('Fatal error in CLI:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
