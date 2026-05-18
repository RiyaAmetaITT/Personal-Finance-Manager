import chalk from 'chalk';

export class ConsoleFormatter {
  // ─── Currency ───────────────────────────────────────────────────────────────
  static formatCurrency(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }

  // ─── Table ───────────────────────────────────────────────────────────────────
  static printTable(headers: string[], rows: string[][]): void {
    const colWidths = headers.map((h, i) =>
      Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length))
    );
    const sep = '+' + colWidths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
    const formatRow = (cols: string[]) =>
      '|' + cols.map((c, i) => ` ${c.padEnd(colWidths[i])} `).join('|') + '|';

    console.log(chalk.gray(sep));
    console.log(chalk.cyan.bold(formatRow(headers)));
    console.log(chalk.gray(sep));
    for (const row of rows) {
      console.log(formatRow(row));
    }
    console.log(chalk.gray(sep));
  }

  // ─── Alerts ───────────────────────────────────────────────────────────────────
  static success(message: string): void {
    console.log(chalk.green(`\n[OK] ${message}\n`));
  }

  static error(message: string): void {
    console.log(chalk.red(`\n[ERROR] ${message}\n`));
  }

  static info(message: string): void {
    console.log(chalk.yellow(`\n[INFO] ${message}\n`));
  }

  static header(title: string): void {
    const line = '═'.repeat(title.length + 4);
    console.log(chalk.cyan.bold(`\n╔${line}╗`));
    console.log(chalk.cyan.bold(`║  ${title}  ║`));
    console.log(chalk.cyan.bold(`╚${line}╝\n`));
  }

  static divider(): void {
    console.log(chalk.gray('─'.repeat(50)));
  }
}
