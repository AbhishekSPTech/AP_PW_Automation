// Login Page Model
// Handles login/authentication UI interactions

// UI Layer - User Actions (validates via UI only)

import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { createLogger } from '../../core/logger';
import { Locators } from '../locators';

const logger = createLogger('LoginPage');

export class LoginPage extends BasePage {
    // Locators — sourced from central locators.ts
    private readonly usernameInput = this.page.getByRole(Locators.login.usernameInput.role, { name: Locators.login.usernameInput.name });
    private readonly passwordInput = this.page.getByRole(Locators.login.passwordInput.role, { name: Locators.login.passwordInput.name });
    private readonly submitButton = this.page.locator(Locators.login.submitButton);
    private readonly errorMessage = this.page.locator(Locators.common.errorMessage);

    constructor(page: Page) {
        super(page);
    }

    // Navigate to login page
    async navigate(): Promise<void> {
        logger.logStep('Navigate to login page');
        await this.goto('/web/index.php/auth/login');
        await this.waitForPageLoad();
    }

    // Login with credentials
    async login(username: string, password: string): Promise<void> {
        logger.logStep('Login user', { username });
        await this.fill(this.usernameInput, username);
        await this.fill(this.passwordInput, password);
        await this.click(this.submitButton);
        await this.waitForPageLoad();
    }

    // Verify login form elements are visible
    async verifyLoginFormVisible(): Promise<void> {
        logger.logStep('Verify login form visible');
        await expect(this.usernameInput).toBeVisible();
        await expect(this.passwordInput).toBeVisible();
        await expect(this.submitButton).toBeVisible();
    }

    // Verify error message on login failure
    async verifyErrorMessage(expectedMessage: string): Promise<void> {
        logger.logStep('Verify error message');
        await expect(this.errorMessage).toBeVisible();
        await expect(this.errorMessage).toContainText(expectedMessage);
    }
}