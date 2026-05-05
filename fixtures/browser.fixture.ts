//Browser Fixture
//Provides isolated browser context per test

//Test Fixtures - Enforces Isolation

import { test as base } from '@playwright/test';
import { createLogger } from '../core/logger';
import { config } from '../core/config';

const logger = createLogger('BrowserFixture');

//Extended test with custom fixtures
export const test = base.extend({

  //Browser context with isolation

  context: async ({ browser }, use) => {
    logger.info('Creating isolated browser context');

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      permissions: ['clipboard-read', 'clipboard-write'],
      recordVideo: process.env.CI
        ? { dir: 'test-results/videos' }
        : undefined,
    });

    await use(context);

    logger.info('Cleaning up browser context');
    await context.close();
  },

  //Page with automatic cleanup
  page: async ({ context }, use) => {
    logger.info('Creating new page');

    const page = await context.newPage();

    // Set default timeout
    page.setDefaultTimeout(config.getTimeout('action'));

    await use(page);

    logger.info('Cleaning up page');
    await page.close();
  },
});

export { expect } from '@playwright/test';
