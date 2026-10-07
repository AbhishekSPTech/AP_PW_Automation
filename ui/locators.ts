// Centralized Locators
// Single source of truth for all UI selectors
// UI Layer - Locator Definitions

export const Locators = {
  login: {
    usernameInput: { role: 'textbox' as const, name: 'Username' },
    passwordInput: { role: 'textbox' as const, name: 'Password' },
    submitButton: 'button[type="submit"]',
  },
  dashboard: {
    navLink: { role: 'link' as const, name: 'Dashboard' },
    profilePicture: { name: 'profile picture' },
    myInfoLink: { role: 'link' as const, name: 'My Info' },
  },
  profile: {
    pageHeading: { role: 'heading' as const, name: 'Personal Details' },
    nameDisplay: '.orangehrm-edit-employee-name h6',
    firstNameInput: 'input[name="firstName"]',
    lastNameInput: 'input[name="lastName"]',
  },
  common: {
    errorMessage: '[role="alert"]',
  },
};