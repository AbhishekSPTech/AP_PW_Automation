// Profile Page Model
// Handles user profile UI interactions

// UI Layer - User Actions (validates via UI only)


import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { createLogger } from '../../core/logger';
import { UserModel } from '../../api/models/user.model';
import { Locators } from '../locators';

const logger = createLogger('ProfilePage');

export class ProfilePage extends BasePage {
  // Locators — sourced from central locators.ts
  private readonly nameDisplay = this.page.locator(Locators.profile.nameDisplay);
  private readonly emailDisplay = this.page.locator(Locators.profile.emailDisplay);
  private readonly roleDisplay = this.page.locator(Locators.profile.roleDisplay);
  private readonly nameInput = this.page.locator(Locators.profile.nameInput);
  private readonly editButton = this.page.locator(Locators.profile.editButton);
  private readonly saveButton = this.page.locator(Locators.profile.saveButton);
  private readonly successMessage = this.page.locator(Locators.common.successMessage);
  private readonly errorMessage = this.page.locator(Locators.common.errorMessage);

  constructor(page: Page) {
    super(page);
  }

  //  Verify profile page is loaded

  async verifyLoaded(): Promise<void> {
    logger.logStep('Verify profile page loaded');
    await expect(this.nameDisplay).toBeVisible();
    await expect(this.emailDisplay).toBeVisible();
  }

  // Verify user details on profile page

  async verifyUserDetails(user: UserModel): Promise<void> {
    logger.logStep('Verify user details', { userId: user.id });
    await expect(this.nameDisplay).toHaveText(user.name);
    await expect(this.emailDisplay).toHaveText(user.email);
    await expect(this.roleDisplay).toHaveText(user.role);
  }

  //Update user name via UI

  async updateUserName(newName: string): Promise<void> {
    logger.logStep('Update user name', { newName });
    await this.click(this.editButton);
    await this.fill(this.nameInput, newName);
    await this.click(this.saveButton);
    await this.waitForPageLoad();
  }

  // Verify success message

  async verifySuccessMessage(expectedMessage: string): Promise<void> {
    logger.logStep('Verify success message');
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText(expectedMessage);
  }

  // Verify error message

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    logger.logStep('Verify error message');
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedMessage);
  }

  // Get displayed user name

  async getDisplayedUserName(): Promise<string> {
    return await this.getText(this.nameDisplay);
  }

  // Get displayed user email

  async getDisplayedUserEmail(): Promise<string> {
    return await this.getText(this.emailDisplay);
  }
}