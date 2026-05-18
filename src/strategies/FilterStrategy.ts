export interface FilterStrategy {
  toSQLCondition(): { condition: string; params: unknown[] };
}

export class CategoryFilterStrategy implements FilterStrategy {
  constructor(private readonly category: string) {}

  toSQLCondition(): { condition: string; params: unknown[] } {
    return {
      condition: 'LOWER(category) = LOWER(?)',
      params: [this.category],
    };
  }
}

export class DateRangeFilterStrategy implements FilterStrategy {
  constructor(private readonly from: string, private readonly to: string) {}

  toSQLCondition(): { condition: string; params: unknown[] } {
    return {
      condition: 'date >= ? AND date <= ?',
      params: [this.from, this.to],
    };
  }
}
