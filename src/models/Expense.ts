export interface Expense {
  id?: number;
  amount: number;
  category: string;
  date: string;
  description?: string;
  created_at?: string;
}

export interface ExpenseCreateInput {
  amount: number;
  category: string;
  date: string;
  description?: string;
}
