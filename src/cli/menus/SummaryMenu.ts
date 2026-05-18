import inquirer from 'inquirer';
import chalk from 'chalk';
import { SummaryService } from '../../services/SummaryService';
import { ConsoleFormatter } from '../ConsoleFormatter';

export class SummaryMenu {
  constructor(private readonly summaryService: SummaryService) {}

  async show(): Promise<void> {
    let running = true;
    while (running) {
      ConsoleFormatter.header('Financial Summary');
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Choose an action:',
          choices: [
            { name: 'Summary for a Specific Month', value: 'month' },
            { name: 'Overall Summary (All Time)', value: 'overall' },
            { name: 'Back', value: 'back' },
          ],
        },
      ]);

      switch (action) {
        case 'month':
          await this.showMonthSummary();
          break;
        case 'overall':
          this.showOverallSummary();
          break;
        case 'back':
          running = false;
          break;
      }
    }
  }

  private async showMonthSummary(): Promise<void> {
    const { month } = await inquirer.prompt([
      {
        type: 'input',
        name: 'month',
        message: 'Month (YYYY-MM):',
        default: new Date().toISOString().slice(0, 7),
        validate: (v) =>
          /^\d{4}-\d{2}$/.test(v) ? true : 'Use YYYY-MM format.',
      },
    ]);
    this.printSummary(this.summaryService.calculateMonthlySummary(month), month);
  }

  private showOverallSummary(): void {
    this.printSummary(this.summaryService.calculateOverallSummary(), 'All Time');
  }

  private printSummary(
    summary: ReturnType<SummaryService['calculateOverallSummary']>,
    label: string
  ): void {
    ConsoleFormatter.header(`Summary — ${label}`);

    console.log(chalk.green(`  Total Income  : ${ConsoleFormatter.formatCurrency(summary.totalIncome)}`));
    console.log(chalk.red(`  Total Expenses: ${ConsoleFormatter.formatCurrency(summary.totalExpenses)}`));
    ConsoleFormatter.divider();

    const balanceColor = summary.balance >= 0 ? chalk.green : chalk.red;
    console.log(balanceColor(`  Balance       : ${ConsoleFormatter.formatCurrency(summary.balance)}`));
    console.log('');

    if (summary.categoryBreakdown.length > 0) {
      console.log(chalk.cyan.bold('  Category-wise Spending:'));
      ConsoleFormatter.printTable(
        ['Category', 'Total Spent'],
        summary.categoryBreakdown.map((c) => [
          c.category,
          ConsoleFormatter.formatCurrency(c.total),
        ])
      );
    } else {
      ConsoleFormatter.info('No expenses recorded for this period.');
    }
  }
}
