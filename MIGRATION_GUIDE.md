# Migration Guide - Your Config to SDET Framework

## Overview

This guide helps you migrate from your current Playwright configuration to the complete SDET framework architecture.

## Your Current Configuration

You have a good starting point with:
- ✅ Environment-based configuration
- ✅ Multiple browser projects
- ✅ Setup projects for authentication
- ✅ Separate service/API tests

## What the Framework Adds

### 1. **Layered Architecture**

**Before (Your Setup):**
```typescript
// Tests contain everything
test('create user', async ({ page }) => {
  await page.goto('https://example.com/users');
  await page.locator('#name').fill('John');
  await page.locator('#email').fill('john@example.com');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('.success')).toBeVisible();
});
```

**After (Framework):**
```typescript
// Tests use intent only
test('create user', async ({ request }) => {
  // Data via API
  const user = await userClient.createUser({
    name: 'John',
    email: 'john@example.com',
  });

  // Verify via UI
  await userPage.navigateToProfile();
  await userPage.verifyUserDetails(user);

  // Cleanup via API
  await userClient.deleteUser(user.id);
});
```

### 2. **API Layer for Data Management**

**New Addition:**
```
api/
├── clients/
│   ├── auth.client.ts      ─┐
│   ├── user.client.ts       ├─ All data operations
│   └── order.client.ts     ─┘
├── models/
│   └── user.model.ts        ─── Data structures
└── base.client.ts           ─── Base HTTP client
```

**Benefits:**
- Fast test data setup
- No UI dependency for data
- Easy cleanup
- Reusable across tests

### 3. **UI Layer Abstraction**

**New Addition:**
```
ui/
├── models/
│   └── user.model.ts        ─── Page models with intent
└── base.page.ts             ─── Common page actions
```

**Benefits:**
- Tests don't contain selectors
- Easy to update locators in one place
- Intent-based test writing

### 4. **Validators (Shared Logic)**

**New Addition:**
```
validators/
├── user.validator.ts        ─┐
└── order.validator.ts        ├─ Shared validation
```

**Benefits:**
- Consistent validation across tests
- Reusable business rules
- Schema validation with Zod

### 5. **Core Utilities**

**New Addition:**
```
core/
├── config.ts                ─── Environment config
├── logger.ts                ─── Structured logging (Pino)
├── retries.ts               ─── Retry logic
└── test-context.ts          ─── Test context management
```

**Benefits:**
- Centralized configuration
- Better debugging with logs
- Automatic retries for flaky operations

## Comparing Configurations

### Your Current Config

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 120_000,

  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'client setup', testMatch: /.*\.client\.setup\.ts$/ },
    { name: 'services setup', testMatch: /.*\.services\.setup\.ts$/ },
    {
      name: 'client chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['client setup', 'services setup'],
      testMatch: /.*\.client\.spec\.ts$/,
    },
    // ... more projects
  ],
});
```

### Framework Config (Enhanced)

**What's the same:**
- Environment-based config ✅
- Multiple browser projects ✅
- Setup dependencies ✅

**What's enhanced:**
- Better project organization
- Clearer naming conventions
- More comprehensive reporting
- API-only test projects

## Migration Steps

### Step 1: Keep Your Config (It Works!)

Your `playwright.config.ts` is already compatible! Just adjust test match patterns:

```typescript
// Your current config works with minor tweaks:
{
  name: 'client chromium',
  use: {
    ...devices['Desktop Chrome'],
    storageState: 'fixtures/auth/client.user.json', // ← Updated path
  },
  testMatch: /.*\.client\.spec\.ts$/,
}
```

### Step 2: Add Framework Structure

```bash
# Create directories
mkdir -p api/clients api/models
mkdir -p ui/models
mkdir -p validators
mkdir -p core
mkdir -p fixtures/auth
```

### Step 3: Migrate Existing Tests

**Example: Current Test**
```typescript
// tests/login.spec.ts
test('login user', async ({ page }) => {
  await page.goto('http://example.com/login');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#password').fill('password123');
  await page.locator('button').click();
  await expect(page).toHaveURL(/.*dashboard/);
});
```

**Step 3a: Create Page Model**
```typescript
// ui/models/login.model.ts
export class LoginPage extends BasePage {
  private emailInput = this.page.locator('#email');
  private passwordInput = this.page.locator('#password');
  private loginButton = this.page.locator('button');

  async login(email: string, password: string) {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  async verifyLoggedIn() {
    await expect(this.page).toHaveURL(/.*dashboard/);
  }
}
```

**Step 3b: Refactor Test**
```typescript
// tests/login.client.spec.ts
import { LoginPage } from '../ui/models/login.model';

test('login user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto('/login');
  await loginPage.login('test@example.com', 'password123');
  await loginPage.verifyLoggedIn();
});
```

### Step 4: Add API Clients (Gradually)

Start with one client:

```typescript
// api/clients/user.client.ts
export class UserClient extends BaseAPIClient {
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await this.post('/users', { data });
    return await this.parseJSON<User>(response);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.delete(`/users/${userId}`);
  }
}
```

Then use in tests:

```typescript
test('user lifecycle', async ({ request }) => {
  const userClient = new UserClient(request);
  
  // Setup via API
  const user = await userClient.createUser({ name: 'Test' });
  
  // Verify via UI
  await userPage.verifyUserDetails(user);
  
  // Cleanup via API
  await userClient.deleteUser(user.id);
});
```

## Gradual Adoption Strategy

You don't need to migrate everything at once!

### Phase 1: Keep Your Current Setup
- ✅ Use your existing `playwright.config.ts`
- ✅ Keep your current tests running
- ✅ Add framework structure alongside

### Phase 2: Add Page Models
- Create page models for new tests
- Gradually refactor existing tests
- Tests become more readable

### Phase 3: Add API Clients
- Start using API for data setup
- Tests become faster and more reliable
- Better test isolation

### Phase 4: Add Validators and Utilities
- Centralize validation logic
- Add logging and retry mechanisms
- Better debugging and maintenance

## Key Differences Summary

| Aspect | Your Setup | Framework |
|--------|-----------|-----------|
| **Config** | ✅ Good starting point | ✅ Enhanced with better organization |
| **Tests** | Mixed concerns | Intent-based only |
| **Data Setup** | Manual (UI/API mix) | Consistent API layer |
| **Page Actions** | Inline in tests | Abstracted in page models |
| **Validation** | Scattered | Centralized validators |
| **Utilities** | None | Logging, retry, config |
| **Cleanup** | Manual | Automatic via fixtures |

## Benefits You'll Get

### 1. **Faster Tests**
- API for data setup (no UI wait times)
- Parallel execution continues to work
- Better test isolation

### 2. **More Maintainable**
- Change selectors in one place
- Intent-based tests are self-documenting
- Clear layer responsibilities

### 3. **Better Debugging**
- Structured logging
- Clear error messages
- Layer-specific troubleshooting

### 4. **Easier Onboarding**
- New team members understand intent-based tests
- Clear patterns to follow
- Good documentation

## Your Next Steps

1. ✅ **Review the framework** (you're doing this now!)
2. ✅ **Pick one test** to migrate as a proof of concept
3. ✅ **Create page model** for that test
4. ✅ **Add API client** if needed
5. ✅ **Compare** old vs new approach
6. ✅ **Gradually migrate** other tests
7. ✅ **Enjoy** more maintainable tests!

## Questions?

- Check `ARCHITECTURE.md` for design patterns
- Review `GETTING_STARTED.md` for setup
- Look at example tests in `tests/` directory
- Use `QUICK_REFERENCE.md` for commands

---

**Remember:** Your current setup is already good! The framework just adds structure and best practices to make it even better. Migrate gradually at your own pace.
