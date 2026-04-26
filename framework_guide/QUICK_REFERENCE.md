# Quick Reference Guide

## 🚀 Quick Start

```bash
npm install
npx playwright install
ENV=qa npm test
```

## 📁 Framework Structure

```
playwright-sdet-framework/
├── 📦 api/                 Data Control (API Layer)
├── 🎨 ui/                  User Actions (UI Layer)
├── ✅ validators/          Shared Validation
├── ⚙️  core/               Framework Utilities
├── 🧪 tests/               Business Flow Tests
├── 🔧 fixtures/            Test Setup & Isolation
└── 🌍 env/                 Environment Config
```

## 🎯 Architecture Principles

| Principle | Description |
|-----------|-------------|
| **No Duplicated Layers** | Each layer has single responsibility |
| **Tests = Zero Logic** | Tests express intent, not implementation |
| **UI Never Manages Data** | Data operations via API only |
| **Fixtures Enforce Isolation** | Each test runs independently |
| **Utilities = Framework Only** | Tests use abstractions, not utilities |
| **Framework Abstraction** | Easy to switch tools (Playwright → Cypress) |

## 📝 Test Writing Pattern

```typescript
test('user lifecycle', async ({ page, request }) => {
  // 1️⃣ Setup data via API
  const user = await userClient.createUser(userData);
  
  // 2️⃣ Verify via UI
  await userPage.navigateToProfile();
  await userPage.verifyUserDetails(user);
  
  // 3️⃣ Cleanup via API
  await userClient.deleteUser(user.id);
});
```

## 🔨 Common Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (QA env) |
| `ENV=dev npm test` | Run in dev environment |
| `npm test -- --ui` | Interactive UI mode |
| `npm test -- --headed` | Show browser |
| `npm test -- --debug` | Debug mode |
| `npm test -- login.flow.spec.ts` | Run specific file |
| `npm test -- --project="client chromium"` | Run on Chrome only |
| `npm test -- --project="api tests"` | Run API tests only |
| `npx playwright show-report` | View HTML report |

## 📂 File Naming Conventions

| File Type | Pattern | Example |
|-----------|---------|---------|
| API Client | `*.client.ts` | `user.client.ts` |
| Data Model | `*.model.ts` | `user.model.ts` |
| Validator | `*.validator.ts` | `user.validator.ts` |
| Page Model | `*.model.ts` | `user.model.ts` |
| Client Test | `*.client.spec.ts` | `login.client.spec.ts` |
| API Test | `*.api.spec.ts` | `user.api.spec.ts` |
| Setup | `*.setup.ts` | `auth.setup.ts` |

## 🎨 Layer Responsibilities

### API Layer (`api/`)
✅ HTTP requests  
✅ Data CRUD operations  
✅ Response parsing  
❌ UI interaction  
❌ Visual validation

### UI Layer (`ui/`)
✅ Page navigation  
✅ Element interactions  
✅ Visual validations  
✅ Locators  
❌ Data management  
❌ API calls

### Validators (`validators/`)
✅ Data format validation  
✅ Schema validation  
✅ Business rules  
❌ HTTP requests  
❌ UI interaction

### Tests (`tests/`)
✅ Express business intent  
✅ Orchestrate layers  
❌ Implementation details  
❌ Direct selectors  
❌ Logic

## 🎯 Do's and Don'ts

### ✅ DO

```typescript
// Intent-based
await userPage.login(email, password);

// Data via API
const user = await userClient.createUser(data);

// Cleanup
test.afterEach(async () => {
  await userClient.deleteUser(userId);
});
```

### ❌ DON'T

```typescript
// Implementation details
await page.fill('#email', email);

// Data via UI
await userPage.fillFormAndSubmit(data);

// No cleanup (data pollution)
test('create user', async () => {
  await userClient.createUser(data);
  // Test ends, user remains
});
```

## 🔍 Debugging

```bash
# Enable debug logging
LOG_LEVEL=debug npm test

# Use Playwright Inspector
PWDEBUG=1 npm test

# UI Mode (best for debugging)
npm test -- --ui

# Headed mode (see browser)
npm test -- --headed

# Slow motion
npm test -- --headed --slowMo=1000
```

## 🌍 Environments

```bash
# Development
ENV=dev npm test

# QA (default)
ENV=qa npm test

# Production
ENV=prod npm test
```

Configure in `env/.env.<environment>`:
- `BASE_URL` - Application URL
- `API_URL` - API endpoint
- `CLIENT_USER_EMAIL` - Test user email
- `CLIENT_USER_PASSWORD` - Test user password

## 📊 Reports

```bash
# View HTML report
npx playwright show-report

# Allure report
npm run report:allure
```

Reports location:
- HTML: `playwright-report/`
- JUnit: `test-results/junit-results.xml`
- Videos: `test-results/videos/`
- Screenshots: `test-results/`

## 🎓 Learning Path

1. Read `GETTING_STARTED.md`
2. Review example tests in `tests/`
3. Understand architecture in `ARCHITECTURE.md`
4. Customize for your application
5. Write your first test

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Selectors not found** | Update selectors in page models |
| **Auth failing** | Update `fixtures/auth.setup.ts` |
| **API errors** | Verify `API_URL` in env file |
| **Tests flaky** | Check test isolation, use proper waits |
| **Import errors** | Verify TypeScript paths in `tsconfig.json` |

## 📚 Key Files

| File | Purpose |
|------|---------|
| `playwright.config.ts` | Playwright configuration |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies and scripts |
| `ARCHITECTURE.md` | Detailed architecture guide |
| `GETTING_STARTED.md` | Setup and first test guide |
| `README.md` | Project overview |

## 🔗 Useful Links

- [Playwright Docs](https://playwright.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Zod Docs](https://zod.dev)

---

**Happy Testing! 🚀**
