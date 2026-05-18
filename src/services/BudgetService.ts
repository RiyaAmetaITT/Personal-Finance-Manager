import { IBudgetRepository } from '../repositories/interfaces/IBudgetRepository';
import { IExpenseRepository } from '../repositories/interfaces/IExpenseRepository';
import { Budget, BudgetCreateInput, BudgetStatus } from '../models/Budget';
import { BudgetValidator } from '../validators/BudgetValidator';

export class BudgetService {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly expenseRepository: IExpenseRepository
  ) {}

  setBudget(data: BudgetCreateInput): Budget {
    const validation = BudgetValidator.validate(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    const sanitizedBudget: BudgetCreateInput = {
      category: data.category.trim(),
      monthly_limit: data.monthly_limit,
      month: data.month.trim(),
    };
    return this.budgetRepository.createOrUpdate(sanitizedBudget);
  }

  calculateBudgetStatusForMonth(month: string): BudgetStatus[] {
    const budgets = this.budgetRepository.getAllByMonth(month);
    return budgets.map((budget) => this.computeStatusForBudget(budget, month));
  }

  private computeStatusForBudget(budget: Budget, month: string): BudgetStatus {
    const spent = this.expenseRepository.getTotalSpentByCategoryInMonth(budget.category, month);
    const remaining = budget.monthly_limit - spent;
    const percentage = budget.monthly_limit > 0 ? (spent / budget.monthly_limit) * 100 : 0;
    return {
      ...budget,
      spent,
      remaining,
      percentage: Math.round(percentage * 100) / 100,
      isOverBudget: spent > budget.monthly_limit,
    };
  }

  getAllBudgets(): Budget[] {
    return this.budgetRepository.getAll();
  }
}
