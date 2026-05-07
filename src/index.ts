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

/**
 * Application entry point — Composition Root.
 * All objects are constructed and wired here via constructor injection.
 * No service or menu creates its own dependencies.
 *
 * Auth flow:
 *   1. AuthMenu.showLoginOrRegister() blocks until the user logs in/registers.
 *   2. Only after a valid Session is returned does MainMenu.run() execute.
 *   3. If the user chooses Logout from MainMenu, the loop restarts at step 1.
 */
async function startApplication(): Promise<void> {
  // ── Database (Singleton) ───────────────────────────────────────────────────
  const databaseConnection = DatabaseConnection.getInstance();

  // ── Repositories (data access layer) ──────────────────────────────────────
  const expenseRepository = new ExpenseRepository(databaseConnection);
  const incomeRepository = new IncomeRepository(databaseConnection);
  const budgetRepository = new BudgetRepository(databaseConnection);
  const userRepository = new UserRepository(databaseConnection);

  // ── Services (business logic layer) ───────────────────────────────────────
  const expenseService = new ExpenseService(expenseRepository);
  const incomeService = new IncomeService(incomeRepository);
  const budgetService = new BudgetService(budgetRepository, expenseRepository);
  const summaryService = new SummaryService(expenseRepository, incomeRepository);
  const authService = new AuthService(userRepository);

  // ── CLI Menus ──────────────────────────────────────────────────────────────
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

  // ── Auth-gated application loop ────────────────────────────────────────────
  // The outer loop restarts whenever the user logs out, so they can switch accounts.
  let keepRunning = true;
  while (keepRunning) {
    // Block until the user successfully authenticates
    await authMenu.showLoginOrRegister();

    // Run the finance app for the logged-in session
    await mainMenu.run();

    // After mainMenu exits (logout or exit), check if user chose logout or full exit
    if (!authService.isLoggedIn()) {
      // Logged out — ask if they want to log in again or quit
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
      // User chose Exit (not Logout) — stop entirely
      keepRunning = false;
    }
  }
}

startApplication().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
