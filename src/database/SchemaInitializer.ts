import Database from 'better-sqlite3';

export class SchemaInitializer {
  static initialize(db: Database.Database): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        username      TEXT    NOT NULL UNIQUE,
        password_hash TEXT    NOT NULL,
        created_at    TEXT    DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        amount      REAL    NOT NULL CHECK(amount > 0),
        category    TEXT    NOT NULL,
        date        TEXT    NOT NULL,
        description TEXT,
        created_at  TEXT    DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS income (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        amount      REAL    NOT NULL CHECK(amount > 0),
        source      TEXT    NOT NULL,
        date        TEXT    NOT NULL,
        description TEXT,
        created_at  TEXT    DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        category      TEXT    NOT NULL,
        monthly_limit REAL    NOT NULL CHECK(monthly_limit > 0),
        month         TEXT    NOT NULL,
        UNIQUE(category, month)
      );
    `);
  }
}
