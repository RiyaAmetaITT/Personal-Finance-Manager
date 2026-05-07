# Personal Finance Manager

A console-based Personal Finance Manager built in **TypeScript** with **SQLite** persistence, demonstrating clean code practices and key design patterns.

---

## Features

- 💸 **Expense Management** — Add, view, filter (by category / date range), delete
- 💰 **Income Management** — Add and view income records
- 📊 **Budget Management** — Set monthly budgets per category, track spending vs. limit
- 📈 **Summary** — Total income, expenses, balance, and category-wise breakdown

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

---

## Setup & Installation

```bash
# 1. Clone / navigate to the project directory
cd Design_Patterns_Personal_Finance_Manager

# 2. Install dependencies
npm install

# 3. Run the application
npm start
```

The SQLite database file (`finance.db`) is automatically created inside the `data/` directory on first run.

---

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

---

## Project Structure

```
src/
├── database/       # DB singleton (db.ts)
├── models/         # Domain types: Expense, Income, Budget, Summary
├── strategies/     # Strategy pattern for filtering
├── validators/     # Input validation
├── repositories/   # Data access layer (interfaces + SQLite implementations)
├── services/       # Business logic layer
├── cli/            # Console UI (menus, formatter)
└── index.ts        # Entry point

tests/
├── validators/     # Validator unit tests
└── services/       # Service integration tests (in-memory SQLite)

docs/
├── DesignDocument.md
└── DatabaseDesign.md
```

---

## Tech Stack

| Dependency | Purpose |
|---|---|
| `better-sqlite3` | SQLite database driver |
| `inquirer` | Interactive console prompts |
| `chalk` | Colored terminal output |
| `typescript` | Language |
| `ts-node` | Run TypeScript directly |
| `jest` + `ts-jest` | Testing framework |
