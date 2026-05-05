// Dashboard Page Model
// Handles dashboard UI interactions

// UI Layer - User Actions (validates via UI only)

import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { createLogger } from '../../core/logger';
import { Locators } from '../locators';

const logger = createLogger('DashboardPage');

export class DashboardPage extends BasePage {
  // Locators — sourced from central locators.ts
  private readonly profilePicture = this.page.getByRole('banner').getByRole('img', { name: Locators.dashboard.profilePicture.name });

  constructor(page: Page) {
    super(page);
  }


  // Verify user is logged in (dashboard loaded)

  async verifyLoggedIn(): Promise<void> {
    logger.logStep('Verify user is logged in');
    await expect(this.profilePicture).toBeVisible();
  }


  // Navigate to profile page

  async goToProfile(): Promise<void> {
    logger.logStep('Navigate to profile page');
    await this.click(this.profilePicture);
    await this.waitForPageLoad();
  }
}