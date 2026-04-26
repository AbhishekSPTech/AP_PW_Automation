@echo off
echo ========================================
echo Playwright SDET Framework Setup
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Installing Playwright browsers...
call npx playwright install

echo.
echo Step 3: Creating auth directory...
if not exist "fixtures\auth" mkdir "fixtures\auth"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To run tests:
echo   npm test
echo.
echo To run in UI mode:
echo   npm test -- --ui
echo.
echo To run specific test:
echo   npm test -- login.flow.spec.ts
echo.
pause
