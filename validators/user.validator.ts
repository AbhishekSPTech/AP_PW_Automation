/**
 * User Validator
 * Validates user data (shared between API and UI layers)
 * 
 * Shared Infrastructure - Validators
 */

import { z } from 'zod';
import { UserModel } from '../api/models/user.model';
import { createLogger } from '../core/logger';

const logger = createLogger('UserValidator');

/**
 * User schema validation using Zod
 */
const userSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['user', 'admin', 'client']),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export class UserValidator {
  /**
   * Validate user object
   */
  static validate(user: UserModel): boolean {
    try {
      userSchema.parse(user);
      logger.debug('User validation passed', { userId: user.id });
      return true;
    } catch (error) {
      logger.error('User validation failed', error);
      throw error;
    }
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (!isValid) {
      logger.warn('Invalid email format', { email });
    }
    
    return isValid;
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    const isValid = errors.length === 0;

    if (!isValid) {
      logger.warn('Password validation failed', { errors });
    }

    return { isValid, errors };
  }

  /**
   * Validate user name
   */
  static validateName(name: string): boolean {
    const isValid = name.length >= 2 && name.length <= 50;
    
    if (!isValid) {
      logger.warn('Invalid name', { name });
    }
    
    return isValid;
  }

  /**
   * Validate user role
   */
  static validateRole(role: string): boolean {
    const validRoles = ['user', 'admin', 'client'];
    const isValid = validRoles.includes(role);
    
    if (!isValid) {
      logger.warn('Invalid role', { role });
    }
    
    return isValid;
  }

  /**
   * Validate partial user update
   */
  static validatePartialUpdate(updates: Partial<UserModel>): boolean {
    try {
      if (updates.email && !this.validateEmail(updates.email)) {
        throw new Error('Invalid email in update');
      }

      if (updates.name && !this.validateName(updates.name)) {
        throw new Error('Invalid name in update');
      }

      if (updates.role && !this.validateRole(updates.role)) {
        throw new Error('Invalid role in update');
      }

      logger.debug('Partial user validation passed');
      return true;
    } catch (error) {
      logger.error('Partial user validation failed', error);
      throw error;
    }
  }
}
