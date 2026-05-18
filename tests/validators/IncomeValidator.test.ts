import { IncomeValidator } from '../../src/validators/IncomeValidator';

describe('IncomeValidator', () => {
  it('should pass with valid income data', () => {
    const result = IncomeValidator.validate({ amount: 50000, source: 'Salary', date: '2024-03-01' });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail when amount is zero', () => {
    const result = IncomeValidator.validate({ amount: 0, source: 'Salary', date: '2024-03-01' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Amount must be a positive number.');
  });

  it('should fail when amount is negative', () => {
    const result = IncomeValidator.validate({ amount: -100, source: 'Salary', date: '2024-03-01' });
    expect(result.isValid).toBe(false);
  });

  it('should fail when source is empty', () => {
    const result = IncomeValidator.validate({ amount: 1000, source: '', date: '2024-03-01' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Source is required and cannot be empty.');
  });

  it('should fail when source is whitespace only', () => {
    const result = IncomeValidator.validate({ amount: 1000, source: '  ', date: '2024-03-01' });
    expect(result.isValid).toBe(false);
  });

  it('should fail with invalid date format', () => {
    const result = IncomeValidator.validate({ amount: 1000, source: 'Salary', date: '2024/03/01' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Date must be a valid date in YYYY-MM-DD format.');
  });

  it('should fail with empty date', () => {
    const result = IncomeValidator.validate({ amount: 1000, source: 'Salary', date: '' });
    expect(result.isValid).toBe(false);
  });

  it('should accumulate multiple errors', () => {
    const result = IncomeValidator.validate({ amount: -1, source: '', date: 'bad-date' });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
