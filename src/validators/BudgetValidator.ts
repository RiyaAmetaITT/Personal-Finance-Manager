import { ValidationResult } from './ValidationResult';

/** Validates raw input before creating or updating a Budget record. */
export class BudgetValidator {
  private static readonly MONTH_REGEX = /^\d{4}-\d{2}$/;

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
      !this.MONTH_REGEX.test(data.month) ||
      !this.isValidMonth(data.month)
    ) {
      errors.push('Month must be in YYYY-MM format (e.g. 2024-01).');
    }

    return { isValid: errors.length === 0, errors };
  }

  private static isValidMonth(monthStr: string): boolean {
    const [year, month] = monthStr.split('-').map(Number);
    return year >= 2000 && year <= 2100 && month >= 1 && month <= 12;
  }
}
