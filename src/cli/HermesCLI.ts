import { Command } from 'commander';
import { Logger } from '../utils/Logger';
import { HermesAgent } from '../agent/HermesAgent';

export class HermesCLI {
  private logger: Logger;
  private program: Command;
  private agent: HermesAgent;

  constructor(agent: HermesAgent) {
    this.agent = agent;
    this.logger = new Logger('hermes:cli');
    this.program = new Command();
    this.setupCommands();
  }

  private setupCommands(): void {
    this.program
      .name('hermes')
      .description('Hermes Agent - The self-improving AI agent (Bun Edition)')
      .version('1.0.0');

    // Execute command
    this.program
      .command('exec <command>')
      .description('Execute a command')
      .action(async (command: string) => {
        try {
          const result = await this.agent.executeCommand(command);
          console.log('Result:', result);
        } catch (error) {
          this.logger.error('Execution failed', error);
          process.exit(1);
        }
      });

    // Skills management
    this.program
      .command('skills')
      .description('Manage agent skills')
      .subcommand(new Command('list').description('List available skills'))
      .subcommand(new Command('info <name>').description('Get skill information'))
      .subcommand(new Command('enable <name>').description('Enable a skill'))
      .subcommand(new Command('disable <name>').description('Disable a skill'));

    // Configuration
    this.program
      .command('config')
      .description('Manage agent configuration')
      .subcommand(new Command('show').description('Show current configuration'))
      .subcommand(new Command('set <key> <value>').description('Set configuration value'))
      .subcommand(new Command('get <key>').description('Get configuration value'));

    // Agent status
    this.program
      .command('status')
      .description('Show agent status')
      .action(() => {
        console.log('Agent Status:');
        console.log('  Model: gpt-4-turbo');
        console.log('  Provider: openai');
        console.log('  Status: ready');
      });

    // Memory management
    this.program
      .command('memory')
      .description('Manage agent memory')
      .subcommand(new Command('clear').description('Clear all memories'))
      .subcommand(new Command('stats').description('Show memory statistics'))
      .subcommand(new Command('export <file>').description('Export memories to file'));

    // Server mode
    this.program
      .command('server [port]')
      .description('Start the gateway server')
      .action(async (port?: string) => {
        const portNum = port ? parseInt(port) : 8000;
        this.logger.info(`Starting server on port ${portNum}`);
        // TODO: Initialize and start gateway server
      });

    // Help
    this.program.on('--help', () => {
      console.log('\nExamples:');
      console.log('  hermes exec "search for TypeScript tips"');
      console.log('  hermes skills list');
      console.log('  hermes config get model');
      console.log('  hermes memory stats');
      console.log('  hermes server 8000');
    });
  }

  async run(args: string[]): Promise<void> {
    try {
      await this.program.parseAsync(args);
    } catch (error) {
      this.logger.error('CLI error', error);
      process.exit(1);
    }
  }
}
