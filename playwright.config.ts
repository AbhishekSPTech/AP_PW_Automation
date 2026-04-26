import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const env = process.env.ENV || 'qa';

dotenv.config({
  path: path.resolve(__dirname, `./env/.env.${env}`),
});

console.log(`Running tests in "${env}" environment`);
console.log(`Base URL: ${process.env.BASE_URL}`);

export default defineConfig({
  testDir: './tests',

  // Fully parallel execution
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Global timeout
  timeout: 120_000,

  // Reporter configuration
  reporter: process.env.CI
    ? [
      ['junit', { outputFile: 'test-results/junit-results.xml' }],
      ['html', { open: 'never' }],
    ]
    : [
      ['html', { open: 'never' }],
      ['list'],
    ],

  // Shared settings for all projects
  use: {
    baseURL: process.env.BASE_URL,

    // Capture trace on first retry
    trace: 'on-first-retry',

    // Record video on failure
    video: 'retain-on-failure',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Action timeout
    actionTimeout: 30_000,

    // Navigation timeout
    navigationTimeout: 60_000,

    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  projects: [
    // =============================================================================
    // SETUP PROJECTS - Run before main tests
    // =============================================================================
    {
      name: 'auth setup',
      testMatch: /auth\.setup\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // =============================================================================
    // CLIENT UI TESTS - Run on multiple browsers
    // =============================================================================
    {
      name: 'client chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'fixtures/auth/client.user.json',
      },
      dependencies: ['auth setup'],
      testMatch: /.*\.ui\.spec\.ts$/,
    },
    {
      name: 'client firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'fixtures/auth/client.user.json',
      },
      dependencies: ['auth setup'],
      testMatch: /.*\.ui\.spec\.ts$/,
    },
    {
      name: 'client webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'fixtures/auth/client.user.json',
      },
      dependencies: ['auth setup'],
      testMatch: /.*\.ui\.spec\.ts$/,
    },

    // =============================================================================
    // API / SERVICE TESTS - No browser needed
    // =============================================================================
    {
      name: 'api tests',
      dependencies: ['auth setup'],
      testMatch: /.*\.api\.spec\.ts$/,
      use: {
        // No browser, no video, no screenshots for API tests
        trace: 'off',
        video: 'off',
        screenshot: 'off',
      },
    },

    // =============================================================================
    // MOBILE TESTS (Optional)
    // =============================================================================
    {
      name: 'mobile chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'fixtures/auth/client.user.json',
      },
      dependencies: ['auth setup'],
      testMatch: /.*\.mobile\.spec\.ts$/,
    },
  ],

  // Folder for test artifacts such as screenshots, videos, traces, etc.
  outputDir: 'test-results/',

  // Web server configuration (if needed)
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
