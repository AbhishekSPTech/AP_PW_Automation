// Main Export Index
// Central export point for the framework

// API Layer
export { BaseAPIClient } from './api/base.client';
export { AuthClient } from './api/clients/auth.client';
export { UserClient } from './api/clients/user.client';
export { OrderClient } from './api/clients/order.client';
export { UserModel, UserBuilder } from './api/models/user.model';

// UI Layer
export { BasePage } from './ui/base.page';
export { Locators } from './ui/locators';

// UI Page Models (backwards compatible)
export { UserPage } from './ui/models/user.model';

// UI Pages (focused, use these in new tests)
export { LoginPage } from './ui/pages/login.page';
export { DashboardPage } from './ui/pages/dashboard.page';
export { ProfilePage } from './ui/pages/profile.page';

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