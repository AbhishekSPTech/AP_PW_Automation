//  User Page Model
//  Handles user-related UI interactions

//  UI Layer - User Actions (validates via UI only)

//  NOTE: This class is kept for backwards compatibility.
//  It delegates internally to focused page classes:
//    - LoginPage     → ui/pages/login.page.ts
//    - DashboardPage → ui/pages/dashboard.page.ts
//    - ProfilePage   → ui/pages/profile.page.ts

//  New tests should import those classes directly.


import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { createLogger } from '../../core/logger';
import { EmployeeModel } from '../../api/models/employee.model';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { ProfilePage } from '../pages/profile.page';

const logger = createLogger('UserPage');

export class UserPage extends BasePage {
  // Delegate to focused page classes
  private readonly loginPage: LoginPage;
  private readonly dashboardPage: DashboardPage;
  private readonly profilePage: ProfilePage;

  constructor(page: Page) {
    super(page);
    this.loginPage = new LoginPage(page);
    this.dashboardPage = new DashboardPage(page);
    this.profilePage = new ProfilePage(page);
  }

  //Login actions (delegates to LoginPage)

  async navigateToLogin(): Promise<void> {
    await this.loginPage.navigate();
  }

  async login(username: string, password: string): Promise<void> {
    await this.loginPage.login(username, password);
  }

  async verifyLoginFormVisible(): Promise<void> {
    await this.loginPage.verifyLoginFormVisible();
  }

  //Dashboard actions (delegates to DashboardPage)

  async verifyLoggedIn(): Promise<void> {
    await this.dashboardPage.verifyLoggedIn();
  }

  async navigateToProfile(): Promise<void> {
    await this.dashboardPage.goToProfile();
  }

  //Profile actions (delegates to ProfilePage)

  async verifyProfilePageLoaded(): Promise<void> {
    await this.profilePage.verifyLoaded();
  }

  async navigateToEmployeeProfile(empNumber: number): Promise<void> {
    await this.profilePage.navigateToEmployee(empNumber);
  }

  async verifyEmployeeDetails(employee: EmployeeModel): Promise<void> {
    await this.profilePage.verifyEmployeeDetails(employee);
  }

  async getDisplayedName(): Promise<string> {
    return await this.profilePage.getDisplayedName();
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await this.loginPage.verifyErrorMessage(expectedMessage);
  }
}