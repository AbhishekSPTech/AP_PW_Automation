/**
 * Login Flow Test
 * Tests user authentication flow
 * 
 * Business Flow - Uses Only Intent
 */

import { test, expect } from '@playwright/test';
import { UserPage } from '../ui/models/user.model';
import { config } from '../core/config';

test.describe('Login Flow', () => {
  let userPage: UserPage;

  test.beforeEach(async ({ page }) => {
    userPage = new UserPage(page);
  });

  test('should login successfully with valid credentials', async () => {
    // Arrange
    const credentials = config.getCredentials('clientUser');

    // Act
    await userPage.navigateToLogin();
    await userPage.login(credentials.email, credentials.password);

    // Assert - Validates via UI
    await userPage.verifyLoggedIn();
  });

  test('should show error for invalid credentials', async () => {
    // Act
    await userPage.navigateToLogin();
    await userPage.login('invalid@example.com', 'wrongpassword');

    // Assert - Validates via UI
    await userPage.verifyErrorMessage('Invalid email or password');
  });

  test('should navigate to profile after login', async () => {
    // Arrange
    const credentials = config.getCredentials('clientUser');

    // Act
    await userPage.navigateToLogin();
    await userPage.login(credentials.email, credentials.password);
    await userPage.navigateToProfile();

    // Assert - Validates via UI
    await userPage.verifyProfilePageLoaded();
  });

  test('should display login form elements', async () => {
    // Act
    await userPage.navigateToLogin();

    // Assert - Validates via UI
    await userPage.verifyLoginFormVisible();
  });
});
