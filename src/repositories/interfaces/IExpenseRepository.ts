import { Expense, ExpenseCreateInput } from '../../models/Expense';
import { FilterStrategy } from '../../strategies/FilterStrategy';

export interface IExpenseRepository {
  create(data: ExpenseCreateInput): Expense;
  findAll(): Expense[];
  findByFilter(strategy: FilterStrategy): Expense[];
  findById(id: number): Expense | null;
  delete(id: number): boolean;
  getMonthlySpendingByCategory(month: string): Array<{ category: string; total: number }>;
  getTotalSpendingForMonth(month: string): number;
  getTotalSpentByCategoryInMonth(category: string, month: string): number;
}
