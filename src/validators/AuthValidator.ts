import { ValidationResult } from './ValidationResult';
import { UserCreateInput } from '../models/User';

export class AuthValidator {
  private static readonly USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
  static validateRegistration(data: UserCreateInput): ValidationResult {
    const errors: string[] = [];

    if (
      typeof data.username !== 'string' ||
      !this.USERNAME_REGEX.test(data.username.trim())
    ) {
      errors.push(
        'Username must be 3–20 characters and contain only letters, numbers, or underscores.'
      );
    }

    if (typeof data.password !== 'string' || data.password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateLogin(username: unknown, password: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof username !== 'string' || username.trim().length === 0) {
      errors.push('Username is required.');
    }

    if (typeof password !== 'string' || password.length === 0) {
      errors.push('Password is required.');
    }

    return { isValid: errors.length === 0, errors };
  }
}
