import Database from 'better-sqlite3';
import { ExpenseRepository } from '../../src/repositories/ExpenseRepository';
import { ExpenseService } from '../../src/services/ExpenseService';
import { CategoryFilterStrategy, DateRangeFilterStrategy } from '../../src/strategies/FilterStrategy';

function createInMemorySchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL CHECK(amount > 0),
      category TEXT NOT NULL, date TEXT NOT NULL,
      description TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

describe('ExpenseService', () => {
  let db: Database.Database;
  let service: ExpenseService;

  beforeEach(() => {
    db = new Database(':memory:');
    createInMemorySchema(db);
    service = new ExpenseService(new ExpenseRepository(db));
  });

  afterEach(() => db.close());

  it('should add a valid expense and return it with an ID', () => {
    const expense = service.addExpense({ amount: 200, category: 'Food', date: '2024-01-10' });
    expect(expense.id).toBeDefined();
    expect(expense.amount).toBe(200);
    expect(expense.category).toBe('Food');
  });

  it('should throw when adding an expense with invalid amount', () => {
    expect(() =>
      service.addExpense({ amount: -50, category: 'Food', date: '2024-01-10' })
    ).toThrow('Validation failed');
  });

  it('should throw when category is empty', () => {
    expect(() =>
      service.addExpense({ amount: 100, category: '', date: '2024-01-10' })
    ).toThrow('Validation failed');
  });

  it('should throw when date format is invalid', () => {
    expect(() =>
      service.addExpense({ amount: 100, category: 'Food', date: 'not-a-date' })
    ).toThrow('Validation failed');
  });

  it('should trim whitespace from category and description', () => {
    const expense = service.addExpense({
      amount: 100, category: '  Rent  ', date: '2024-01-01', description: '  Monthly rent  ',
    });
    expect(expense.category).toBe('Rent');
    expect(expense.description).toBe('Monthly rent');
  });

  it('should return empty array when no expenses exist', () => {
    expect(service.getAllExpenses()).toHaveLength(0);
  });

  it('should return all added expenses', () => {
    service.addExpense({ amount: 100, category: 'Food', date: '2024-01-01' });
    service.addExpense({ amount: 200, category: 'Rent', date: '2024-01-02' });
    expect(service.getAllExpenses()).toHaveLength(2);
  });

  it('should filter expenses by category (case-insensitive)', () => {
    service.addExpense({ amount: 100, category: 'Food', date: '2024-01-01' });
    service.addExpense({ amount: 200, category: 'Rent', date: '2024-01-02' });
    const results = service.getFilteredExpenses(new CategoryFilterStrategy('food'));
    expect(results).toHaveLength(1);
    expect(results[0].category).toBe('Food');
  });

  it('should return empty array when no expenses match category', () => {
    service.addExpense({ amount: 100, category: 'Food', date: '2024-01-01' });
    expect(service.getFilteredExpenses(new CategoryFilterStrategy('Travel'))).toHaveLength(0);
  });

  it('should filter expenses within a date range', () => {
    service.addExpense({ amount: 100, category: 'Food', date: '2024-01-05' });
    service.addExpense({ amount: 200, category: 'Food', date: '2024-01-15' });
    service.addExpense({ amount: 300, category: 'Food', date: '2024-02-01' });
    const results = service.getFilteredExpenses(new DateRangeFilterStrategy('2024-01-01', '2024-01-31'));
    expect(results).toHaveLength(2);
  });

  it('should delete an existing expense', () => {
    const expense = service.addExpense({ amount: 100, category: 'Food', date: '2024-01-01' });
    service.deleteExpense(expense.id!);
    expect(service.getAllExpenses()).toHaveLength(0);
  });

  it('should throw when deleting a non-existent expense', () => {
    expect(() => service.deleteExpense(9999)).toThrow('not found');
  });

  it('should calculate correct total for a month', () => {
    service.addExpense({ amount: 100, category: 'Food', date: '2024-01-01' });
    service.addExpense({ amount: 200, category: 'Food', date: '2024-01-15' });
    service.addExpense({ amount: 500, category: 'Rent', date: '2024-02-01' });
    expect(service.calculateTotalExpensesForMonth('2024-01')).toBe(300);
  });

  it('should return 0 total for a month with no expenses', () => {
    expect(service.calculateTotalExpensesForMonth('2024-06')).toBe(0);
  });
});
