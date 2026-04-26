/**
 * Base Page Model
 * Provides common functionality for all page models
 * 
 * UI Layer - User Actions
 */

import { Page, Locator } from '@playwright/test';
import { createLogger } from '../core/logger';
import { config } from '../core/config';

const logger = createLogger('BasePage');

export class BasePage {
  protected page: Page;
  protected baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = config.getBaseURL();
  }

  /**
   * Navigate to URL
   */
  async goto(path: string = ''): Promise<void> {
    const url = `${this.baseURL}${path}`;
    logger.info(`Navigating to: ${url}`);
    await this.page.goto(url);
  }

  /**
   * Wait for page load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  getCurrentURL(): string {
    return this.page.url();
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'hidden' });
  }

  /**
   * Click element
   */
  async click(locator: Locator): Promise<void> {
    await this.waitForVisible(locator);
    await locator.click();
  }

  /**
   * Fill input field
   */
  async fill(locator: Locator, value: string): Promise<void> {
    await this.waitForVisible(locator);
    await locator.fill(value);
  }

  /**
   * Type into input field
   */
  async type(locator: Locator, value: string): Promise<void> {
    await this.waitForVisible(locator);
    await locator.type(value);
  }

  /**
   * Get text content
   */
  async getText(locator: Locator): Promise<string> {
    await this.waitForVisible(locator);
    return (await locator.textContent()) || '';
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  /**
   * Select dropdown option
   */
  async selectOption(locator: Locator, value: string): Promise<void> {
    await this.waitForVisible(locator);
    await locator.selectOption(value);
  }

  /**
   * Check checkbox
   */
  async check(locator: Locator): Promise<void> {
    await this.waitForVisible(locator);
    if (!(await locator.isChecked())) {
      await locator.check();
    }
  }

  /**
   * Uncheck checkbox
   */
  async uncheck(locator: Locator): Promise<void> {
    await this.waitForVisible(locator);
    if (await locator.isChecked()) {
      await locator.uncheck();
    }
  }

  /**
   * Take screenshot
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
    logger.info(`Screenshot saved: ${name}.png`);
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }
}
