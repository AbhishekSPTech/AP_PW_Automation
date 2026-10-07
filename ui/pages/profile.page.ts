// Profile Page Model
// Handles employee Personal Details UI interactions

// UI Layer - User Actions (validates via UI only)


import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { createLogger } from '../../core/logger';
import { config } from '../../core/config';
import { EmployeeModel } from '../../api/models/employee.model';
import { Locators } from '../locators';

const logger = createLogger('ProfilePage');

export class ProfilePage extends BasePage {
  // Locators — sourced from central locators.ts
  private readonly pageHeading = this.page.getByRole(Locators.profile.pageHeading.role, { name: Locators.profile.pageHeading.name });
  private readonly nameDisplay = this.page.locator(Locators.profile.nameDisplay);
  private readonly firstNameInput = this.page.locator(Locators.profile.firstNameInput);
  private readonly lastNameInput = this.page.locator(Locators.profile.lastNameInput);

  constructor(page: Page) {
    super(page);
  }

  // Navigate to a specific employee's Personal Details page

  async navigateToEmployee(empNumber: number): Promise<void> {
    logger.logStep('Navigate to employee profile', { empNumber });
    await this.goto(config.getRoute('employeeProfile').replace('{empNumber}', String(empNumber)));
    await this.waitForPageLoad();
  }

  //  Verify profile page is loaded

  async verifyLoaded(): Promise<void> {
    logger.logStep('Verify profile page loaded');
    await expect(this.pageHeading).toBeVisible();
    await expect(this.nameDisplay).toBeVisible();
  }

  // Verify employee details on profile page

  async verifyEmployeeDetails(employee: EmployeeModel): Promise<void> {
    logger.logStep('Verify employee details', { empNumber: employee.empNumber });
    await expect(this.nameDisplay).toHaveText(`${employee.firstName} ${employee.lastName}`);
    await expect(this.firstNameInput).toHaveValue(employee.firstName);
    await expect(this.lastNameInput).toHaveValue(employee.lastName);
  }

  // Get displayed employee name

  async getDisplayedName(): Promise<string> {
    return await this.getText(this.nameDisplay);
  }
}
