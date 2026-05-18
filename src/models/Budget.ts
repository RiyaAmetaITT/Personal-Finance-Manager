export interface Budget {
  id?: number;
  category: string;
  monthly_limit: number;
  month: string;          // format: YYYY-MM
}

export interface BudgetCreateInput {
  category: string;
  monthly_limit: number;
  month: string;
}

export interface BudgetStatus extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}
