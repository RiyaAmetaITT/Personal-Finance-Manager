import Database from 'better-sqlite3';
import { Budget, BudgetCreateInput } from '../models/Budget';
import { IBudgetRepository } from './interfaces/IBudgetRepository';

export class BudgetRepository implements IBudgetRepository {
  constructor(private readonly db: Database.Database) {}

  createOrUpdate(data: BudgetCreateInput): Budget {
    this.db
      .prepare(
        `INSERT INTO budgets (category, monthly_limit, month)
         VALUES (?, ?, ?)
         ON CONFLICT(category, month)
         DO UPDATE SET monthly_limit = excluded.monthly_limit`
      )
      .run(data.category, data.monthly_limit, data.month);
    return this.getByCategoryAndMonth(data.category, data.month)!;
  }

  getAllByMonth(month: string): Budget[] {
    return this.db
      .prepare('SELECT * FROM budgets WHERE month = ? ORDER BY category')
      .all(month) as Budget[];
  }

  getByCategoryAndMonth(category: string, month: string): Budget | null {
    const row = this.db
      .prepare(
        'SELECT * FROM budgets WHERE LOWER(category) = LOWER(?) AND month = ?'
      )
      .get(category, month);
    return (row as Budget) ?? null;
  }

  getAll(): Budget[] {
    return this.db
      .prepare('SELECT * FROM budgets ORDER BY month DESC, category')
      .all() as Budget[];
  }
}
