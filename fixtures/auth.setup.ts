//Auth Setup Fixture
//Handles authentication setup before tests

//Test Fixtures - Isolated Execution


import { test as setup, expect } from '@playwright/test';
import { config } from '../core/config';
import path from 'path';

const authFile = path.resolve(__dirname, 'auth/client.user.json');

//Setup authentication for client user
//This runs once before all tests
setup('authenticate admin user', async ({ page, request }) => {
  console.log('Setting up authentication for admin user...');

  const credentials = config.getCredentials('adminUser');

  // Navigate to login page
  await page.goto(`${config.getBaseURL()}/web/index.php/auth/login`);

  // Fill in credentials
  await page.getByRole('textbox', { name: 'Username' }).fill(credentials.Username);
  await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);

  // Click login button
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for successful login (adjust selector based on your app)
  await page.waitForURL('**/dashboard/index', { timeout: config.getTimeout('action') });

  // Verify login was successful
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();

  // Save authenticated state
  await page.context().storageState({ path: authFile });

  console.log('Authentication setup complete');
  console.log(`Auth state saved to: ${authFile}`);
});
