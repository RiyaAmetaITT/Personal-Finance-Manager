import inquirer from 'inquirer';
import chalk from 'chalk';
import { BudgetService } from '../../services/BudgetService';
import { ConsoleFormatter } from '../ConsoleFormatter';

export class BudgetMenu {
  constructor(private readonly budgetService: BudgetService) {}

  async show(): Promise<void> {
    let running = true;
    while (running) {
      ConsoleFormatter.header('Budget Management');
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Choose an action:',
          choices: [
            { name: 'Set / Update Budget', value: 'set' },
            { name: 'Track Budget for Month', value: 'track' },
            { name: 'View All Budgets', value: 'viewAll' },
            { name: 'Back', value: 'back' },
          ],
        },
      ]);

      switch (action) {
        case 'set':
          await this.setBudget();
          break;
        case 'track':
          await this.trackBudget();
          break;
        case 'viewAll':
          this.viewAllBudgets();
          break;
        case 'back':
          running = false;
          break;
      }
    }
  }

  private async setBudget(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'category',
        message: 'Category (e.g. Food, Rent):',
        validate: (v) => (v.trim().length > 0 ? true : 'Category cannot be empty.'),
      },
      {
        type: 'input',
        name: 'monthly_limit',
        message: 'Monthly Limit (₹):',
        validate: (v) => (parseFloat(v) > 0 ? true : 'Enter a positive number.'),
        filter: (v) => parseFloat(v),
      },
      {
        type: 'input',
        name: 'month',
        message: 'Month (YYYY-MM):',
        default: new Date().toISOString().slice(0, 7),
        validate: (v) =>
          /^\d{4}-\d{2}$/.test(v) ? true : 'Use YYYY-MM format.',
      },
    ]);

    try {
      const budget = this.budgetService.setBudget(answers);
      ConsoleFormatter.success(
        `Budget set — ${budget.category} | ${ConsoleFormatter.formatCurrency(budget.monthly_limit)} for ${budget.month}`
      );
    } catch (err: unknown) {
      ConsoleFormatter.error((err as Error).message);
    }
  }

  private async trackBudget(): Promise<void> {
    const { month } = await inquirer.prompt([
      {
        type: 'input',
        name: 'month',
        message: 'Month to track (YYYY-MM):',
        default: new Date().toISOString().slice(0, 7),
        validate: (v) =>
          /^\d{4}-\d{2}$/.test(v) ? true : 'Use YYYY-MM format.',
      },
    ]);

    const statuses = this.budgetService.calculateBudgetStatusForMonth(month);
    if (statuses.length === 0) {
      ConsoleFormatter.info(`No budgets set for ${month}.`);
      return;
    }

    ConsoleFormatter.header(`Budget Tracker — ${month}`);
    ConsoleFormatter.printTable(
      ['Category', 'Limit', 'Spent', 'Remaining', 'Used %', 'Status'],
      statuses.map((s) => [
        s.category,
        ConsoleFormatter.formatCurrency(s.monthly_limit),
        ConsoleFormatter.formatCurrency(s.spent),
        ConsoleFormatter.formatCurrency(s.remaining),
        `${s.percentage.toFixed(1)}%`,
        s.isOverBudget
          ? chalk.red('OVER BUDGET')
          : chalk.green('OK'),
      ])
    );
  }

  private viewAllBudgets(): void {
    const budgets = this.budgetService.getAllBudgets();
    if (budgets.length === 0) {
      ConsoleFormatter.info('No budgets configured yet.');
      return;
    }
    ConsoleFormatter.header('All Budgets');
    ConsoleFormatter.printTable(
      ['ID', 'Month', 'Category', 'Monthly Limit'],
      budgets.map((b) => [
        String(b.id),
        b.month,
        b.category,
        ConsoleFormatter.formatCurrency(b.monthly_limit),
      ])
    );
  }
}
