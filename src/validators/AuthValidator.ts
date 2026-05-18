import { ValidationResult } from './ValidationResult';
import { UserCreateInput } from '../models/User';
import { REGEX, NUMBERS } from '../constants';

export class AuthValidator {
  static validateRegistration(data: UserCreateInput): ValidationResult {
    const errors: string[] = [];

    if (
      typeof data.username !== 'string' ||
      !REGEX.USERNAME.test(data.username.trim())
    ) {
      errors.push(
        `Username must be ${NUMBERS.USERNAME_MIN_LENGTH}–${NUMBERS.USERNAME_MAX_LENGTH} characters and contain only letters, numbers, or underscores.`
      );
    }

    if (typeof data.password !== 'string' || data.password.length < NUMBERS.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${NUMBERS.PASSWORD_MIN_LENGTH} characters long.`);
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
