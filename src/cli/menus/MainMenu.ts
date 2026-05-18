import inquirer from 'inquirer';
import chalk from 'chalk';
import { ExpenseMenu } from './ExpenseMenu';
import { IncomeMenu } from './IncomeMenu';
import { BudgetMenu } from './BudgetMenu';
import { SummaryMenu } from './SummaryMenu';
import { AuthService } from '../../services/AuthService';

export class MainMenu {
  constructor(
    private readonly expenseMenu: ExpenseMenu,
    private readonly incomeMenu: IncomeMenu,
    private readonly budgetMenu: BudgetMenu,
    private readonly summaryMenu: SummaryMenu,
    private readonly authService: AuthService
  ) {}

  async run(): Promise<void> {
    this.printBanner();
    await this.runNavigationLoop();
  }

  private printBanner(): void {
    const session = this.authService.getCurrentSession();
    const user = session ? `  Logged in as: ${session.username}` : '';
    console.log(chalk.cyan.bold('\n╔════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║     Personal Finance Manager       ║'));
    console.log(chalk.cyan.bold('╚════════════════════════════════════╝'));
    if (user) console.log(chalk.gray(user));
    console.log();
  }

  private async runNavigationLoop(): Promise<void> {
    let isRunning = true;
    while (isRunning) {
      const selectedModule = await this.promptModuleSelection();
      isRunning = await this.handleModuleSelection(selectedModule);
    }
  }

  private async promptModuleSelection(): Promise<string> {
    const { module } = await inquirer.prompt([
      {
        type: 'list',
        name: 'module',
        message: 'Select a module:',
        choices: [
          { name: 'Expense Management', value: 'expense' },
          { name: 'Income Management', value: 'income' },
          { name: 'Budget Management', value: 'budget' },
          { name: 'Summary', value: 'summary' },
          { name: 'Logout', value: 'logout' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ]);
    return module;
  }

  private async handleModuleSelection(selectedModule: string): Promise<boolean> {
    switch (selectedModule) {
      case 'expense':
        await this.expenseMenu.show();
        return true;
      case 'income':
        await this.incomeMenu.show();
        return true;
      case 'budget':
        await this.budgetMenu.show();
        return true;
      case 'summary':
        await this.summaryMenu.show();
        return true;
      case 'logout':
        this.authService.logout();
        console.log(chalk.cyan('\nYou have been logged out.\n'));
        return false;
      case 'exit':
        console.log(chalk.cyan('\nGoodbye!\n'));
        return false;
      default:
        return true;
    }
  }
}
