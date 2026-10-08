// Login Page Model
// Handles login/authentication UI interactions

// UI Layer - User Actions (validates via UI only)

import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { createLogger } from '../../core/logger';
import { config } from '../../core/config';

const logger = createLogger('LoginPage');

export class LoginPage extends BasePage {
    // Locators — sourced from central locators.ts (self-healing)
    private readonly usernameInput = this.loc('login.usernameInput');
    private readonly passwordInput = this.loc('login.passwordInput');
    private readonly submitButton = this.loc('login.submitButton');
    private readonly errorMessage = this.loc('common.errorMessage');

    constructor(page: Page) {
        super(page);
    }

    // Navigate to login page
    async navigate(): Promise<void> {
        logger.logStep('Navigate to login page');
        await this.goto(config.getRoute('login'));
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
        await expect(await this.resolve(this.usernameInput)).toBeVisible();
        await expect(await this.resolve(this.passwordInput)).toBeVisible();
        await expect(await this.resolve(this.submitButton)).toBeVisible();
    }

    // Verify error message on login failure
    async verifyErrorMessage(expectedMessage: string): Promise<void> {
        logger.logStep('Verify error message');
        const errorMessage = await this.resolve(this.errorMessage);
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText(expectedMessage);
    }
}
