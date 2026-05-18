import { IExpenseRepository } from '../repositories/interfaces/IExpenseRepository';
import { IIncomeRepository } from '../repositories/interfaces/IIncomeRepository';
import { FinancialSummary, CategorySummary } from '../models/Summary';

/**
 * SummaryService — Facade Pattern.
 * Single Responsibility: aggregate financial data from multiple repositories
 * into a unified summary. Services and CLI call one method; internal complexity is hidden.
 * Depends on interfaces, not concrete classes (DIP).
 */
export class SummaryService {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly incomeRepository: IIncomeRepository
  ) {}

  calculateMonthlySummary(month: string): FinancialSummary {
    const totalIncome = this.incomeRepository.calculateTotalIncomeForMonth(month);
    const totalExpenses = this.expenseRepository.getTotalSpendingForMonth(month);
    const categoryBreakdown = this.expenseRepository.getMonthlySpendingByCategory(month);
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      categoryBreakdown,
    };
  }

  calculateOverallSummary(): FinancialSummary {
    const totalIncome = this.incomeRepository.calculateTotalIncome();
    const allExpenses = this.expenseRepository.findAll();
    const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryBreakdown = this.groupExpensesByCategory(allExpenses);
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      categoryBreakdown,
    };
  }

  private groupExpensesByCategory(
    expenses: Array<{ category: string; amount: number }>
  ): CategorySummary[] {
    const spendingByCategory = new Map<string, number>();
    for (const expense of expenses) {
      spendingByCategory.set(
        expense.category,
        (spendingByCategory.get(expense.category) ?? 0) + expense.amount
      );
    }
    return Array.from(spendingByCategory.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }
}
