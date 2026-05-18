import { Budget, BudgetCreateInput } from '../../models/Budget';

export interface IBudgetRepository {
  createOrUpdate(data: BudgetCreateInput): Budget;
  getAllByMonth(month: string): Budget[];
  getByCategoryAndMonth(category: string, month: string): Budget | null;
  getAll(): Budget[];
}
