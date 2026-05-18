import inquirer from 'inquirer';
import { ExpenseService } from '../../services/ExpenseService';
import { ConsoleFormatter } from '../ConsoleFormatter';
import {
  CategoryFilterStrategy,
  DateRangeFilterStrategy,
} from '../../strategies/FilterStrategy';

export class ExpenseMenu {
  constructor(private readonly expenseService: ExpenseService) {}

  async show(): Promise<void> {
    let running = true;
    while (running) {
      ConsoleFormatter.header('Expense Management');
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Choose an action:',
          choices: [
            { name: 'Add Expense', value: 'add' },
            { name: 'View All Expenses', value: 'view' },
            { name: 'Filter by Category', value: 'filterCategory' },
            { name: 'Filter by Date Range', value: 'filterDate' },
            { name: 'Delete Expense', value: 'delete' },
            { name: 'Back', value: 'back' },
          ],
        },
      ]);

      switch (action) {
        case 'add':
          await this.addExpense();
          break;
        case 'view':
          this.viewExpenses();
          break;
        case 'filterCategory':
          await this.filterByCategory();
          break;
        case 'filterDate':
          await this.filterByDateRange();
          break;
        case 'delete':
          await this.deleteExpense();
          break;
        case 'back':
          running = false;
          break;
      }
    }
  }

  private async addExpense(): Promise<void> {
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
        name: 'category',
        message: 'Category:',
        validate: (v) => (v.trim().length > 0 ? true : 'Category cannot be empty.'),
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
      const expense = this.expenseService.addExpense(answers);
      ConsoleFormatter.success(
        `Expense added — ID: ${expense.id} | ${ConsoleFormatter.formatCurrency(expense.amount)} | ${expense.category}`
      );
    } catch (err: unknown) {
      ConsoleFormatter.error((err as Error).message);
    }
  }

  private viewExpenses(): void {
    const expenses = this.expenseService.getAllExpenses();
    if (expenses.length === 0) {
      ConsoleFormatter.info('No expenses found.');
      return;
    }
    ConsoleFormatter.header('All Expenses');
    ConsoleFormatter.printTable(
      ['ID', 'Date', 'Category', 'Amount', 'Description'],
      expenses.map((e) => [
        String(e.id),
        e.date,
        e.category,
        ConsoleFormatter.formatCurrency(e.amount),
        e.description ?? '-',
      ])
    );
  }

  private async filterByCategory(): Promise<void> {
    const { category } = await inquirer.prompt([
      { type: 'input', name: 'category', message: 'Enter category to filter:' },
    ]);
    const results = this.expenseService.getFilteredExpenses(
      new CategoryFilterStrategy(category)
    );
    if (results.length === 0) {
      ConsoleFormatter.info(`No expenses found for category "${category}".`);
      return;
    }
    ConsoleFormatter.header(`Expenses — Category: ${category}`);
    ConsoleFormatter.printTable(
      ['ID', 'Date', 'Amount', 'Description'],
      results.map((e) => [
        String(e.id),
        e.date,
        ConsoleFormatter.formatCurrency(e.amount),
        e.description ?? '-',
      ])
    );
  }

  private async filterByDateRange(): Promise<void> {
    const { from, to } = await inquirer.prompt([
      {
        type: 'input',
        name: 'from',
        message: 'From date (YYYY-MM-DD):',
        validate: (v) =>
          /^\d{4}-\d{2}-\d{2}$/.test(v) ? true : 'Use YYYY-MM-DD format.',
      },
      {
        type: 'input',
        name: 'to',
        message: 'To date (YYYY-MM-DD):',
        validate: (v) =>
          /^\d{4}-\d{2}-\d{2}$/.test(v) ? true : 'Use YYYY-MM-DD format.',
      },
    ]);
    const results = this.expenseService.getFilteredExpenses(
      new DateRangeFilterStrategy(from, to)
    );
    if (results.length === 0) {
      ConsoleFormatter.info(`No expenses found between ${from} and ${to}.`);
      return;
    }
    ConsoleFormatter.header(`Expenses: ${from} → ${to}`);
    ConsoleFormatter.printTable(
      ['ID', 'Date', 'Category', 'Amount', 'Description'],
      results.map((e) => [
        String(e.id),
        e.date,
        e.category,
        ConsoleFormatter.formatCurrency(e.amount),
        e.description ?? '-',
      ])
    );
  }

  private async deleteExpense(): Promise<void> {
    const expenses = this.expenseService.getAllExpenses();
    if (expenses.length === 0) {
      ConsoleFormatter.info('No expenses to delete.');
      return;
    }
    const { id } = await inquirer.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Enter the ID of the expense to delete:',
        validate: (v) => (Number.isInteger(Number(v)) && Number(v) > 0 ? true : 'Enter a valid ID.'),
        filter: (v) => parseInt(v, 10),
      },
    ]);
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Delete expense ID ${id}? This cannot be undone.`,
        default: false,
      },
    ]);
    if (!confirm) {
      ConsoleFormatter.info('Delete cancelled.');
      return;
    }
    try {
      this.expenseService.deleteExpense(id);
      ConsoleFormatter.success(`Expense ID ${id} deleted successfully.`);
    } catch (err: unknown) {
      ConsoleFormatter.error((err as Error).message);
    }
  }
}
