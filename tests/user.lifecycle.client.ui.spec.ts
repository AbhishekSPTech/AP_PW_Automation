//User Lifecycle Test
//Tests complete user lifecycle(create, verify, update, delete)

//Business Flow - Data via API, Validation via UI

import { test, expect } from '@playwright/test';
import { UserClient } from '../api/clients/user.client';
import { UserPage } from '../ui/models/user.model';
import { UserBuilder } from '../api/models/user.model';
import { UserValidator } from '../validators/user.validator';
import { TEST_PASSWORD, WEAK_PASSWORD, STRONG_PASSWORD } from '../fixtures/test-data';

test.describe('User Lifecycle', () => {
  let userClient: UserClient;
  let userPage: UserPage;
  let testUserId: string;

  test.beforeEach(async ({ request, page }) => {
    userClient = new UserClient(request);
    userPage = new UserPage(page);
  });

  test.afterEach(async () => {
    // Cleanup - Delete created user via API
    if (testUserId) {
      try {
        await userClient.deleteUser(testUserId);
      } catch (error) {
        console.log('Cleanup error (user may not exist):', error);
      }
    }
  });

  test('should create user via API and verify via UI', async () => {
    // Arrange - Create test data
    const userData = UserBuilder.createRandomUser();

    // Act - Setup data via API
    const createdUser = await userClient.createUser({
      email: userData.email,
      name: userData.name,
      password: TEST_PASSWORD,
    });

    testUserId = createdUser.id;

    // Validate data
    UserValidator.validate(createdUser);

    // Act - Verify via UI
    await userPage.navigateToProfile();

    // Assert - Validates via UI only
    await userPage.verifyUserDetails(createdUser);
  });

  test('should update user via API and verify changes via UI', async () => {
    // Arrange - Create user via API
    const userData = UserBuilder.createRandomUser();
    const createdUser = await userClient.createUser({
      email: userData.email,
      name: userData.name,
      password: TEST_PASSWORD,
    });

    testUserId = createdUser.id;

    // Act - Update user via API
    const updatedName = `Updated ${userData.name}`;
    const updatedUser = await userClient.updateUser(testUserId, {
      name: updatedName,
    });

    // Validate update
    expect(updatedUser.name).toBe(updatedName);

    // Act - Verify via UI
    await userPage.navigateToProfile();

    // Assert - Validates via UI only
    const displayedName = await userPage.getDisplayedUserName();
    expect(displayedName).toBe(updatedName);
  });

  test('should retrieve user by email via API', async () => {
    // Arrange - Create user via API
    const userData = UserBuilder.createRandomUser();
    const createdUser = await userClient.createUser({
      email: userData.email,
      name: userData.name,
      password: TEST_PASSWORD,
    });

    testUserId = createdUser.id;

    // Act - Retrieve user by email via API
    const retrievedUser = await userClient.getUserByEmail(userData.email);

    // Assert - API response validation
    expect(retrievedUser.id).toBe(createdUser.id);
    expect(retrievedUser.email).toBe(userData.email);
    UserValidator.validate(retrievedUser);
  });

  test('should validate email format', async () => {
    // Arrange
    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'user@',
      'user@.com',
    ];

    // Act & Assert
    for (const email of invalidEmails) {
      const isValid = UserValidator.validateEmail(email);
      expect(isValid).toBe(false);
    }
  });

  test('should validate password strength', async () => {
    // Arrange
    const weakPassword = WEAK_PASSWORD;
    const strongPassword = STRONG_PASSWORD;

    // Act
    const weakResult = UserValidator.validatePassword(weakPassword);
    const strongResult = UserValidator.validatePassword(strongPassword);

    // Assert
    expect(weakResult.isValid).toBe(false);
    expect(weakResult.errors.length).toBeGreaterThan(0);
    expect(strongResult.isValid).toBe(true);
    expect(strongResult.errors.length).toBe(0);
  });
});
