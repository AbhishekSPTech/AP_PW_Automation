/**
 * Test Context Fixture
 * Provides test context with cleanup hooks
 * 
 * Test Fixtures - Cleanup Hooks
 */

import { test as base } from '@playwright/test';
import { createLogger } from '../core/logger';

const logger = createLogger('TestContextFixture');

export interface TestData {
  createdUsers: string[];
  createdOrders: string[];
  testStartTime: number;
}

/**
 * Extended test with test data tracking
 */
export const test = base.extend<{ testData: TestData }>({
  testData: async ({}, use, testInfo) => {
    const testData: TestData = {
      createdUsers: [],
      createdOrders: [],
      testStartTime: Date.now(),
    };

    logger.info(`Test started: ${testInfo.title}`);

    // Provide test data to the test
    await use(testData);

    // Cleanup after test
    logger.info(`Test completed: ${testInfo.title}`);
    logger.info('Cleanup data:', testData);

    const duration = Date.now() - testData.testStartTime;
    logger.info(`Test duration: ${duration}ms`);

    // Here you can add cleanup logic
    // For example, delete created users/orders via API
  },
});

export { expect } from '@playwright/test';
