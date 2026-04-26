#!/bin/bash

echo "========================================"
echo "Playwright SDET Framework Setup"
echo "========================================"
echo ""

echo "Step 1: Installing dependencies..."
npm install

echo ""
echo "Step 2: Installing Playwright browsers..."
npx playwright install

echo ""
echo "Step 3: Creating auth directory..."
mkdir -p fixtures/auth

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To run tests:"
echo "  npm test"
echo ""
echo "To run in UI mode:"
echo "  npm test -- --ui"
echo ""
echo "To run specific test:"
echo "  npm test -- login.flow.spec.ts"
echo ""
