// Dashboard Page Model
// Handles dashboard UI interactions

// UI Layer - User Actions (validates via UI only)

import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { createLogger } from '../../core/logger';

const logger = createLogger('DashboardPage');

export class DashboardPage extends BasePage {
  // Locators — sourced from central locators.ts (self-healing)
  private readonly profilePicture = this.loc('dashboard.profilePicture');
  private readonly myInfoLink = this.loc('dashboard.myInfoLink');

  constructor(page: Page) {
    super(page);
  }


  // Verify user is logged in (dashboard loaded)

  async verifyLoggedIn(): Promise<void> {
    logger.logStep('Verify user is logged in');
    await expect(await this.resolve(this.profilePicture)).toBeVisible();
  }


  // Navigate to profile page

  async goToProfile(): Promise<void> {
    logger.logStep('Navigate to profile page');
    await this.click(this.myInfoLink);
    await this.waitForPageLoad();
  }
}
