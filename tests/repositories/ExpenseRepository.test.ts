import Database from 'better-sqlite3';
import { DatabaseConnection } from '../../src/database/db';
import { SchemaInitializer } from '../../src/database/SchemaInitializer';
import { ExpenseRepository } from '../../src/repositories/ExpenseRepository';
import { CategoryFilterStrategy, DateRangeFilterStrategy } from '../../src/strategies/FilterStrategy';

describe('ExpenseRepository', () => {
  let db: Database.Database;
  let repo: ExpenseRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    SchemaInitializer.initialize(db);
    DatabaseConnection.setInstance(db);
    repo = new ExpenseRepository(db);
  });

  afterEach(() => {
    DatabaseConnection.resetInstance();
  });

  describe('create()', () => {
    it('should return Expense with generated id', () => {
      const expense = repo.create({ amount: 100, category: 'Food', date: '2026-05-18' });
      expect(expense.id).toBeDefined();
      expect(typeof expense.id).toBe('number');
      expect(expense.amount).toBe(100);
    });
  });

  describe('findAll()', () => {
    it('should return all records ordered by date DESC', () => {
      repo.create({ amount: 10, category: 'A', date: '2026-05-01' });
      repo.create({ amount: 20, category: 'B', date: '2026-05-02' });
      const expenses = repo.findAll();
      expect(expenses.length).toBe(2);
      expect(expenses[0].date).toBe('2026-05-02');
      expect(expenses[1].date).toBe('2026-05-01');
    });

    it('should return empty array when no records', () => {
      expect(repo.findAll()).toEqual([]);
    });
  });

  describe('findById()', () => {
    it('should return correct Expense', () => {
      const created = repo.create({ amount: 50, category: 'A', date: '2026-05-01' });
      const found = repo.findById(created.id!);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
    });

    it('should return null for unknown id', () => {
      expect(repo.findById(999)).toBeNull();
    });
  });

  describe('delete()', () => {
    it('should return true and removes the record', () => {
      const created = repo.create({ amount: 50, category: 'A', date: '2026-05-01' });
      const result = repo.delete(created.id!);
      expect(result).toBe(true);
      expect(repo.findById(created.id!)).toBeNull();
    });

    it('should return false for unknown id', () => {
      expect(repo.delete(999)).toBe(false);
    });
  });

  describe('findByFilter()', () => {
    it('should return only matching category', () => {
      repo.create({ amount: 10, category: 'Food', date: '2026-05-01' });
      repo.create({ amount: 20, category: 'Travel', date: '2026-05-01' });
      const strategy = new CategoryFilterStrategy('Food');
      const results = repo.findByFilter(strategy);
      expect(results.length).toBe(1);
      expect(results[0].category).toBe('Food');
    });

    it('should return only records within range', () => {
      repo.create({ amount: 10, category: 'Food', date: '2026-05-01' });
      repo.create({ amount: 20, category: 'Food', date: '2026-05-15' });
      repo.create({ amount: 30, category: 'Food', date: '2026-05-30' });
      const strategy = new DateRangeFilterStrategy('2026-05-01', '2026-05-20');
      const results = repo.findByFilter(strategy);
      expect(results.length).toBe(2);
    });

    it('should exclude records outside range', () => {
      repo.create({ amount: 10, category: 'Food', date: '2026-04-30' });
      repo.create({ amount: 20, category: 'Food', date: '2026-06-01' });
      const strategy = new DateRangeFilterStrategy('2026-05-01', '2026-05-31');
      const results = repo.findByFilter(strategy);
      expect(results.length).toBe(0);
    });
  });

  describe('aggregates', () => {
    beforeEach(() => {
      repo.create({ amount: 100, category: 'Food', date: '2026-05-01' });
      repo.create({ amount: 50, category: 'Food', date: '2026-05-15' });
      repo.create({ amount: 200, category: 'Travel', date: '2026-05-10' });
      repo.create({ amount: 300, category: 'Food', date: '2026-06-01' });
    });

    it('getMonthlySpendingByCategory() should group and sum correctly', () => {
      const results = repo.getMonthlySpendingByCategory('2026-05');
      expect(results.length).toBe(2);
      expect(results[0].category).toBe('Travel');
      expect(results[0].total).toBe(200);
      expect(results[1].category).toBe('Food');
      expect(results[1].total).toBe(150);
    });

    it('getMonthlySpendingByCategory() should return empty array for month with no records', () => {
      expect(repo.getMonthlySpendingByCategory('2026-04')).toEqual([]);
    });

    it('getTotalSpendingForMonth() should return correct sum', () => {
      expect(repo.getTotalSpendingForMonth('2026-05')).toBe(350);
    });

    it('getTotalSpendingForMonth() should return 0 for empty month', () => {
      expect(repo.getTotalSpendingForMonth('2026-04')).toBe(0);
    });

    it('getTotalSpentByCategoryInMonth() should match case-insensitive category', () => {
      expect(repo.getTotalSpentByCategoryInMonth('fOoD', '2026-05')).toBe(150);
    });
  });
});
