import Database from 'better-sqlite3';
import { DatabaseConnection } from '../../src/database/db';

describe('DatabaseConnection', () => {
  beforeEach(() => {
    DatabaseConnection.resetInstance();
  });

  afterEach(() => {
    DatabaseConnection.resetInstance();
  });

  describe('getInstance()', () => {
    it('should return the same instance on multiple calls (Singleton)', () => {
      const db1 = DatabaseConnection.getInstance();
      const db2 = DatabaseConnection.getInstance();
      expect(db1).toBe(db2);
    });

    it('should return an open database instance', () => {
      const db = DatabaseConnection.getInstance();
      expect(db.open).toBe(true);
    });
  });

  describe('Schema — table creation', () => {
    it('should create the users table', () => {
      const db = DatabaseConnection.getInstance();
      const row = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        .get();
      expect(row).toBeDefined();
    });

    it('should create the expenses table', () => {
      const db = DatabaseConnection.getInstance();
      const row = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'")
        .get();
      expect(row).toBeDefined();
    });

    it('should create the income table', () => {
      const db = DatabaseConnection.getInstance();
      const row = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='income'")
        .get();
      expect(row).toBeDefined();
    });

    it('should create the budgets table', () => {
      const db = DatabaseConnection.getInstance();
      const row = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='budgets'")
        .get();
      expect(row).toBeDefined();
    });
  });

  describe('setInstance()', () => {
    it('should replace the current instance with the provided one', () => {
      const inMemoryDb = new Database(':memory:');
      DatabaseConnection.setInstance(inMemoryDb);
      const retrieved = DatabaseConnection.getInstance();
      expect(retrieved).toBe(inMemoryDb);
      inMemoryDb.close();
    });
  });

  describe('resetInstance()', () => {
    it('should close and clear the instance so the next call creates a new one', () => {
      const db1 = DatabaseConnection.getInstance();
      DatabaseConnection.resetInstance();
      const db2 = DatabaseConnection.getInstance();
      expect(db2).not.toBe(db1);
    });

    it('should not throw when called with no active instance', () => {
      DatabaseConnection.resetInstance();
      expect(() => DatabaseConnection.resetInstance()).not.toThrow();
    });
  });

  describe('WAL journal mode', () => {
    it('should have WAL mode enabled after initialisation', () => {
      const db = DatabaseConnection.getInstance();
      const row = db.prepare('PRAGMA journal_mode').get() as { journal_mode: string };
      expect(row.journal_mode).toBe('wal');
    });
  });
});
