import Database from 'better-sqlite3';
import { DatabaseConnection } from '../../src/database/db';
import { SchemaInitializer } from '../../src/database/SchemaInitializer';
import { IncomeRepository } from '../../src/repositories/IncomeRepository';

describe('IncomeRepository', () => {
  let db: Database.Database;
  let repo: IncomeRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    SchemaInitializer.initialize(db);
    DatabaseConnection.setInstance(db);
    repo = new IncomeRepository(db);
  });

  afterEach(() => {
    DatabaseConnection.resetInstance();
  });

  describe('create()', () => {
    it('should return Income with generated id', () => {
      const income = repo.create({ amount: 1000, source: 'Salary', date: '2026-05-01' });
      expect(income.id).toBeDefined();
      expect(typeof income.id).toBe('number');
      expect(income.amount).toBe(1000);
    });
  });

  describe('findAll()', () => {
    it('should return all records ordered by date DESC', () => {
      repo.create({ amount: 100, source: 'A', date: '2026-05-01' });
      repo.create({ amount: 200, source: 'B', date: '2026-05-02' });
      const incomes = repo.findAll();
      expect(incomes.length).toBe(2);
      expect(incomes[0].date).toBe('2026-05-02');
      expect(incomes[1].date).toBe('2026-05-01');
    });

    it('should return empty array when no records', () => {
      expect(repo.findAll()).toEqual([]);
    });
  });

  describe('calculateTotalIncome()', () => {
    it('should sum all amounts correctly', () => {
      repo.create({ amount: 100, source: 'A', date: '2026-05-01' });
      repo.create({ amount: 200, source: 'B', date: '2026-05-02' });
      expect(repo.calculateTotalIncome()).toBe(300);
    });

    it('should return 0 when no records', () => {
      expect(repo.calculateTotalIncome()).toBe(0);
    });
  });
});
