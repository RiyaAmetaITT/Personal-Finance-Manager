import { ValidationResult } from './ValidationResult';
import { REGEX } from '../constants';

export class ExpenseValidator {

  static validate(data: {
    amount: unknown;
    category: unknown;
    date: unknown;
    description?: unknown;
  }): ValidationResult {
    const errors: string[] = [];

    if (
      typeof data.amount !== 'number' ||
      isNaN(data.amount) ||
      data.amount <= 0
    ) {
      errors.push('Amount must be a positive number.');
    }

    if (
      typeof data.category !== 'string' ||
      data.category.trim().length === 0
    ) {
      errors.push('Category is required and cannot be empty.');
    }

    if (
      typeof data.date !== 'string' ||
      !REGEX.DATE.test(data.date) ||
      !this.isValidDate(data.date)
    ) {
      errors.push('Date must be a valid date in YYYY-MM-DD format.');
    }

    return { isValid: errors.length === 0, errors };
  }

  private static isValidDate(dateStr: string): boolean {
    return !isNaN(new Date(dateStr).getTime());
  }
}
