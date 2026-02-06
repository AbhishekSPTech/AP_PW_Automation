# Playwright SDET Framework - Architecture Guide

## Overview
This framework follows clean architecture principles with clear separation of concerns, ensuring maintainability, scalability, and testability.

## Core Architecture Principles

### 1. No Duplicated Layers
Each layer has a single, well-defined responsibility:
- **API Layer**: Data control and backend communication
- **UI Layer**: User interactions and visual validations
- **Validators**: Shared validation logic
- **Core**: Framework utilities (not accessible from tests)
- **Tests**: Business flow orchestration (intent-based only)

### 2. Tests Contain Zero Logic
Tests express **WHAT** to do, not **HOW** to do it.

❌ **Bad** (Logic in test):
```typescript
test('login', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.fill('#email', 'user@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
});
```

✅ **Good** (Intent-based):
```typescript
test('login', async () => {
  await userPage.navigateToLogin();
  await userPage.login('user@example.com', 'password123');
  await userPage.verifyLoggedIn();
});
```

### 3. UI Never Manages Data
Data operations (create, update, delete) happen through the **API layer only**.

❌ **Bad** (Creating user through UI):
```typescript
test('create user', async () => {
  await userPage.navigateToCreateUser();
  await userPage.fillUserForm(userData);
  await userPage.submitForm();
});
```

✅ **Good** (API for data, UI for validation):
```typescript
test('create user', async ({ request }) => {
  // Setup via API
  const user = await userClient.createUser(userData);
  
  // Verify via UI
  await userPage.navigateToProfile();
  await userPage.verifyUserDetails(user);
  
  // Cleanup via API
  await userClient.deleteUser(user.id);
});
```

### 4. Fixtures Enforce Isolation
Each test gets:
- Fresh browser context
- Clean data state
- Independent execution environment

```typescript
test.beforeEach(async ({ page, request }) => {
  // Isolated browser context
  userPage = new UserPage(page);
  userClient = new UserClient(request);
});

test.afterEach(async () => {
  // Cleanup to ensure no data pollution
  await userClient.deleteUser(testUserId);
});
```

### 5. Utilities Are Framework-Only
Core utilities (logger, config, retry logic) are **not accessible from tests**.

Tests use high-level abstractions only:
```typescript
// Test doesn't access config directly
const credentials = config.getCredentials('clientUser');

// Test doesn't handle retries
await userClient.createUser(userData); // Retry logic is internal
```

### 6. Framework Abstraction
The framework abstracts Playwright specifics, making tool migration feasible:
```typescript
// Page model abstracts Playwright
class UserPage extends BasePage {
  async login(email: string, password: string): Promise<void> {
    // Playwright-specific implementation hidden
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}
```

## Layer Details

### API Layer (Data Control)
**Location**: `api/`

**Purpose**: All backend communication and data management

**Components**:
- **clients/**: Service clients (auth, user, order)
- **models/**: Data models and builders

**Example**:
```typescript
// api/clients/user.client.ts
export class UserClient extends BaseAPIClient {
  async createUser(userData: CreateUserRequest): Promise<UserModel> {
    const response = await this.post('/users', { data: userData });
    this.verifyStatus(response, 201);
    return await this.parseJSON<UserModel>(response);
  }
}
```

**Responsibilities**:
- ✅ HTTP requests
- ✅ Response parsing
- ✅ Data creation/deletion
- ✅ Request builders
- ❌ UI interaction
- ❌ Visual validation

### UI Layer (User Actions)
**Location**: `ui/`

**Purpose**: User interactions and visual validations

**Components**:
- **models/**: Page models (user.model.ts, etc.)
- **base.page.ts**: Base page with common actions

**Example**:
```typescript
// ui/models/user.model.ts
export class UserPage extends BasePage {
  async verifyUserDetails(user: UserModel): Promise<void> {
    // Validates via UI only
    await expect(this.userNameDisplay).toHaveText(user.name);
    await expect(this.userEmailDisplay).toHaveText(user.email);
  }
}
```

**Responsibilities**:
- ✅ Page navigation
- ✅ Element interactions
- ✅ Visual validations
- ✅ Locators
- ❌ Data management
- ❌ API calls

### Validators (Shared)
**Location**: `validators/`

**Purpose**: Shared validation logic between API and UI layers

**Example**:
```typescript
// validators/user.validator.ts
export class UserValidator {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

**Responsibilities**:
- ✅ Data format validation
- ✅ Schema validation (Zod)
- ✅ Business rule validation
- ❌ HTTP requests
- ❌ UI interaction

### Core Utilities
**Location**: `core/`

**Purpose**: Framework-level utilities

**Components**:
- **config.ts**: Environment configuration
- **logger.ts**: Structured logging (Pino)
- **retries.ts**: Retry logic
- **test-context.ts**: Test context management

**Access**: Framework-only (not directly from tests)

### Test Fixtures
**Location**: `fixtures/`

**Purpose**: Test isolation and setup/teardown

**Components**:
- **auth.setup.ts**: Authentication setup
- **browser.fixture.ts**: Browser context isolation
- **test.context.ts**: Test data tracking & cleanup

### Tests (Business Flow)
**Location**: `tests/`

**Purpose**: Express business flows using intent

**Naming Convention**:
- `*.client.spec.ts`: Client UI tests (multi-browser)
- `*.api.spec.ts`: API-only tests (no browser)
- `*.mobile.spec.ts`: Mobile tests

**Example**:
```typescript
test('user lifecycle', async ({ page, request }) => {
  // Setup data via API
  const user = await userClient.createUser(userData);
  
  // Verify via UI
  await userPage.navigateToProfile();
  await userPage.verifyUserDetails(user);
  
  // Cleanup via API
  await userClient.deleteUser(user.id);
});
```

## Data Flow

```
┌─────────────┐
│   Tests     │  Intent-based, no logic
│ (Business)  │
└──────┬──────┘
       │
       ├─────► UI Layer  ──────► Validates via UI
       │       (User Actions)    (Visual checks)
       │
       └─────► API Layer ──────► Data Control
               (Data Control)    (CRUD operations)
                   │
                   └──────► Validators
                            (Shared validation)
```

## Best Practices

### 1. Intent-Based Tests
```typescript
// ✅ Good - Intent-based
await userPage.login(email, password);
await userPage.verifyLoggedIn();

// ❌ Bad - Implementation details
await page.fill('#email', email);
await page.click('button');
```

### 2. Data via API
```typescript
// ✅ Good - API for data
const user = await userClient.createUser(userData);
await userPage.verifyUserDetails(user);

// ❌ Bad - UI for data
await userPage.createUserViaForm(userData);
```

### 3. Cleanup
```typescript
// ✅ Good - Cleanup via API
test.afterEach(async () => {
  await userClient.deleteUser(userId);
});

// ❌ Bad - No cleanup (data pollution)
test('create user', async () => {
  await userClient.createUser(userData);
  // Test ends, user remains in system
});
```

### 4. Isolation
```typescript
// ✅ Good - Each test is independent
test.beforeEach(async ({ page }) => {
  userPage = new UserPage(page); // Fresh instance
});

// ❌ Bad - Shared state
const userPage = new UserPage(page); // Outside test
```

## Running Tests

```bash
# Run all tests (QA environment by default)
npm test

# Run in specific environment
ENV=dev npm test
ENV=prod npm test

# Run specific test suite
npm test -- login.flow.spec.ts

# Run API tests only
npm test -- --project="api tests"

# Run client tests on Chrome only
npm test -- --project="client chromium"

# Run with UI mode
npm test -- --ui

# Debug mode
npm test -- --debug
```

## File Naming Conventions

- **API Clients**: `*.client.ts`
- **Data Models**: `*.model.ts`
- **Validators**: `*.validator.ts`
- **Page Models**: `*.model.ts` (in ui/models/)
- **Client Tests**: `*.client.spec.ts`
- **API Tests**: `*.api.spec.ts`
- **Setup**: `*.setup.ts`

## Migration Strategy

To switch from Playwright to Cypress:

1. Replace `BasePage` implementation
2. Replace `BaseAPIClient` implementation
3. Update fixture setup
4. Tests remain unchanged (intent-based)

The framework abstraction makes this feasible!

## Conclusion

This architecture ensures:
- ✅ Tests are maintainable (intent-based)
- ✅ Clear separation of concerns
- ✅ Easy debugging (layered approach)
- ✅ Scalable (add new features easily)
- ✅ Tool-agnostic (framework abstraction)
