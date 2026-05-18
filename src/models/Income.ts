export interface Income {
  id?: number;
  amount: number;
  source: string;
  date: string;
  description?: string;
  created_at?: string;
}

export interface IncomeCreateInput {
  amount: number;
  source: string;
  date: string;
  description?: string;
}
