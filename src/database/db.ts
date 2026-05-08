import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SchemaInitializer } from './SchemaInitializer';

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

  public static setInstance(db: Database.Database): void {
    DatabaseConnection.instance = db;
  }
  public static resetInstance(): void {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.close();
      DatabaseConnection.instance = null;
    }
  }
}
