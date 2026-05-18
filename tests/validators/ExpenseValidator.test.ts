import { ExpenseValidator } from '../../src/validators/ExpenseValidator';

describe('ExpenseValidator', () => {
  it('should pass with valid expense data', () => {
    const result = ExpenseValidator.validate({
      amount: 100,
      category: 'Food',
      date: '2024-01-15',
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should pass with optional description provided', () => {
    const result = ExpenseValidator.validate({
      amount: 250.5,
      category: 'Transport',
      date: '2024-06-01',
      description: 'Monthly bus pass',
    });
    expect(result.isValid).toBe(true);
  });

  it('should fail when amount is zero', () => {
    const result = ExpenseValidator.validate({ amount: 0, category: 'Food', date: '2024-01-01' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Amount must be a positive number.');
  });

  it('should fail when amount is negative', () => {
    const result = ExpenseValidator.validate({ amount: -50, category: 'Food', date: '2024-01-01' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Amount must be a positive number.');
  });

  it('should fail when amount is NaN', () => {
    const result = ExpenseValidator.validate({ amount: NaN, category: 'Food', date: '2024-01-01' });
    expect(result.isValid).toBe(false);
  });

  it('should fail when amount is a string', () => {
    const result = ExpenseValidator.validate({ amount: 'abc' as unknown as number, category: 'Food', date: '2024-01-01' });
    expect(result.isValid).toBe(false);
  });

  it('should fail when category is empty', () => {
    const result = ExpenseValidator.validate({ amount: 100, category: '', date: '2024-01-01' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Category is required and cannot be empty.');
  });

  it('should fail when category is whitespace only', () => {
    const result = ExpenseValidator.validate({ amount: 100, category: '   ', date: '2024-01-01' });
    expect(result.isValid).toBe(false);
  });

  it('should fail when date format is wrong', () => {
    const result = ExpenseValidator.validate({ amount: 100, category: 'Food', date: '15-01-2024' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Date must be a valid date in YYYY-MM-DD format.');
  });

  it('should fail when date is invalid (e.g. month 13)', () => {
    const result = ExpenseValidator.validate({ amount: 100, category: 'Food', date: '2024-13-01' });
    expect(result.isValid).toBe(false);
  });

  it('should fail when date is empty', () => {
    const result = ExpenseValidator.validate({ amount: 100, category: 'Food', date: '' });
    expect(result.isValid).toBe(false);
  });

  it('should return multiple errors when multiple fields are invalid', () => {
    const result = ExpenseValidator.validate({ amount: -1, category: '', date: 'bad' });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
