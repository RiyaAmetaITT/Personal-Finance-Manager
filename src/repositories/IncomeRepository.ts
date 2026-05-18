import Database from 'better-sqlite3';
import { Income, IncomeCreateInput } from '../models/Income';
import { IIncomeRepository } from './interfaces/IIncomeRepository';

export class IncomeRepository implements IIncomeRepository {
  constructor(private readonly db: Database.Database) {}

  create(data: IncomeCreateInput): Income {
    const result = this.db
      .prepare(
        'INSERT INTO income (amount, source, date, description) VALUES (?, ?, ?, ?)'
      )
      .run(data.amount, data.source, data.date, data.description ?? null);
    const row = this.db
      .prepare('SELECT * FROM income WHERE id = ?')
      .get(result.lastInsertRowid);
    return row as Income;
  }

  findAll(): Income[] {
    return this.db
      .prepare('SELECT * FROM income ORDER BY date DESC, id DESC')
      .all() as Income[];
  }

  calculateTotalIncome(): number {
    const row = this.db
      .prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM income')
      .get() as { total: number };
    return row.total;
  }

  calculateTotalIncomeForMonth(month: string): number {
    const row = this.db
      .prepare(
        "SELECT COALESCE(SUM(amount), 0) AS total FROM income WHERE strftime('%Y-%m', date) = ?"
      )
      .get(month) as { total: number };
    return row.total;
  }
}
