import { BudgetValidator } from '../../src/validators/BudgetValidator';

describe('BudgetValidator', () => {
  it('should pass with valid budget data', () => {
    const result = BudgetValidator.validate({ category: 'Food', monthly_limit: 5000, month: '2024-01' });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail when category is empty', () => {
    const result = BudgetValidator.validate({ category: '', monthly_limit: 5000, month: '2024-01' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Category is required and cannot be empty.');
  });

  it('should fail when monthly_limit is zero', () => {
    const result = BudgetValidator.validate({ category: 'Food', monthly_limit: 0, month: '2024-01' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Monthly limit must be a positive number.');
  });

  it('should fail when monthly_limit is negative', () => {
    const result = BudgetValidator.validate({ category: 'Food', monthly_limit: -100, month: '2024-01' });
    expect(result.isValid).toBe(false);
  });

  it('should fail when month format is wrong', () => {
    const result = BudgetValidator.validate({ category: 'Food', monthly_limit: 1000, month: '01-2024' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Month must be in YYYY-MM format (e.g. 2024-01).');
  });

  it('should fail when month number is out of range (13)', () => {
    const result = BudgetValidator.validate({ category: 'Food', monthly_limit: 1000, month: '2024-13' });
    expect(result.isValid).toBe(false);
  });

  it('should fail when month is empty', () => {
    const result = BudgetValidator.validate({ category: 'Food', monthly_limit: 1000, month: '' });
    expect(result.isValid).toBe(false);
  });

  it('should return multiple errors for fully invalid input', () => {
    const result = BudgetValidator.validate({ category: '', monthly_limit: -1, month: 'bad' });
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
