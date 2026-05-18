import inquirer from 'inquirer';
import { IncomeService } from '../../services/IncomeService';
import { ConsoleFormatter } from '../ConsoleFormatter';

export class IncomeMenu {
  constructor(private readonly incomeService: IncomeService) {}

  async show(): Promise<void> {
    let running = true;
    while (running) {
      ConsoleFormatter.header('Income Management');
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Choose an action:',
          choices: [
            { name: 'Add Income', value: 'add' },
            { name: 'View All Income', value: 'view' },
            { name: 'Back', value: 'back' },
          ],
        },
      ]);

      switch (action) {
        case 'add':
          await this.addIncome();
          break;
        case 'view':
          this.viewIncome();
          break;
        case 'back':
          running = false;
          break;
      }
    }
  }

  private async addIncome(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'amount',
        message: 'Amount (₹):',
        validate: (v) => (parseFloat(v) > 0 ? true : 'Enter a positive number.'),
        filter: (v) => parseFloat(v),
      },
      {
        type: 'input',
        name: 'source',
        message: 'Source (e.g. Salary, Freelance):',
        validate: (v) => (v.trim().length > 0 ? true : 'Source cannot be empty.'),
      },
      {
        type: 'input',
        name: 'date',
        message: 'Date (YYYY-MM-DD):',
        default: new Date().toISOString().slice(0, 10),
        validate: (v) =>
          /^\d{4}-\d{2}-\d{2}$/.test(v) ? true : 'Use YYYY-MM-DD format.',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description (optional):',
      },
    ]);

    try {
      const income = this.incomeService.addIncome(answers);
      ConsoleFormatter.success(
        `Income added — ID: ${income.id} | ${ConsoleFormatter.formatCurrency(income.amount)} | ${income.source}`
      );
    } catch (err: unknown) {
      ConsoleFormatter.error((err as Error).message);
    }
  }

  private viewIncome(): void {
    const incomes = this.incomeService.getAllIncome();
    if (incomes.length === 0) {
      ConsoleFormatter.info('No income records found.');
      return;
    }
    ConsoleFormatter.header('All Income');
    ConsoleFormatter.printTable(
      ['ID', 'Date', 'Source', 'Amount', 'Description'],
      incomes.map((i) => [
        String(i.id),
        i.date,
        i.source,
        ConsoleFormatter.formatCurrency(i.amount),
        i.description ?? '-',
      ])
    );
  }
}
