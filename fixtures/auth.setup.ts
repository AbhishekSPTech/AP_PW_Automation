//Auth Setup Fixture
//Handles authentication setup before tests

//Test Fixtures - Isolated Execution


import { test as setup, expect } from '@playwright/test';
import { config } from '../core/config';
import { Locators } from '../ui/locators';
import path from 'path';

const authFile = path.resolve(__dirname, 'auth/client.user.json');

//Setup authentication for client user
//This runs once before all tests
setup('authenticate admin user', async ({ page, request }) => {
  console.log('Setting up authentication for admin user...');

  const credentials = config.getCredentials('adminUser');

  // Navigate to login page
  await page.goto(`${config.getBaseURL()}${config.getRoute('login')}`);

  // Fill in credentials
  await page.getByRole(Locators.login.usernameInput.role, { name: Locators.login.usernameInput.name }).fill(credentials.Username);
  await page.getByRole(Locators.login.passwordInput.role, { name: Locators.login.passwordInput.name }).fill(credentials.password);

  // Click login button
  await page.locator(Locators.login.submitButton).click();

  // Wait for successful login (adjust selector based on your app)
  await page.waitForURL(config.getRoute('postLoginURLPattern'), { timeout: config.getTimeout('action') });

  // Verify login was successful
  await expect(page.getByRole(Locators.dashboard.navLink.role, { name: Locators.dashboard.navLink.name })).toBeVisible();

  // Save authenticated state
  await page.context().storageState({ path: authFile });

  console.log('Authentication setup complete');
  console.log(`Auth state saved to: ${authFile}`);
});
