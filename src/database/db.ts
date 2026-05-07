import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SchemaInitializer } from './SchemaInitializer';

/**
 * DatabaseConnection — Singleton Pattern.
 * Single Responsibility: manage the SQLite connection lifecycle only.
 * Schema setup is delegated to SchemaInitializer (SRP).
 */
export class DatabaseConnection {
  private static instance: Database.Database | null = null;

  private constructor() {}

  public static getInstance(): Database.Database {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = DatabaseConnection.openConnection();
      SchemaInitializer.initialize(DatabaseConnection.instance);
    }
    return DatabaseConnection.instance;
  }

  private static openConnection(): Database.Database {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const db = new Database(path.join(dataDir, 'finance.db'));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    return db;
  }

  /** For testing: inject an in-memory DB instance */
  public static setInstance(db: Database.Database): void {
    DatabaseConnection.instance = db;
  }

  /** For testing: reset so next call opens a fresh connection */
  public static resetInstance(): void {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.close();
      DatabaseConnection.instance = null;
    }
  }
}
