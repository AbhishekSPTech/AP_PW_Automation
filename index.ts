/**
 * Main Export Index
 * Central export point for the framework
 */

// API Layer
export { BaseAPIClient } from './api/base.client';
export { AuthClient } from './api/clients/auth.client';
export { UserClient } from './api/clients/user.client';
export { OrderClient } from './api/clients/order.client';
export { UserModel, UserBuilder } from './api/models/user.model';

// UI Layer
export { BasePage } from './ui/base.page';
export { UserPage } from './ui/models/user.model';

// Validators
export { UserValidator } from './validators/user.validator';
export { OrderValidator } from './validators/order.validator';

// Core (Framework Only - Not for Tests)
export { config } from './core/config';
export { createLogger, Logger } from './core/logger';
export { retry, retryUntil, sleep } from './core/retries';
export { testContext, TestContextManager } from './core/test-context';

// Fixtures
export { test as browserTest, expect } from './fixtures/browser.fixture';
export { test as contextTest } from './fixtures/test.context';
