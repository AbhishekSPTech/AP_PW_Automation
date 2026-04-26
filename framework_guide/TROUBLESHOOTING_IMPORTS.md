# Quick Fix for Import Errors

## Issue
Getting "Cannot find module" errors with relative imports.

## Solution 1: Use Direct Paths (Recommended for Quick Start)

The framework uses relative imports which work in TypeScript but need proper setup.

### Steps:

1. **Install dependencies first:**
```bash
npm install
```

2. **Ensure all dependencies are installed:**
```bash
npm install pino pino-pretty zod dotenv --save-dev
```

3. **Run tests:**
```bash
npx playwright test
```

## Solution 2: If Still Getting Errors

The issue is Windows path separators vs import statements. 

### Quick Fix:

Create a `.env` file in the root:
```env
NODE_OPTIONS=--experimental-specifier-resolution=node
```

### Or Update package.json scripts:

```json
{
  "scripts": {
    "test": "cross-env NODE_OPTIONS=--experimental-specifier-resolution=node playwright test",
    "test:headed": "cross-env NODE_OPTIONS=--experimental-specifier-resolution=node playwright test --headed"
  }
}
```

Install cross-env:
```bash
npm install cross-env --save-dev
```

## Solution 3: Simplified Import Structure

If you continue having issues, I can provide a simplified version where:
- All imports use explicit `.ts` extensions
- No path mapping needed
- Works out of the box

Let me know if you need this!

## Verify Setup

Run this to check everything is installed:

```bash
npm list pino pino-pretty zod dotenv @playwright/test
```

All should show installed versions.
