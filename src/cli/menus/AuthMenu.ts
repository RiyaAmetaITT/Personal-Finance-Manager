import inquirer from 'inquirer';
import { AuthService } from '../../services/AuthService';
import { ConsoleFormatter } from '../ConsoleFormatter';
import { Session } from '../../models/User';
import { REGEX, NUMBERS } from '../../constants';

export class AuthMenu {
  constructor(private readonly authService: AuthService) {}

  async showLoginOrRegister(): Promise<Session> {
    ConsoleFormatter.header('Personal Finance Manager');
    console.log('  Please log in or create an account to continue.\n');

    while (true) {
      const { choice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'What would you like to do?',
          choices: [
            { name: 'Login', value: 'login' },
            { name: 'Register', value: 'register' },
          ],
        },
      ]);

      try {
        if (choice === 'login') {
          const session = await this.promptLogin();
          return session;
        } else {
          const session = await this.promptRegister();
          return session;
        }
      } catch (err: unknown) {
        ConsoleFormatter.error((err as Error).message);
      }
    }
  }

  async promptLogin(): Promise<Session> {
    ConsoleFormatter.header('Login');
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Username:',
        validate: (v) => (v.trim().length > 0 ? true : 'Username cannot be empty.'),
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:',
        mask: '*',
        validate: (v) => (v.length > 0 ? true : 'Password cannot be empty.'),
      },
    ]);

    const session = this.authService.login(answers.username, answers.password);
    ConsoleFormatter.success(`Welcome back, ${session.username}!`);
    return session;
  }

  async promptRegister(): Promise<Session> {
    ConsoleFormatter.header('Create Account');
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: `Choose a username (${NUMBERS.USERNAME_MIN_LENGTH}–${NUMBERS.USERNAME_MAX_LENGTH} chars, letters/numbers/_):`,
        validate: (v) =>
          REGEX.USERNAME.test(v.trim())
            ? true
            : `Username must be ${NUMBERS.USERNAME_MIN_LENGTH}–${NUMBERS.USERNAME_MAX_LENGTH} alphanumeric characters or underscores.`,
      },
      {
        type: 'password',
        name: 'password',
        message: `Choose a password (min ${NUMBERS.PASSWORD_MIN_LENGTH} characters):`,
        mask: '*',
        validate: (v) =>
          v.length >= NUMBERS.PASSWORD_MIN_LENGTH ? true : `Password must be at least ${NUMBERS.PASSWORD_MIN_LENGTH} characters.`,
      },
      {
        type: 'password',
        name: 'confirmPassword',
        message: 'Confirm password:',
        mask: '*',
        validate: (v, answers) =>
          v === answers?.password ? true : 'Passwords do not match.',
      },
    ]);

    this.authService.register({
      username: answers.username,
      password: answers.password,
    });

    const session = this.authService.login(answers.username, answers.password);
    ConsoleFormatter.success(
      `Account created! Welcome, ${session.username}!`
    );
    return session;
  }
}
