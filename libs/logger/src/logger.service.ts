import * as winston from 'winston';
import { ContextService } from '@lib/context';
import { BaseError, ILoggerPort } from '@lib/common';

export class LoggerService implements ILoggerPort {
  constructor() {
    this.logger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json({ space: 0 }),
        winston.format.colorize({ all: true }),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  private readonly logger: winston.Logger;

  public debug(message: string, ...meta: any[]) {
    this.logger.debug(message, this.buildLogData(...meta));
  }

  public log(message: string, ...meta: any[]) {
    this.logger.info(message, this.buildLogData(...meta));
  }

  public warn(message: string, ...meta: any[]) {
    this.logger.warn(message, this.buildLogData(...meta));
  }

  public error(message: string, error: Error, ...meta: any[]) {
    this.logger.error(message, this.buildLogData(error, ...meta));
  }

  public critical(message: string, error: Error, ...meta: any[]) {
    this.error(message, error, ...meta);

    // TODO: send error to Sentry or other error tracking service
  }

  private buildLogData(...meta: any[]) {
    const contextRaw = ContextService.getRaw();

    return {
      meta: meta.map((item) => (item instanceof Error ? BaseError.getLogData(item) : item)),
      ...contextRaw,
    };
  }
}
