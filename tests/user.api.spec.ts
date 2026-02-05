/**
 * User API Test
 * Tests user API endpoints
 * 
 * Business Flow - API Only (No Browser)
 */

import { test, expect } from '@playwright/test';
import { UserClient } from '../api/clients/user.client';
import { AuthClient } from '../api/clients/auth.client';
import { UserBuilder } from '../api/models/user.model';
import { UserValidator } from '../validators/user.validator';
import { config } from '../core/config';

test.describe('User API Tests', () => {
  let userClient: UserClient;
  let authClient: AuthClient;
  let authToken: string;
  let createdUserIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    // Authenticate to get token
    authClient = new AuthClient(request);
    const credentials = config.getCredentials('clientUser');
    
    const authResponse = await authClient.login(credentials);
    authToken = authResponse.token;
  });

  test.beforeEach(async ({ request }) => {
    userClient = new UserClient(request, authToken);
  });

  test.afterEach(async () => {
    // Cleanup all created users
    for (const userId of createdUserIds) {
      try {
        await userClient.deleteUser(userId);
      } catch (error) {
        console.log('Cleanup error:', error);
      }
    }
    createdUserIds = [];
  });

  test('should create user via API', async () => {
    // Arrange
    const userData = UserBuilder.createRandomUser();

    // Act
    const createdUser = await userClient.createUser({
      email: userData.email,
      name: userData.name,
      password: 'Test@123',
    });

    createdUserIds.push(createdUser.id);

    // Assert
    expect(createdUser).toBeDefined();
    expect(createdUser.id).toBeTruthy();
    expect(createdUser.email).toBe(userData.email);
    expect(createdUser.name).toBe(userData.name);
    
    // Validate using validator
    UserValidator.validate(createdUser);
  });

  test('should get user by ID', async () => {
    // Arrange - Create user first
    const userData = UserBuilder.createRandomUser();
    const createdUser = await userClient.createUser({
      email: userData.email,
      name: userData.name,
      password: 'Test@123',
    });

    createdUserIds.push(createdUser.id);

    // Act
    const retrievedUser = await userClient.getUserById(createdUser.id);

    // Assert
    expect(retrievedUser.id).toBe(createdUser.id);
    expect(retrievedUser.email).toBe(createdUser.email);
    expect(retrievedUser.name).toBe(createdUser.name);
    
    UserValidator.validate(retrievedUser);
  });

  test('should update user', async () => {
    // Arrange - Create user first
    const userData = UserBuilder.createRandomUser();
    const createdUser = await userClient.createUser({
      email: userData.email,
      name: userData.name,
      password: 'Test@123',
    });

    createdUserIds.push(createdUser.id);

    // Act
    const updatedName = `Updated ${userData.name}`;
    const updatedUser = await userClient.updateUser(createdUser.id, {
      name: updatedName,
    });

    // Assert
    expect(updatedUser.id).toBe(createdUser.id);
    expect(updatedUser.name).toBe(updatedName);
    expect(updatedUser.email).toBe(createdUser.email);
    
    UserValidator.validate(updatedUser);
  });

  test('should delete user', async () => {
    // Arrange - Create user first
    const userData = UserBuilder.createRandomUser();
    const createdUser = await userClient.createUser({
      email: userData.email,
      name: userData.name,
      password: 'Test@123',
    });

    // Act
    await userClient.deleteUser(createdUser.id);

    // Assert - Verify user is deleted
    try {
      await userClient.getUserById(createdUser.id);
      throw new Error('User should have been deleted');
    } catch (error: any) {
      // Expected to fail with 404
      expect(error).toBeDefined();
    }
  });

  test('should get all users', async () => {
    // Arrange - Create multiple users
    const user1 = await userClient.createUser({
      email: 'user1@example.com',
      name: 'User One',
      password: 'Test@123',
    });

    const user2 = await userClient.createUser({
      email: 'user2@example.com',
      name: 'User Two',
      password: 'Test@123',
    });

    createdUserIds.push(user1.id, user2.id);

    // Act
    const allUsers = await userClient.getAllUsers();

    // Assert
    expect(allUsers).toBeDefined();
    expect(Array.isArray(allUsers)).toBe(true);
    expect(allUsers.length).toBeGreaterThanOrEqual(2);

    // Validate each user
    allUsers.forEach(user => UserValidator.validate(user));
  });

  test('should handle invalid email', async () => {
    // Arrange
    const userData = UserBuilder.createRandomUser();
    userData.email = 'invalid-email';

    // Act & Assert
    try {
      await userClient.createUser({
        email: userData.email,
        name: userData.name,
        password: 'Test@123',
      });
      throw new Error('Should have failed with invalid email');
    } catch (error) {
      // Expected to fail
      expect(error).toBeDefined();
    }
  });
});
