export interface CategorySummary {
  category: string;
  total: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: CategorySummary[];
}
