/**
 * Auth Setup Fixture
 * Handles authentication setup before tests
 * 
 * Test Fixtures - Isolated Execution
 */

import { test as setup, expect } from '@playwright/test';
import { config } from '../core/config';
import path from 'path';

const authFile = path.resolve(__dirname, 'auth/client.user.json');

/**
 * Setup authentication for client user
 * This runs once before all tests
 */
setup('authenticate client user', async ({ page, request }) => {
  console.log('Setting up authentication for client user...');

  const credentials = config.getCredentials('clientUser');

  // Navigate to login page
  await page.goto(`${config.getBaseURL()}/login`);

  // Fill in credentials
  await page.locator('#email').fill(credentials.email);
  await page.locator('#password').fill(credentials.password);

  // Click login button
  await page.locator('button[type="submit"]').click();

  // Wait for successful login (adjust selector based on your app)
  await page.waitForURL('**/dashboard', { timeout: 30000 });

  // Verify login was successful
  await expect(page.locator('text=Welcome')).toBeVisible();

  // Save authenticated state
  await page.context().storageState({ path: authFile });

  console.log('Authentication setup complete');
  console.log(`Auth state saved to: ${authFile}`);
});
