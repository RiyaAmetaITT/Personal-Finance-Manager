import { Income, IncomeCreateInput } from '../../models/Income';

export interface IIncomeRepository {
  create(data: IncomeCreateInput): Income;
  findAll(): Income[];
  calculateTotalIncome(): number;
  calculateTotalIncomeForMonth(month: string): number;
}
