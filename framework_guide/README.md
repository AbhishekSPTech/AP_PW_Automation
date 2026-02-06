# Playwright SDET Framework

A comprehensive Playwright testing framework following clean architecture principles with clear separation of concerns.

## Architecture Principles

✅ **No duplicated layers** - Each layer has a single responsibility  
✅ **Tests contain zero logic** - Business logic lives in the framework  
✅ **UI never manages data** - Data operations happen in API layer  
✅ **Fixtures enforce isolation** - Each test runs independently  
✅ **Utilities are framework-only** - Test files use only intent-based methods  
✅ **Switching Playwright → Cypress later is feasible** - Framework abstraction allows tool changes

## Project Structure

```
playwright-sdet-framework/
│
├── api/                          # API Layer (Data Control)
│   ├── clients/                  # Service clients
│   │   ├── auth.client.ts
│   │   ├── user.client.ts
│   │   └── order.client.ts
│   └── models/                   # Data models
│       └── user.model.ts
│
├── ui/                           # UI Layer (User Actions)
│   ├── models/                   # Page models
│   │   └── user.model.ts
│   ├── pages/                   # Page objects
│   └── locators.ts              # Centralized locators
│
├── validators/                   # Validators (Shared)
│   ├── user.validator.ts
│   └── order.validator.ts
│
├── core/                         # Core Utilities
│   ├── config.ts                # Config & env handling
│   ├── logger.ts                # Logging (Pino)
│   ├── retries.ts               # Retry logic
│   └── test-context.ts          # Test context
│
├── tests/                        # Test Scenarios (Business Flow)
│   ├── login.flow.spec.ts
│   ├── checkout.flow.spec.ts
│   └── user.lifecycle.spec.ts
│
├── fixtures/                     # Test Fixtures
│   ├── browser.fixture.ts       # Browser context per test
│   ├── test.context.ts          # Cleanup hooks
│   └── auth.setup.ts            # API auth/session setup
│
├── env/                          # Environment configs
│   ├── .env.dev
│   ├── .env.qa
│   └── .env.prod
│
└── playwright.config.ts          # Playwright configuration
```

## Getting Started

```bash
npm install
npx playwright install
ENV=qa npm test
```

## Writing Tests

Tests use **intent only** - no implementation details:

```typescript
test('user lifecycle', async ({ page, request }) => {
  const userClient = new UserClient(request);
  const user = await userClient.createUser(testData);
  
  const userPage = new UserPage(page);
  await userPage.navigateToProfile();
  await userPage.verifyUserDetails(user);
});
```
