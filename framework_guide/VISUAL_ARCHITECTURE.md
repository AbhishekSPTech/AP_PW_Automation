# Playwright SDET Framework - Visual Architecture

## Framework Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PLAYWRIGHT SDET FRAMEWORK ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  ARCHITECTURE PRINCIPLES                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ✅ No duplicated layers                                                    │
│  ✅ Tests contain zero logic                                                │
│  ✅ UI never manages data                                                   │
│  ✅ Fixtures enforce isolation                                              │
│  ✅ Utilities are framework-only                                            │
│  ✅ Switching Playwright → Cypress later is feasible                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│     TEST SCENARIOS (Business Flow)       │
│  ┌────────────────────────────────────┐  │
│  │  • Uses only intent                │  │
│  │  • Zero logic, zero locators       │  │
│  │  • Validates via UI                │  │───────┐
│  └────────────────────────────────────┘  │       │
└──────────────────────────────────────────┘       │
                                                    │
          ┌─────────────────────────────────────────┼─────────┐
          │                                         │         │
          ▼                                         ▼         │
┌──────────────────────────┐            ┌─────────────────────┴────┐
│   UI LAYER               │            │    API LAYER             │
│   (User Actions)         │            │    (Data Control)        │
├──────────────────────────┤            ├──────────────────────────┤
│  • locators              │            │  • service clients       │
│  • page actions          │            │  • request builders      │
│  • Validates via UI      │            │  • response validators   │
└────────────┬─────────────┘            └────────────┬─────────────┘
             │                                       │
             │                                       │
             │         ┌─────────────────────────────┘
             │         │
             │         │
             └─────────┼──────────────────────┐
                       │                      │
                       ▼                      ▼
              ┌─────────────────┐   ┌──────────────────────┐
              │   VALIDATORS    │   │   CORE UTILITIES     │
              │   (Shared)      │   │   (Framework Only)   │
              ├─────────────────┤   ├──────────────────────┤
              │ • user.validator│   │ • config (env)       │
              │ • order.validator│  │ • logging (Pino)     │
              │                 │   │ • retries            │
              └─────────────────┘   │ • test context       │
                                    └──────────────────────┘
                                              │
                                              │
                       ┌──────────────────────┴─────────────────────┐
                       │                                            │
                       ▼                                            ▼
              ┌─────────────────┐                          ┌─────────────────┐
              │  TEST FIXTURES  │                          │ EXECUTION &     │
              │  (Isolation)    │                          │ REPORTING       │
              ├─────────────────┤                          ├─────────────────┤
              │ • browser.fixture│                         │ • playwright.   │
              │ • test.context   │                         │   config.ts     │
              │ • auth.setup     │                         │ • HTML reports  │
              │                 │                          │ • JUnit XML     │
              │ • cleanup hooks  │                          │ • Allure        │
              └─────────────────┘                          └─────────────────┘
```

## Directory Structure with Responsibilities

```
playwright-sdet-framework/
│
├── 📦 api/                              API Layer (Data Control)
│   ├── clients/                         Service clients
│   │   ├── auth.client.ts              ─┐
│   │   ├── user.client.ts               ├─ Business Flow
│   │   └── order.client.ts             ─┘
│   ├── models/                          Data models
│   │   └── user.model.ts
│   └── base.client.ts                   Base API client
│
├── 🎨 ui/                               UI Layer (User Actions)
│   ├── models/                          Page models
│   │   └── user.model.ts               ─── locators + page actions
│   └── base.page.ts                     Base page
│
├── ✅ validators/                       Shared Infrastructure
│   ├── user.validator.ts
│   └── order.validator.ts
│
├── ⚙️  core/                            Core Utilities
│   ├── config.ts                        ─┐
│   ├── logger.ts                         ├─ Framework-only
│   ├── retries.ts                        │  (Not accessible
│   └── test-context.ts                  ─┘   from tests)
│
├── 🧪 tests/                            Test Scenarios (Business Flow)
│   ├── login.flow.spec.ts              ─┐
│   ├── checkout.flow.spec.ts            ├─ Uses only intent
│   └── user.lifecycle.client.spec.ts   ─┘
│
├── 🔧 fixtures/                         Test Fixtures
│   ├── auth/
│   │   └── client.user.json            ─── Generated auth state
│   ├── auth.setup.ts                    ─┐
│   ├── browser.fixture.ts               ├─ Isolated execution
│   └── test.context.ts                  ─┘
│
├── 🌍 env/                              Environment configs
│   ├── .env.dev
│   ├── .env.qa
│   └── .env.prod
│
├── 📊 reports/                          Test reports
│   └── allure-reports/
│
├── ⚙️  playwright.config.ts             Playwright config
├── 📦 package.json                      Dependencies
├── 📝 tsconfig.json                     TypeScript config
├── 📖 README.md                         Overview
├── 📚 ARCHITECTURE.md                   Architecture guide
├── 🚀 GETTING_STARTED.md                Setup guide
└── ⚡ QUICK_REFERENCE.md                Quick commands
```

## Layer Communication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         TEST EXECUTION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

User writes test
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  test('user lifecycle', async ({ page, request }) => {      │
│                                                              │
│    // 1️⃣ Setup data via API                                 │
│    const user = await userClient.createUser(userData);      │
│         │                                                    │
│         └──────────► API Layer ──────► Backend              │
│                                                              │
│    // 2️⃣ Verify via UI                                      │
│    await userPage.navigateToProfile();                      │
│         │                                                    │
│         └──────────► UI Layer ──────► Browser               │
│                                                              │
│    await userPage.verifyUserDetails(user);                  │
│         │                                                    │
│         └──────────► Validators ───► Assertions             │
│                                                              │
│    // 3️⃣ Cleanup via API                                    │
│    await userClient.deleteUser(user.id);                    │
│         │                                                    │
│         └──────────► API Layer ──────► Backend              │
│  });                                                         │
└──────────────────────────────────────────────────────────────┘
```

## Project Configuration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONFIGURATION & SETUP                        │
└─────────────────────────────────────────────────────────────────┘

1. Environment Selection
   ├── ENV=dev  ──► env/.env.dev  ──► Development config
   ├── ENV=qa   ──► env/.env.qa   ──► QA config (default)
   └── ENV=prod ──► env/.env.prod ──► Production config

2. Authentication Setup (runs before tests)
   └── fixtures/auth.setup.ts
       ├── Logs in test user
       ├── Saves authentication state
       └── Creates: fixtures/auth/client.user.json

3. Test Execution
   └── playwright.config.ts
       ├── Loads environment config
       ├── Configures projects
       │   ├── auth setup
       │   ├── client chromium (uses auth state)
       │   ├── client firefox (uses auth state)
       │   ├── client webkit (uses auth state)
       │   └── api tests (no browser)
       └── Generates reports

4. Test Isolation (per test)
   └── fixtures/browser.fixture.ts
       ├── Creates fresh browser context
       ├── Runs test
       └── Cleans up context
```

## Test Execution Matrix

```
┌────────────────────────────────────────────────────────────────┐
│                    TEST EXECUTION MATRIX                       │
├────────────────┬───────────────┬──────────────┬───────────────┤
│ Test Type      │ Browser       │ Storage State│ Test Pattern  │
├────────────────┼───────────────┼──────────────┼───────────────┤
│ Client UI      │ Chromium      │ ✅ Used      │ *.client.spec │
│ Client UI      │ Firefox       │ ✅ Used      │ *.client.spec │
│ Client UI      │ WebKit        │ ✅ Used      │ *.client.spec │
│ API Only       │ ❌ None       │ ❌ Not Used  │ *.api.spec    │
│ Mobile         │ Mobile Chrome │ ✅ Used      │ *.mobile.spec │
└────────────────┴───────────────┴──────────────┴───────────────┘
```

## Data Flow - API vs UI

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA MANAGEMENT FLOW                       │
└─────────────────────────────────────────────────────────────────┘

   CREATE/UPDATE/DELETE                      READ/VERIFY
   (Data Operations)                    (Visual Validation)
           │                                     │
           ▼                                     ▼
    ┌─────────────┐                      ┌─────────────┐
    │  API LAYER  │                      │  UI LAYER   │
    │             │                      │             │
    │ POST /users │                      │  Navigate   │
    │ PUT /users  │                      │  Verify     │
    │ DELETE /users│                     │  Assert     │
    └─────────────┘                      └─────────────┘
           │                                     │
           ▼                                     ▼
    ┌─────────────┐                      ┌─────────────┐
    │   Backend   │                      │   Browser   │
    │   Database  │                      │   Display   │
    └─────────────┘                      └─────────────┘

    ✅ Fast, Reliable                    ✅ User Experience
    ✅ No UI dependency                  ✅ Visual Verification
```

## Architecture Layers - Detailed

```
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER DETAILS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🎯 TEST LAYER                                                  │
│  ├─ Purpose: Express business intent                            │
│  ├─ Contains: Zero logic, zero implementation                   │
│  ├─ Uses: Intent-based methods from UI/API layers              │
│  └─ Example: await userPage.login(email, password)             │
│                                                                 │
│  🎨 UI LAYER                                                    │
│  ├─ Purpose: Handle user interactions                           │
│  ├─ Contains: Locators, page actions                            │
│  ├─ Validates: Via UI only (visual checks)                      │
│  └─ Example: await expect(element).toBeVisible()               │
│                                                                 │
│  📦 API LAYER                                                   │
│  ├─ Purpose: Manage data operations                             │
│  ├─ Contains: Service clients, request builders                 │
│  ├─ Handles: CRUD operations, data setup/teardown              │
│  └─ Example: await client.createUser(data)                     │
│                                                                 │
│  ✅ VALIDATORS                                                  │
│  ├─ Purpose: Shared validation logic                            │
│  ├─ Contains: Data format, schema, business rules               │
│  ├─ Used by: Both API and UI layers                             │
│  └─ Example: UserValidator.validateEmail(email)                │
│                                                                 │
│  ⚙️  CORE UTILITIES                                             │
│  ├─ Purpose: Framework infrastructure                           │
│  ├─ Contains: Config, logger, retries, context                  │
│  ├─ Access: Framework-only (not from tests)                     │
│  └─ Example: config.getBaseURL()                               │
│                                                                 │
│  🔧 FIXTURES                                                    │
│  ├─ Purpose: Test isolation and setup                           │
│  ├─ Contains: Browser fixtures, auth setup, cleanup             │
│  ├─ Ensures: Each test runs independently                       │
│  └─ Example: test.afterEach cleanup                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Tool Migration Path

```
┌─────────────────────────────────────────────────────────────────┐
│              FRAMEWORK ABSTRACTION BENEFITS                     │
└─────────────────────────────────────────────────────────────────┘

Current: Playwright                 Future: Cypress (if needed)

┌──────────────────┐               ┌──────────────────┐
│   Tests          │               │   Tests          │
│   (Unchanged)    │ ◄───────────► │   (Unchanged)    │
└────────┬─────────┘               └────────┬─────────┘
         │                                  │
         ▼                                  ▼
┌──────────────────┐               ┌──────────────────┐
│  BasePage        │               │  BasePage        │
│  (Playwright)    │               │  (Cypress impl)  │
└──────────────────┘               └──────────────────┘
         │                                  │
         ▼                                  ▼
┌──────────────────┐               ┌──────────────────┐
│  BaseAPIClient   │               │  BaseAPIClient   │
│  (Playwright)    │               │  (Cypress impl)  │
└──────────────────┘               └──────────────────┘

Only BasePage and BaseAPIClient need updating!
All tests remain the same due to abstraction.
```

---

This visual architecture matches your uploaded diagram and provides a comprehensive view of the framework structure and data flow.
