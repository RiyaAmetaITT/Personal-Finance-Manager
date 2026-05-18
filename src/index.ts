import { DatabaseConnection } from './database/db';
import { ExpenseRepository } from './repositories/ExpenseRepository';
import { IncomeRepository } from './repositories/IncomeRepository';
import { BudgetRepository } from './repositories/BudgetRepository';
import { UserRepository } from './repositories/UserRepository';
import { ExpenseService } from './services/ExpenseService';
import { IncomeService } from './services/IncomeService';
import { BudgetService } from './services/BudgetService';
import { SummaryService } from './services/SummaryService';
import { AuthService } from './services/AuthService';
import { ExpenseMenu } from './cli/menus/ExpenseMenu';
import { IncomeMenu } from './cli/menus/IncomeMenu';
import { BudgetMenu } from './cli/menus/BudgetMenu';
import { SummaryMenu } from './cli/menus/SummaryMenu';
import { AuthMenu } from './cli/menus/AuthMenu';
import { MainMenu } from './cli/menus/MainMenu';

async function startApplication(): Promise<void> {
  const databaseConnection = DatabaseConnection.getInstance();

  const expenseRepository = new ExpenseRepository(databaseConnection);
  const incomeRepository = new IncomeRepository(databaseConnection);
  const budgetRepository = new BudgetRepository(databaseConnection);
  const userRepository = new UserRepository(databaseConnection);

  const expenseService = new ExpenseService(expenseRepository);
  const incomeService = new IncomeService(incomeRepository);
  const budgetService = new BudgetService(budgetRepository, expenseRepository);
  const summaryService = new SummaryService(expenseRepository, incomeRepository);
  const authService = new AuthService(userRepository);

  const authMenu = new AuthMenu(authService);
  const expenseMenu = new ExpenseMenu(expenseService);
  const incomeMenu = new IncomeMenu(incomeService);
  const budgetMenu = new BudgetMenu(budgetService);
  const summaryMenu = new SummaryMenu(summaryService);
  const mainMenu = new MainMenu(
    expenseMenu,
    incomeMenu,
    budgetMenu,
    summaryMenu,
    authService
  );

  let keepRunning = true;
  while (keepRunning) {
    await authMenu.showLoginOrRegister();

    await mainMenu.run();

    if (!authService.isLoggedIn()) {
      const { continueApp } = await import('inquirer').then((m) =>
        m.default.prompt([
          {
            type: 'confirm',
            name: 'continueApp',
            message: 'Would you like to log in again?',
            default: false,
          },
        ])
      );
      keepRunning = continueApp;
    } else {
      keepRunning = false;
    }
  }
}

startApplication().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
