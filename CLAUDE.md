# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run all tests (default: QA env)
npx playwright test

# Target a specific environment
ENV=dev npx playwright test
ENV=prod npx playwright test

# Run a single test file
npx playwright test tests/login.flow.ui.spec.ts

# Run only API tests or UI (client) tests
npm run test:api
npm run test:client

# Run in headed mode or debug mode
npm run test:headed
npm run test:debug

# Interactive UI mode (great for writing/debugging tests)
npm run test:ui

# Open last HTML report
npm run report

# Lint and format
npm run lint
npm run format
```

## Architecture

This is a **clean architecture Playwright + TypeScript** test framework. The core rule is strict layer separation — tests express *intent*, they never contain implementation details.

### Layer responsibilities

| Layer | Path | Responsibility |
|---|---|---|
| Tests | `tests/` | Business intent only (arrange/act/assert, no selectors or HTTP calls) |
| UI Pages | `ui/` | Browser interactions via named methods — no raw `page.fill()`/`page.click()` in tests |
| API Clients | `api/clients/` | All CRUD/data operations — the only layer that touches HTTP |
| Validators | `validators/` | Shared schema validation (Zod) used by both API and UI tests |
| Core | `core/` | Config, logger, retry utilities — **not imported by tests directly** |
| Fixtures | `fixtures/` | Auth setup + isolated browser context per test |

### Key architectural rules

1. **Data via API only.** Tests set up and tear down state through API clients, never through UI forms. UI tests only *verify* what is displayed.
2. **Tests contain zero logic.** Conditionals, loops, selectors, and retry logic belong in page models or API clients.
3. **Core utilities are framework-internal.** Tests access config/logger through fixtures or page models, never `import { config } from '../core/config'`.
4. **One browser context per test.** `fixtures/browser.fixture.ts` creates a fresh isolated context for every test; never share contexts or page objects across tests.

### Test file naming

- `*.api.spec.ts` — API-only tests (no browser)
- `*.client.ui.spec.ts` — UI tests on Chromium/Firefox/WebKit
- `*.mobile.spec.ts` — Mobile viewport tests
- `*.setup.ts` — Pre-suite auth/state setup (runs before test projects)

### Test execution order

The Playwright project graph enforces this sequence:
1. **`auth setup`** (`fixtures/auth.setup.ts`) — logs in via UI, saves storage state to `fixtures/auth/client.user.json`
2. **Client UI projects** (3 browsers) — consume the saved auth state
3. **API tests** — run independently, no browser

### Environment configuration

Environment files live in `env/.env.{dev,qa,prod}`. The active environment is selected via `ENV=<name>` (defaults to `qa`). `core/config.ts` is a singleton that loads the correct file at startup. Credentials, timeouts, and feature flags all come from these files — never hardcoded.

### Typical test pattern

```typescript
test('create user and verify in UI', async ({ page, request }) => {
  // 1. Arrange: create data via API
  const userData = UserBuilder.random();
  const user = await userClient.createUser(userData);

  // 2. Act: interact via UI
  await userPage.navigateToProfile();

  // 3. Assert: verify what the user sees
  await userPage.verifyUserDetails(user);

  // 4. Cleanup: always via API
  await userClient.deleteUser(user.id);
});
```

### Framework guides

Detailed documentation lives in `framework_guide/`:
- `ARCHITECTURE.md` — layer responsibilities and design decisions
- `GETTING_STARTED.md` — first-time setup walkthrough
- `QUICK_REFERENCE.md` — commands, conventions, and patterns at a glance
- `VISUAL_ARCHITECTURE.md` — diagrams of data flow and layer communication
