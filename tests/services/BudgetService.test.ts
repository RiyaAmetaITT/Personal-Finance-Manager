import Database from 'better-sqlite3';
import { BudgetRepository } from '../../src/repositories/BudgetRepository';
import { ExpenseRepository } from '../../src/repositories/ExpenseRepository';
import { BudgetService } from '../../src/services/BudgetService';

function createInMemorySchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT, amount REAL NOT NULL CHECK(amount > 0),
      category TEXT NOT NULL, date TEXT NOT NULL, description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL,
      monthly_limit REAL NOT NULL CHECK(monthly_limit > 0), month TEXT NOT NULL,
      UNIQUE(category, month)
    );
  `);
}

describe('BudgetService', () => {
  let db: Database.Database;
  let service: BudgetService;
  let expenseRepository: ExpenseRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    createInMemorySchema(db);
    expenseRepository = new ExpenseRepository(db);
    service = new BudgetService(new BudgetRepository(db), expenseRepository);
  });

  afterEach(() => db.close());

  it('should set a budget and return it', () => {
    const budget = service.setBudget({ category: 'Food', monthly_limit: 5000, month: '2024-01' });
    expect(budget.id).toBeDefined();
    expect(budget.category).toBe('Food');
    expect(budget.monthly_limit).toBe(5000);
  });

  it('should update an existing budget (upsert)', () => {
    service.setBudget({ category: 'Food', monthly_limit: 5000, month: '2024-01' });
    const updatedBudget = service.setBudget({ category: 'Food', monthly_limit: 8000, month: '2024-01' });
    expect(updatedBudget.monthly_limit).toBe(8000);
    expect(service.getAllBudgets()).toHaveLength(1);
  });

  it('should throw on invalid budget (zero limit)', () => {
    expect(() =>
      service.setBudget({ category: 'Food', monthly_limit: 0, month: '2024-01' })
    ).toThrow('Validation failed');
  });

  it('should throw on invalid month format', () => {
    expect(() =>
      service.setBudget({ category: 'Food', monthly_limit: 1000, month: '01/2024' })
    ).toThrow('Validation failed');
  });

  it('should compute correct status — under budget', () => {
    service.setBudget({ category: 'Food', monthly_limit: 5000, month: '2024-01' });
    expenseRepository.create({ amount: 1000, category: 'Food', date: '2024-01-10' });
    expenseRepository.create({ amount: 500, category: 'Food', date: '2024-01-20' });

    const statuses = service.calculateBudgetStatusForMonth('2024-01');
    expect(statuses).toHaveLength(1);
    expect(statuses[0].spent).toBe(1500);
    expect(statuses[0].remaining).toBe(3500);
    expect(statuses[0].isOverBudget).toBe(false);
    expect(statuses[0].percentage).toBe(30);
  });

  it('should detect over-budget correctly', () => {
    service.setBudget({ category: 'Food', monthly_limit: 500, month: '2024-01' });
    expenseRepository.create({ amount: 600, category: 'Food', date: '2024-01-10' });

    const statuses = service.calculateBudgetStatusForMonth('2024-01');
    expect(statuses[0].isOverBudget).toBe(true);
    expect(statuses[0].remaining).toBeLessThan(0);
  });

  it('should return empty status when no budgets are set', () => {
    expect(service.calculateBudgetStatusForMonth('2024-01')).toHaveLength(0);
  });
});
