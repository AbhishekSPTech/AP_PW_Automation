//Logger Utility (Pino)
//Provides structured logging for the framework

//Framework - only - Not accessible from tests

import pino from 'pino';
import { config } from './config';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

//Structured logger for the framework
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: any) {
    logger.info({ context: this.context, ...data }, message);
  }

  error(message: string, error?: any) {
    logger.error({ context: this.context, error }, message);
  }

  warn(message: string, data?: any) {
    logger.warn({ context: this.context, ...data }, message);
  }

  debug(message: string, data?: any) {
    logger.debug({ context: this.context, ...data }, message);
  }

  //Log API request
  logRequest(method: string, url: string, data?: any) {
    this.info(`API Request: ${method} ${url}`, { data });
  }

  //Log API response
  logResponse(status: number, url: string, data?: any) {
    this.info(`API Response: ${status} ${url}`, { data });
  }

  //Log test step
  logStep(step: string, data?: any) {
    this.info(`Test Step: ${step}`, data);
  }
}

//Create logger instance with context
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};
