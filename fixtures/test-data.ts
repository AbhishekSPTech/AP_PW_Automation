//Shared test data constants
//All hardcoded test values live here — import from this file in tests

export const TEST_PASSWORD = 'Test@123';

export const WEAK_PASSWORD = 'weak';
export const STRONG_PASSWORD = 'Strong@123';

export const INVALID_CREDENTIALS = {
  email: 'invalid@example.com',
  Username: 'invaliduser',
  password: 'wrongpassword',
};

export const STATIC_TEST_USERS = {
  user1: { email: 'user1@example.com', name: 'User One' },
  user2: { email: 'user2@example.com', name: 'User Two' },
};
