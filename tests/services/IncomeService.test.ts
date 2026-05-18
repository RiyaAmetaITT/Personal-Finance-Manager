import Database from 'better-sqlite3';
import { IncomeRepository } from '../../src/repositories/IncomeRepository';
import { IncomeService } from '../../src/services/IncomeService';

function createInMemorySchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL CHECK(amount > 0),
      source TEXT NOT NULL, date TEXT NOT NULL,
      description TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

describe('IncomeService', () => {
  let db: Database.Database;
  let service: IncomeService;

  beforeEach(() => {
    db = new Database(':memory:');
    createInMemorySchema(db);
    service = new IncomeService(new IncomeRepository(db));
  });

  afterEach(() => db.close());

  it('should add valid income and return with ID', () => {
    const income = service.addIncome({ amount: 50000, source: 'Salary', date: '2024-01-01' });
    expect(income.id).toBeDefined();
    expect(income.amount).toBe(50000);
    expect(income.source).toBe('Salary');
  });

  it('should throw on invalid amount', () => {
    expect(() =>
      service.addIncome({ amount: 0, source: 'Salary', date: '2024-01-01' })
    ).toThrow('Validation failed');
  });

  it('should throw on empty source', () => {
    expect(() =>
      service.addIncome({ amount: 1000, source: '', date: '2024-01-01' })
    ).toThrow('Validation failed');
  });

  it('should throw on invalid date', () => {
    expect(() =>
      service.addIncome({ amount: 1000, source: 'Freelance', date: 'bad-date' })
    ).toThrow('Validation failed');
  });

  it('should return all income records', () => {
    service.addIncome({ amount: 10000, source: 'Salary', date: '2024-01-01' });
    service.addIncome({ amount: 5000, source: 'Freelance', date: '2024-01-15' });
    expect(service.getAllIncome()).toHaveLength(2);
  });

  it('should return 0 when no income records exist', () => {
    expect(service.calculateTotalIncome()).toBe(0);
  });

  it('should return correct total income', () => {
    service.addIncome({ amount: 10000, source: 'Salary', date: '2024-01-01' });
    service.addIncome({ amount: 5000, source: 'Freelance', date: '2024-01-15' });
    expect(service.calculateTotalIncome()).toBe(15000);
  });
});
