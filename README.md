# AP_PW_Automation
# Playwright Test Automation -- Onboarding & Execution Guide

This repository contains an end-to-end **Playwright Test Automation
Framework** designed for UI and API testing with CI support.

This README helps new team members quickly understand: - Project
structure - How to run tests - Environment handling - Commenting
standards - Best practices

------------------------------------------------------------------------

## Project Overview

This automation framework supports:

-   UI testing on **Chromium, Firefox, WebKit**
-   API / service-level testing
-   Environment-based execution (`qa`, `staging`, `prod`)
-   Authentication reuse via `storageState`
-   CI-friendly execution with retries and reports

------------------------------------------------------------------------

## Folder Structure

    ├── env/
    │   ├── .env.qa
    │   ├── .env.staging
    │   └── .env.prod
    │
    ├── tests/
    │   ├── auth/
    │   │   └── storage/
    │   │       └── client.user.json
    │   │
    │   ├── setup/
    │   │   ├── login.client.setup.ts
    │   │   └── services.setup.ts
    │   │
    │   ├── client/
    │   │   └── example.client.spec.ts
    │   │
    │   └── services/
    │       └── quote.service.quote.spec.ts
    │
    ├── playwright.config.ts
    └── test-results/

------------------------------------------------------------------------

## Environment Configuration

The framework loads environment variables dynamically using the `ENV`
variable.

### Available Environments

-   `qa` (default)
-   `staging`
-   `prod`

### Usage

``` bash
ENV=qa npx playwright test
```

If `ENV` is not provided, the framework **defaults to `qa`**.

------------------------------------------------------------------------

## Running Tests

### Run all tests

``` bash
npx playwright test
```

### Run tests in a specific environment

``` bash
ENV=staging npx playwright test
```

### Run a specific project

``` bash
npx playwright test --project="client chromium"
```

### Run a single test file

``` bash
npx playwright test tests/client/example.client.spec.ts
```

### Run in headed mode

``` bash
npx playwright test --headed
```

------------------------------------------------------------------------

## Authentication Strategy

Authentication is handled once and reused across all UI tests using
`storageState`.

------------------------------------------------------------------------

## Reports & Debugging

-   HTML report for local runs
-   JUnit report for CI
-   Screenshots, videos, and traces captured on failure

------------------------------------------------------------------------

## Commenting Standards

### File-Level Doc Comment (Required)

``` ts
/**
 * Feature: Client Quote Flow
 * Purpose: Validate end-to-end quote creation for logged-in users
 * Author: QA Automation Team
 */
```

------------------------------------------------------------------------

## Best Practices

-   Keep tests independent
-   Prefer API setup
-   Avoid hard waits
-   Write clear test names

------------------------------------------------------------------------

## Getting Started Checklist

-   [ ] Install dependencies
-   [ ] Verify environment file
-   [ ] Run setup tests
-   [ ] Execute UI tests
