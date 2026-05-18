import Database from 'better-sqlite3';
import { Expense, ExpenseCreateInput } from '../models/Expense';
import { IExpenseRepository } from './interfaces/IExpenseRepository';
import { FilterStrategy } from '../strategies/FilterStrategy';

export class ExpenseRepository implements IExpenseRepository {
  constructor(private readonly db: Database.Database) {}

  create(data: ExpenseCreateInput): Expense {
    const result = this.db
      .prepare(
        'INSERT INTO expenses (amount, category, date, description) VALUES (?, ?, ?, ?)'
      )
      .run(data.amount, data.category, data.date, data.description ?? null);
    return this.findById(result.lastInsertRowid as number)!;
  }

  findAll(): Expense[] {
    return this.db
      .prepare('SELECT * FROM expenses ORDER BY date DESC, id DESC')
      .all() as Expense[];
  }

  findByFilter(strategy: FilterStrategy): Expense[] {
    const { condition, params } = strategy.toSQLCondition();
    const sql = `SELECT * FROM expenses WHERE ${condition} ORDER BY date DESC, id DESC`;
    return this.db.prepare(sql).all(...(params as [])) as Expense[];
  }

  findById(id: number): Expense | null {
    const row = this.db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    return (row as Expense) ?? null;
  }

  delete(id: number): boolean {
    const result = this.db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getMonthlySpendingByCategory(month: string): Array<{ category: string; total: number }> {
    return this.db
      .prepare(
        `SELECT category, SUM(amount) AS total
         FROM expenses
         WHERE strftime('%Y-%m', date) = ?
         GROUP BY category
         ORDER BY total DESC`
      )
      .all(month) as Array<{ category: string; total: number }>;
  }

  getTotalSpendingForMonth(month: string): number {
    const row = this.db
      .prepare(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM expenses
         WHERE strftime('%Y-%m', date) = ?`
      )
      .get(month) as { total: number };
    return row.total;
  }

  getTotalSpentByCategoryInMonth(category: string, month: string): number {
    const row = this.db
      .prepare(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM expenses
         WHERE LOWER(category) = LOWER(?) AND strftime('%Y-%m', date) = ?`
      )
      .get(category, month) as { total: number };
    return row.total;
  }
}
