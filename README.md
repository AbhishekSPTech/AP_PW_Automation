# Playwright SDET Framework

A Playwright + TypeScript testing framework following clean architecture principles, with clear separation of concerns and self-healing UI locators.

> This README is mirrored in [framework_guide/README.md](framework_guide/README.md). Keep both in sync.

## 📚 Documentation

| Guide | What it covers |
|---|---|
| [Getting Started](framework_guide/GETTING_STARTED.md) | First-time setup walkthrough |
| [Quick Reference](framework_guide/QUICK_REFERENCE.md) | Commands, conventions and patterns at a glance |
| [Architecture](framework_guide/ARCHITECTURE.md) | Layer responsibilities and design decisions |
| [Visual Architecture](framework_guide/VISUAL_ARCHITECTURE.md) | Diagrams of data flow and layer communication |
| [Self-Healing Locators](framework_guide/SELF_HEALING.md) | Runtime locator repair, AI providers, `heal:report` / `heal:apply` |
| [Migration Guide](framework_guide/MIGRATION_GUIDE.md) | Moving an existing Playwright setup onto this framework |
| [Troubleshooting Imports](framework_guide/TROUBLESHOOTING_IMPORTS.md) | Quick fixes for import and path errors |
| [Claude Code Setup](CLAUDE_SETUP.md) | Using Claude Code with this repository |

## Architecture Principles

✅ **No duplicated layers** - Each layer has a single responsibility  
✅ **Tests contain zero logic** - Business logic lives in the framework  
✅ **UI never manages data** - Data operations happen in the API layer  
✅ **Fixtures enforce isolation** - Each test runs independently  
✅ **Utilities are framework-only** - Test files use only intent-based methods  
✅ **Locators heal themselves** - UI changes are repaired at runtime and proposed as code fixes  
✅ **Switching Playwright → Cypress later is feasible** - Framework abstraction allows tool changes

## Project Structure

```
AP_PW_Automation/
│
├── api/                              # API Layer (Data Control)
│   ├── base.client.ts                # Shared HTTP verbs, retries, status checks
│   ├── clients/
│   │   ├── auth.client.ts
│   │   ├── employee.client.ts        # OrangeHRM PIM employee API
│   │   ├── order.client.ts
│   │   └── user.client.ts
│   └── models/
│       ├── employee.model.ts
│       └── user.model.ts
│
├── ui/                               # UI Layer (User Actions)
│   ├── base.page.ts                  # Actions + self-healing hooks (loc / resolve)
│   ├── locators.ts                   # Centralized locators (single source of truth)
│   ├── models/
│   │   └── user.model.ts             # UserPage facade over the page objects
│   └── pages/
│       ├── dashboard.page.ts
│       ├── login.page.ts
│       └── profile.page.ts
│
├── validators/                       # Shared Zod validation (API + UI)
│   ├── employee.validator.ts
│   ├── order.validator.ts
│   └── user.validator.ts
│
├── core/                             # Framework internals - not imported by tests
│   ├── config.ts                     # Env loading, routes, timeouts, healing settings
│   ├── logger.ts                     # Logging (Pino)
│   ├── retries.ts                    # Retry logic
│   ├── test-context.ts               # Test context
│   └── healing/                      # Self-healing locator engine
│       ├── candidates.ts             # DOM candidate extraction
│       ├── scorer.ts                 # Local ranking
│       ├── healer.ts                 # Orchestration + heal report
│       └── providers/                # Claude / OpenAI adapters
│
├── tests/                            # Test Scenarios (Business Flow)
│   ├── login.flow.ui.spec.ts
│   ├── user.api.spec.ts
│   └── user.lifecycle.client.ui.spec.ts
│
├── fixtures/                         # Test Fixtures
│   ├── auth.setup.ts                 # Logs in once, saves storage state
│   ├── browser.fixture.ts            # Browser context per test
│   ├── test.context.ts               # Cleanup hooks
│   └── test-data.ts                  # Shared test data
│
├── env/                              # Environment configs (.env.dev / .env.qa / .env.prod)
├── scripts/
│   └── apply-heals.mjs               # Review/apply healed locators
├── framework_guide/                  # Detailed documentation (see table above)
└── playwright.config.ts              # Projects, browsers, env loading
```

## Getting Started

```bash
npm install
npx playwright install
npm test                  # QA environment by default
ENV=dev npm test          # or target dev / prod
```

The QA environment runs against the public [OrangeHRM demo](https://opensource-demo.orangehrmlive.com). See [Getting Started](framework_guide/GETTING_STARTED.md) for the full walkthrough.

## Common Commands

| Command | Purpose |
|---|---|
| `npm test` | Run all tests |
| `npm run test:client` | UI tests (Chromium) |
| `npm run test:api` | API tests only |
| `npm run test:headed` / `test:debug` / `test:ui` | Headed, debug or interactive UI mode |
| `npm run report` | Open the last HTML report |
| `npm run heal:report` / `heal:apply` | Review / apply self-healed locators |
| `npm run lint` / `format` | Lint and format |

## Writing Tests

Tests express **intent only**: data via API, verification via UI, no selectors or HTTP calls:

```typescript
test('should create employee via API and verify via UI', async ({ request, page }) => {
  const employeeClient = new EmployeeClient(request);
  const userPage = new UserPage(page);

  // Arrange - data via API
  const employee = await employeeClient.createEmployee(EmployeeBuilder.createRandomEmployee());

  // Act + Assert - verify via UI
  await userPage.navigateToEmployeeProfile(employee.empNumber);
  await userPage.verifyEmployeeDetails(employee);

  // Cleanup - via API
  await employeeClient.deleteEmployee(employee.empNumber);
});
```

## Self-Healing Locators

When the UI changes and a locator stops matching, the framework finds the element it was meant to target (local matching first, then Claude or OpenAI vision), continues the test, and logs a proposed fix. Run `npm run heal:report` to review and `npm run heal:apply` to patch `ui/locators.ts`. See [Self-Healing Locators](framework_guide/SELF_HEALING.md).

## License

[MIT](LICENSE)
