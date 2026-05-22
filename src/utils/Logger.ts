import * as pino from 'pino';

const pinoLogger = pino.default({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined
});

export class Logger {
  private context: string;
  private logger = pinoLogger;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: any): void {
    this.logger.info({ context: this.context, ...data }, message);
  }

  debug(message: string, data?: any): void {
    this.logger.debug({ context: this.context, ...data }, message);
  }

  warn(message: string, data?: any): void {
    this.logger.warn({ context: this.context, ...data }, message);
  }

  error(message: string, error?: any): void {
    this.logger.error({ context: this.context, error }, message);
  }
}
