//Retry Utility
//Provides retry logic for flaky operations

//Framework - only - Not accessible from tests

import { createLogger } from './logger';
import { config } from './config';

const logger = createLogger('RetryUtil');

export interface RetryOptions {
  attempts?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: any) => void;
}

//Retry a function with exponential backoff
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    attempts = config.get().retry.attempts,
    delay = config.get().retry.delay,
    backoff = true,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === attempts) {
        logger.error(`All ${attempts} retry attempts failed`, error);
        throw error;
      }

      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;

      logger.warn(`Attempt ${attempt}/${attempts} failed, retrying in ${waitTime}ms`, {
        error: error instanceof Error ? error.message : String(error),
      });

      if (onRetry) {
        onRetry(attempt, error);
      }

      await sleep(waitTime);
    }
  }

  throw lastError;
}

//Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//Retry with custom condition
export async function retryUntil<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  options: RetryOptions = {}
): Promise<T> {
  const {
    attempts = config.get().retry.attempts,
    delay = config.get().retry.delay,
  } = options;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const result = await fn();

    if (condition(result)) {
      return result;
    }

    if (attempt < attempts) {
      logger.debug(`Condition not met, retrying... (${attempt}/${attempts})`);
      await sleep(delay);
    }
  }

  throw new Error(`Condition not met after ${attempts} attempts`);
}
