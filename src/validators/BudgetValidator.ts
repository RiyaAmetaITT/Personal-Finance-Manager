import { ValidationResult } from './ValidationResult';
import { REGEX, NUMBERS } from '../constants';

export class BudgetValidator {

  static validate(data: {
    category: unknown;
    monthly_limit: unknown;
    month: unknown;
  }): ValidationResult {
    const errors: string[] = [];

    if (
      typeof data.category !== 'string' ||
      data.category.trim().length === 0
    ) {
      errors.push('Category is required and cannot be empty.');
    }

    if (
      typeof data.monthly_limit !== 'number' ||
      isNaN(data.monthly_limit) ||
      data.monthly_limit <= 0
    ) {
      errors.push('Monthly limit must be a positive number.');
    }

    if (
      typeof data.month !== 'string' ||
      !REGEX.MONTH.test(data.month) ||
      !this.isValidMonth(data.month)
    ) {
      errors.push('Month must be in YYYY-MM format (e.g. 2024-01).');
    }

    return { isValid: errors.length === 0, errors };
  }

  private static isValidMonth(monthStr: string): boolean {
    const [year, month] = monthStr.split('-').map(Number);
    return (
      year >= NUMBERS.MIN_YEAR &&
      year <= NUMBERS.MAX_YEAR &&
      month >= NUMBERS.MIN_MONTH &&
      month <= NUMBERS.MAX_MONTH
    );
  }
}
