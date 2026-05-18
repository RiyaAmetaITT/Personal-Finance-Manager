import Database from 'better-sqlite3';
import { ExpenseRepository } from '../../src/repositories/ExpenseRepository';
import { IncomeRepository } from '../../src/repositories/IncomeRepository';
import { SummaryService } from '../../src/services/SummaryService';

function createInMemorySchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT, amount REAL NOT NULL CHECK(amount > 0),
      category TEXT NOT NULL, date TEXT NOT NULL, description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT, amount REAL NOT NULL CHECK(amount > 0),
      source TEXT NOT NULL, date TEXT NOT NULL, description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

describe('SummaryService', () => {
  let db: Database.Database;
  let service: SummaryService;
  let expenseRepository: ExpenseRepository;
  let incomeRepository: IncomeRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    createInMemorySchema(db);
    expenseRepository = new ExpenseRepository(db);
    incomeRepository = new IncomeRepository(db);
    service = new SummaryService(expenseRepository, incomeRepository);
  });

  afterEach(() => db.close());

  it('should return zero summary when no data exists', () => {
    const summary = service.calculateOverallSummary();
    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpenses).toBe(0);
    expect(summary.balance).toBe(0);
    expect(summary.categoryBreakdown).toHaveLength(0);
  });

  it('should calculate correct balance', () => {
    incomeRepository.create({ amount: 50000, source: 'Salary', date: '2024-01-01' });
    expenseRepository.create({ amount: 5000, category: 'Rent', date: '2024-01-05' });
    expenseRepository.create({ amount: 2000, category: 'Food', date: '2024-01-10' });

    const summary = service.calculateOverallSummary();
    expect(summary.totalIncome).toBe(50000);
    expect(summary.totalExpenses).toBe(7000);
    expect(summary.balance).toBe(43000);
  });

  it('should show negative balance when expenses exceed income', () => {
    incomeRepository.create({ amount: 1000, source: 'Salary', date: '2024-01-01' });
    expenseRepository.create({ amount: 5000, category: 'Rent', date: '2024-01-05' });
    expect(service.calculateOverallSummary().balance).toBe(-4000);
  });

  it('should return category breakdown sorted by total descending', () => {
    expenseRepository.create({ amount: 3000, category: 'Rent', date: '2024-01-01' });
    expenseRepository.create({ amount: 1000, category: 'Food', date: '2024-01-02' });
    expenseRepository.create({ amount: 500, category: 'Food', date: '2024-01-03' });

    const { categoryBreakdown } = service.calculateOverallSummary();
    expect(categoryBreakdown).toHaveLength(2);
    expect(categoryBreakdown[0].category).toBe('Rent');
    expect(categoryBreakdown[0].total).toBe(3000);
    expect(categoryBreakdown[1].total).toBe(1500);
  });

  it('should produce correct monthly summary (excludes other months)', () => {
    incomeRepository.create({ amount: 50000, source: 'Salary', date: '2024-01-01' });
    expenseRepository.create({ amount: 2000, category: 'Food', date: '2024-01-05' });
    expenseRepository.create({ amount: 5000, category: 'Rent', date: '2024-02-01' });

    const summary = service.calculateMonthlySummary('2024-01');
    expect(summary.totalExpenses).toBe(2000);
    expect(summary.categoryBreakdown).toHaveLength(1);
    expect(summary.categoryBreakdown[0].category).toBe('Food');
  });
});
