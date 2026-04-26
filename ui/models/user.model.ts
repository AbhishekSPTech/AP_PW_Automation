/**
 * User Page Model
 * Handles user-related UI interactions
 * 
 * UI Layer - User Actions (validates via UI only)
 */

import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { createLogger } from '../../core/logger';
import { UserModel } from '../../api/models/user.model';

const logger = createLogger('UserPage');

export class UserPage extends BasePage {
  // Locators
  private readonly emailInput = this.page.locator('#email');
  private readonly UsernameInput = this.page.getByRole('textbox', { name: 'Username' });
  private readonly passwordInput = this.page.getByRole('textbox', { name: 'Password' });
  private readonly nameInput = this.page.locator('#name');
  private readonly loginButton = this.page.locator('button[type="submit"]');
  private readonly profileLink = this.page.getByRole('banner').getByRole('img', { name: 'profile picture' });
  private readonly userNameDisplay = this.page.locator('[data-testid="user-name"]');
  private readonly userEmailDisplay = this.page.locator('[data-testid="user-email"]');
  private readonly userRoleDisplay = this.page.locator('[data-testid="user-role"]');
  private readonly editProfileButton = this.page.locator('button:has-text("Edit Profile")');
  private readonly saveButton = this.page.locator('button:has-text("Save")');
  private readonly successMessage = this.page.locator('[data-testid="success-message"]');
  private readonly errorMessage = this.page.locator('[data-testid="error-message"]');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    logger.logStep('Navigate to login page');
    await this.goto('/web/index.php/auth/login');
    await this.waitForPageLoad();
  }

  /**
   * Login with credentials
   */
  async login(Username: string, password: string): Promise<void> {
    logger.logStep('Login user', { Username });

    await this.fill(this.UsernameInput, Username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to profile page
   */
  async navigateToProfile(): Promise<void> {
    logger.logStep('Navigate to profile page');
    await this.click(this.profileLink);
    await this.waitForPageLoad();
  }

  /**
   * Verify user is logged in
   */
  async verifyLoggedIn(): Promise<void> {
    logger.logStep('Verify user is logged in');
    await expect(this.profileLink).toBeVisible();
  }

  /**
   * Verify user details on profile page
   */
  async verifyUserDetails(user: UserModel): Promise<void> {
    logger.logStep('Verify user details', { userId: user.id });

    // Validate via UI only
    await expect(this.userNameDisplay).toHaveText(user.name);
    await expect(this.userEmailDisplay).toHaveText(user.email);
    await expect(this.userRoleDisplay).toHaveText(user.role);
  }

  /**
   * Update user name
   */
  async updateUserName(newName: string): Promise<void> {
    logger.logStep('Update user name', { newName });

    await this.click(this.editProfileButton);
    await this.fill(this.nameInput, newName);
    await this.click(this.saveButton);
    await this.waitForPageLoad();
  }

  /**
   * Verify success message
   */
  async verifySuccessMessage(expectedMessage: string): Promise<void> {
    logger.logStep('Verify success message');
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText(expectedMessage);
  }

  /**
   * Verify error message
   */
  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    logger.logStep('Verify error message');
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedMessage);
  }

  /**
   * Get displayed user name
   */
  async getDisplayedUserName(): Promise<string> {
    return await this.getText(this.userNameDisplay);
  }

  /**
   * Get displayed user email
   */
  async getDisplayedUserEmail(): Promise<string> {
    return await this.getText(this.userEmailDisplay);
  }

  /**
   * Verify login form is visible
   */
  async verifyLoginFormVisible(): Promise<void> {
    logger.logStep('Verify login form is visible');
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Verify profile page is loaded
   */
  async verifyProfilePageLoaded(): Promise<void> {
    logger.logStep('Verify profile page is loaded');
    await expect(this.userNameDisplay).toBeVisible();
    await expect(this.userEmailDisplay).toBeVisible();
  }
}
