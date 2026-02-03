import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
const env = process.env.ENV || 'qa';

dotenv.config({
  path: `./env/.env.${env}`,
});

console.log(`🔧 Running tests in "${env}" environment`);

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  timeout: 120_000,

  reporter: process.env.CI
    ? [['junit', { outputFile: 'test-results/junit-results.xml' }]]
    : [['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
  },

  projects: [
    // 🔹 Setup projects
    {
      name: 'client setup',
      testMatch: /.*\.client\.setup\.ts$/,
    },
    {
      name: 'services setup',
      testMatch: /.*\.services\.setup\.ts$/,
    },

    // 🔹 Client UI tests
    {
      name: 'client chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/auth/storage/client.user.json',
      },
      dependencies: ['client setup', 'services setup'],
      testMatch: /.*\.client\.spec\.ts$/,
    },
    {
      name: 'client firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'tests/auth/storage/client.user.json',
      },
      dependencies: ['client setup', 'services setup'],
      testMatch: /.*\.client\.spec\.ts$/,
    },
    {
      name: 'client webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'tests/auth/storage/client.user.json',
      },
      dependencies: ['client setup', 'services setup'],
      testMatch: /.*\.client\.spec\.ts$/,
    },

    // 🔹 API / Service tests
    {
      name: 'service quote',
      dependencies: ['services setup'],
      testMatch: /.*\.service\.quote\.spec\.ts$/,
      use: {
        trace: 'off',
        video: 'off',
        screenshot: 'off',
      },
    },
  ],
});
