import { IExpenseRepository } from '../repositories/interfaces/IExpenseRepository';
import { Expense, ExpenseCreateInput } from '../models/Expense';
import { ExpenseValidator } from '../validators/ExpenseValidator';
import { FilterStrategy } from '../strategies/FilterStrategy';

export class ExpenseService {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  addExpense(data: ExpenseCreateInput): Expense {
    const validation = ExpenseValidator.validate(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    const sanitizedExpense: ExpenseCreateInput = {
      amount: data.amount,
      category: data.category.trim(),
      date: data.date.trim(),
      description: data.description?.trim(),
    };
    return this.expenseRepository.create(sanitizedExpense);
  }

  getAllExpenses(): Expense[] {
    return this.expenseRepository.findAll();
  }

  getFilteredExpenses(filterStrategy: FilterStrategy): Expense[] {
    return this.expenseRepository.findByFilter(filterStrategy);
  }

  getExpenseById(id: number): Expense | null {
    return this.expenseRepository.findById(id);
  }

  deleteExpense(expenseId: number): boolean {
    const existingExpense = this.expenseRepository.findById(expenseId);
    if (!existingExpense) {
      throw new Error(`Expense with ID ${expenseId} not found.`);
    }
    return this.expenseRepository.delete(expenseId);
  }

  getMonthlySpendingBreakdown(month: string): Array<{ category: string; total: number }> {
    return this.expenseRepository.getMonthlySpendingByCategory(month);
  }

  calculateTotalExpensesForMonth(month: string): number {
    return this.expenseRepository.getTotalSpendingForMonth(month);
  }

  calculateSpentAmountByCategoryInMonth(category: string, month: string): number {
    return this.expenseRepository.getTotalSpentByCategoryInMonth(category, month);
  }
}
