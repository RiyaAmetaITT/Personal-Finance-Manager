import Database from 'better-sqlite3';
import { DatabaseConnection } from '../../src/database/db';
import { SchemaInitializer } from '../../src/database/SchemaInitializer';
import { BudgetRepository } from '../../src/repositories/BudgetRepository';

describe('BudgetRepository', () => {
  let db: Database.Database;
  let repo: BudgetRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    SchemaInitializer.initialize(db);
    DatabaseConnection.setInstance(db);
    repo = new BudgetRepository(db);
  });

  afterEach(() => {
    DatabaseConnection.resetInstance();
  });

  describe('createOrUpdate()', () => {
    it('should create a new budget record', () => {
      const budget = repo.createOrUpdate({ category: 'Food', monthly_limit: 500, month: '2026-05' });
      expect(budget.category).toBe('Food');
      expect(budget.monthly_limit).toBe(500);
      expect(budget.month).toBe('2026-05');
    });

    it('should update monthly_limit when (category, month) already exists (upsert)', () => {
      repo.createOrUpdate({ category: 'Food', monthly_limit: 500, month: '2026-05' });
      const updated = repo.createOrUpdate({ category: 'Food', monthly_limit: 600, month: '2026-05' });
      expect(updated.monthly_limit).toBe(600);
      
      const all = repo.getAll();
      expect(all.length).toBe(1);
    });
  });

  describe('getAllByMonth()', () => {
    it('should return all budgets for a given month', () => {
      repo.createOrUpdate({ category: 'Food', monthly_limit: 500, month: '2026-05' });
      repo.createOrUpdate({ category: 'Travel', monthly_limit: 300, month: '2026-05' });
      repo.createOrUpdate({ category: 'Food', monthly_limit: 500, month: '2026-06' });
      
      const results = repo.getAllByMonth('2026-05');
      expect(results.length).toBe(2);
    });

    it('should return empty array for month with no budgets', () => {
      expect(repo.getAllByMonth('2026-04')).toEqual([]);
    });
  });

  describe('getByCategoryAndMonth()', () => {
    it('should return correct Budget', () => {
      repo.createOrUpdate({ category: 'Food', monthly_limit: 500, month: '2026-05' });
      const found = repo.getByCategoryAndMonth('Food', '2026-05');
      expect(found).not.toBeNull();
      expect(found?.monthly_limit).toBe(500);
    });

    it('should return null when not found', () => {
      expect(repo.getByCategoryAndMonth('Food', '2026-05')).toBeNull();
    });
  });

  describe('getAll()', () => {
    it('should return every budget record', () => {
      repo.createOrUpdate({ category: 'Food', monthly_limit: 500, month: '2026-05' });
      repo.createOrUpdate({ category: 'Travel', monthly_limit: 300, month: '2026-06' });
      const all = repo.getAll();
      expect(all.length).toBe(2);
    });
  });
});
