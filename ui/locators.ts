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
    profilePicture: { name: 'profile picture' },
  },
  profile: {
    nameDisplay: '[data-testid="user-name"]',
    emailDisplay: '[data-testid="user-email"]',
    roleDisplay: '[data-testid="user-role"]',
    nameInput: '#name',
    editButton: 'button:has-text("Edit Profile")',
    saveButton: 'button:has-text("Save")',
  },
  common: {
    successMessage: '[data-testid="success-message"]',
    errorMessage: '[data-testid="error-message"]',
  },
};