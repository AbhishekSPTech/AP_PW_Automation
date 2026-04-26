# Getting Started Guide

## Prerequisites

- Node.js 18+ installed
- Git installed
- Basic understanding of TypeScript
- Basic understanding of Playwright

## Installation

### 1. Clone or Download the Framework

```bash
# If using Git
git clone <repository-url>
cd playwright-sdet-framework

# Or download and extract the ZIP file
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```

## Configuration

### 1. Environment Setup

The framework uses environment-specific configuration files located in the `env/` directory:

- `.env.dev` - Development environment
- `.env.qa` - QA environment
- `.env.prod` - Production environment

**Update the environment files** with your actual URLs and credentials:

```bash
# env/.env.qa
BASE_URL=https://your-qa-url.com
API_URL=https://api.your-qa-url.com

CLIENT_USER_EMAIL=your-test-email@example.com
CLIENT_USER_PASSWORD=your-test-password
```

### 2. Authentication Setup

Update the auth setup fixture to match your application's login flow:

```typescript
// fixtures/auth.setup.ts
setup('authenticate client user', async ({ page }) => {
  await page.goto(`${config.getBaseURL()}/login`);
  
  // Update these selectors to match your app
  await page.locator('#email').fill(credentials.email);
  await page.locator('#password').fill(credentials.password);
  await page.locator('button[type="submit"]').click();
  
  // Update this to match your post-login URL
  await page.waitForURL('**/dashboard');
});
```

## Running Tests

### Basic Commands

```bash
# Run all tests in QA environment (default)
npm test

# Run in specific environment
ENV=dev npm test
ENV=prod npm test

# Run with UI mode (interactive)
npm test -- --ui

# Run in headed mode (see browser)
npm test -- --headed

# Run specific test file
npm test -- login.flow.spec.ts

# Run tests matching pattern
npm test -- user
```

### Project-Specific Runs

```bash
# Run only client UI tests on Chrome
npm test -- --project="client chromium"

# Run only API tests
npm test -- --project="api tests"

# Run on all browsers
npm test -- --project="client chromium" --project="client firefox" --project="client webkit"
```

### Debug Mode

```bash
# Debug a specific test
npm test -- login.flow.spec.ts --debug

# Run with Playwright Inspector
PWDEBUG=1 npm test
```

### View Reports

```bash
# View HTML report after test run
npx playwright show-report

# Generate and view Allure report
npm run report:allure
```

## Writing Your First Test

### 1. Create a Page Model

Create a new page model in `ui/models/`:

```typescript
// ui/models/product.model.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class ProductPage extends BasePage {
  // Locators
  private readonly productTitle = this.page.locator('[data-testid="product-title"]');
  private readonly addToCartButton = this.page.locator('button:has-text("Add to Cart")');
  
  constructor(page: Page) {
    super(page);
  }

  async navigateToProduct(productId: string): Promise<void> {
    await this.goto(`/products/${productId}`);
    await this.waitForPageLoad();
  }

  async addToCart(): Promise<void> {
    await this.click(this.addToCartButton);
  }

  async verifyProductTitle(expectedTitle: string): Promise<void> {
    await expect(this.productTitle).toHaveText(expectedTitle);
  }
}
```

### 2. Create an API Client

Create a new API client in `api/clients/`:

```typescript
// api/clients/product.client.ts
import { APIRequestContext } from '@playwright/test';
import { BaseAPIClient } from '../base.client';

export interface Product {
  id: string;
  name: string;
  price: number;
}

export class ProductClient extends BaseAPIClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async getProduct(productId: string): Promise<Product> {
    const response = await this.get(`/products/${productId}`);
    this.verifyStatus(response, 200);
    return await this.parseJSON<Product>(response);
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await this.post('/products', { data: productData });
    this.verifyStatus(response, 201);
    return await this.parseJSON<Product>(response);
  }
}
```

### 3. Write Your Test

Create a test file in `tests/`:

```typescript
// tests/product.client.spec.ts
import { test, expect } from '@playwright/test';
import { ProductPage } from '../ui/models/product.model';
import { ProductClient } from '../api/clients/product.client';

test.describe('Product Tests', () => {
  let productPage: ProductPage;
  let productClient: ProductClient;

  test.beforeEach(async ({ page, request }) => {
    productPage = new ProductPage(page);
    productClient = new ProductClient(request);
  });

  test('should display product details', async () => {
    // Arrange - Create product via API
    const product = await productClient.createProduct({
      name: 'Test Product',
      price: 99.99,
    });

    // Act - Navigate to product page
    await productPage.navigateToProduct(product.id);

    // Assert - Verify via UI
    await productPage.verifyProductTitle(product.name);
  });
});
```

### 4. Run Your Test

```bash
npm test -- product.client.spec.ts
```

## Project Structure Quick Reference

```
playwright-sdet-framework/
├── api/                    # API Layer - Data Control
│   ├── clients/           # Service clients
│   ├── models/            # Data models
│   └── base.client.ts     # Base API client
│
├── ui/                     # UI Layer - User Actions
│   ├── models/            # Page models
│   └── base.page.ts       # Base page
│
├── validators/            # Shared validation logic
│
├── core/                  # Core utilities (framework-only)
│   ├── config.ts
│   ├── logger.ts
│   ├── retries.ts
│   └── test-context.ts
│
├── tests/                 # Test scenarios
│   ├── *.client.spec.ts  # UI tests
│   └── *.api.spec.ts     # API tests
│
├── fixtures/              # Test fixtures
│   ├── auth.setup.ts
│   ├── browser.fixture.ts
│   └── test.context.ts
│
└── env/                   # Environment configs
    ├── .env.dev
    ├── .env.qa
    └── .env.prod
```

## Key Concepts

### 1. Intent-Based Tests
Tests express **what** to do, not **how**:

```typescript
// ✅ Good
await userPage.login(email, password);

// ❌ Bad
await page.fill('#email', email);
await page.click('button');
```

### 2. Data via API, Validation via UI
- Use API to **setup** and **teardown** data
- Use UI to **verify** what users see

```typescript
// Setup via API
const user = await userClient.createUser(userData);

// Verify via UI
await userPage.verifyUserDetails(user);

// Cleanup via API
await userClient.deleteUser(user.id);
```

### 3. Test Isolation
Each test should be independent:

```typescript
test.afterEach(async () => {
  // Always cleanup
  await client.deleteTestData(testId);
});
```

## Troubleshooting

### Tests Failing Due to Selectors

Update selectors in page models to match your application:

```typescript
// ui/models/user.model.ts
private readonly loginButton = this.page.locator('button[type="submit"]');
// Change to match your app's selector
```

### Authentication Issues

1. Check environment variables in `env/.env.qa`
2. Update `fixtures/auth.setup.ts` to match your login flow
3. Verify the storage state file is created: `fixtures/auth/client.user.json`

### API Endpoint Errors

1. Verify `API_URL` in environment file
2. Check API client endpoints match your backend
3. Enable debug logging: `LOG_LEVEL=debug npm test`

## Next Steps

1. ✅ Read [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture guide
2. ✅ Review example tests in `tests/` directory
3. ✅ Customize page models for your application
4. ✅ Add API clients for your services
5. ✅ Write your own tests following the framework patterns

## Getting Help

- Review example tests
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for design patterns
- Enable debug logging: `LOG_LEVEL=debug`
- Use Playwright UI mode: `npm test -- --ui`

## Best Practices Checklist

- [ ] Tests use intent-based methods (not selectors)
- [ ] Data setup/teardown via API
- [ ] UI used only for validation
- [ ] Each test is independent
- [ ] Cleanup happens in afterEach
- [ ] Page models contain no business logic
- [ ] Selectors use data-testid where possible
- [ ] Tests run in multiple environments (dev/qa/prod)

Happy Testing! 🚀
