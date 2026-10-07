//User Lifecycle Test
//Tests complete employee lifecycle(create, verify, update, delete)

//Business Flow - Data via API, Validation via UI

import { test, expect } from '@playwright/test';
import { EmployeeClient } from '../api/clients/employee.client';
import { UserPage } from '../ui/models/user.model';
import { EmployeeBuilder } from '../api/models/employee.model';
import { EmployeeValidator } from '../validators/employee.validator';
import { UserValidator } from '../validators/user.validator';
import { WEAK_PASSWORD, STRONG_PASSWORD } from '../fixtures/test-data';

test.describe('User Lifecycle', () => {
  let employeeClient: EmployeeClient;
  let userPage: UserPage;
  let testEmpNumber: number | undefined;

  test.beforeEach(async ({ request, page }) => {
    employeeClient = new EmployeeClient(request);
    userPage = new UserPage(page);
    testEmpNumber = undefined;
  });

  test.afterEach(async () => {
    // Cleanup - Delete created employee via API
    if (testEmpNumber) {
      try {
        await employeeClient.deleteEmployee(testEmpNumber);
      } catch (error) {
        console.log('Cleanup error (employee may not exist):', error);
      }
    }
  });

  test('should create employee via API and verify via UI', async () => {
    // Arrange - Create test data
    const employeeData = EmployeeBuilder.createRandomEmployee();

    // Act - Setup data via API
    const createdEmployee = await employeeClient.createEmployee(employeeData);

    testEmpNumber = createdEmployee.empNumber;

    // Validate data
    EmployeeValidator.validate(createdEmployee);

    // Act - Verify via UI
    await userPage.navigateToEmployeeProfile(createdEmployee.empNumber);

    // Assert - Validates via UI only
    await userPage.verifyEmployeeDetails(createdEmployee);
  });

  test('should update employee via API and verify changes via UI', async () => {
    // Arrange - Create employee via API
    const employeeData = EmployeeBuilder.createRandomEmployee();
    const createdEmployee = await employeeClient.createEmployee(employeeData);

    testEmpNumber = createdEmployee.empNumber;

    // Act - Update employee via API
    const updatedFirstName = `Updated${employeeData.firstName}`;
    const updatedEmployee = await employeeClient.updateEmployee(createdEmployee.empNumber, {
      firstName: updatedFirstName,
    });

    // Validate update
    expect(updatedEmployee.firstName).toBe(updatedFirstName);

    // Act - Verify via UI
    await userPage.navigateToEmployeeProfile(createdEmployee.empNumber);

    // Assert - Validates via UI only
    await userPage.verifyEmployeeDetails(updatedEmployee);
  });

  test('should find employee by name via API', async () => {
    // Arrange - Create employee via API
    const employeeData = EmployeeBuilder.createRandomEmployee();
    const createdEmployee = await employeeClient.createEmployee(employeeData);

    testEmpNumber = createdEmployee.empNumber;

    // Act - Search employee by last name via API
    const results = await employeeClient.searchEmployees(employeeData.lastName);

    // Assert - API response validation
    expect(results).toHaveLength(1);
    expect(results[0].empNumber).toBe(createdEmployee.empNumber);
    expect(results[0].lastName).toBe(employeeData.lastName);
    EmployeeValidator.validate(results[0]);
  });

  test('should validate email format', async () => {
    // Arrange
    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'user@',
      'user@.com',
    ];

    // Act & Assert
    for (const email of invalidEmails) {
      const isValid = UserValidator.validateEmail(email);
      expect(isValid).toBe(false);
    }
  });

  test('should validate password strength', async () => {
    // Arrange
    const weakPassword = WEAK_PASSWORD;
    const strongPassword = STRONG_PASSWORD;

    // Act
    const weakResult = UserValidator.validatePassword(weakPassword);
    const strongResult = UserValidator.validatePassword(strongPassword);

    // Assert
    expect(weakResult.isValid).toBe(false);
    expect(weakResult.errors.length).toBeGreaterThan(0);
    expect(strongResult.isValid).toBe(true);
    expect(strongResult.errors.length).toBe(0);
  });
});
