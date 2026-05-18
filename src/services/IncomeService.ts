import { IIncomeRepository } from '../repositories/interfaces/IIncomeRepository';
import { Income, IncomeCreateInput } from '../models/Income';
import { IncomeValidator } from '../validators/IncomeValidator';

export class IncomeService {
  constructor(private readonly incomeRepository: IIncomeRepository) {}

  addIncome(data: IncomeCreateInput): Income {
    const validation = IncomeValidator.validate(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    const sanitizedIncome: IncomeCreateInput = {
      amount: data.amount,
      source: data.source.trim(),
      date: data.date.trim(),
      description: data.description?.trim(),
    };
    return this.incomeRepository.create(sanitizedIncome);
  }

  getAllIncome(): Income[] {
    return this.incomeRepository.findAll();
  }

  calculateTotalIncome(): number {
    return this.incomeRepository.calculateTotalIncome();
  }
}
