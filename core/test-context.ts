//Test Context Utility
//Provides context management for tests

//Framework - only - Not accessible from tests

import { Page, Request, APIRequestContext } from '@playwright/test';
import { createLogger } from './logger';

const logger = createLogger('TestContext');

export interface TestContext {
  page?: Page;
  request?: APIRequestContext;
  testInfo?: any;
}

//Test context manager
export class TestContextManager {
  private static instance: TestContextManager;
  private contexts: Map<string, TestContext> = new Map();

  private constructor() { }

  public static getInstance(): TestContextManager {
    if (!TestContextManager.instance) {
      TestContextManager.instance = new TestContextManager();
    }
    return TestContextManager.instance;
  }

  //Set context for a test
  public setContext(testId: string, context: TestContext): void {
    this.contexts.set(testId, context);
    logger.debug(`Context set for test: ${testId}`);
  }

  //Get context for a test
  public getContext(testId: string): TestContext | undefined {
    return this.contexts.get(testId);
  }

  //Clear context for a test
  public clearContext(testId: string): void {
    this.contexts.delete(testId);
    logger.debug(`Context cleared for test: ${testId}`);
  }

  //Clear all contexts
  public clearAllContexts(): void {
    this.contexts.clear();
    logger.debug('All contexts cleared');
  }
}

export const testContext = TestContextManager.getInstance();
