import crypto from 'crypto';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { User, UserCreateInput, Session } from '../models/User';
import { AuthValidator } from '../validators/AuthValidator';

export class AuthService {
  private currentSession: Session | null = null;

  constructor(private readonly userRepository: IUserRepository) {}

  register(data: UserCreateInput): User {
    const validation = AuthValidator.validateRegistration(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const existingUser = this.userRepository.findByUsername(data.username);
    if (existingUser) {
      throw new Error(
        `Username "${data.username}" is already taken. Please choose another.`
      );
    }

    const password_hash = this.hashPassword(data.password);
    return this.userRepository.create({
      username: data.username,
      password: data.password,
      password_hash,
    });
  }

  login(username: string, password: string): Session {
    const validation = AuthValidator.validateLogin(username, password);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const user = this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password.');
    }

    if (!this.verifyPassword(password, user.password_hash)) {
      throw new Error('Invalid username or password.');
    }

    this.currentSession = {
      userId: user.id,
      username: user.username,
      loggedInAt: new Date().toISOString(),
    };
    return this.currentSession;
  }

  logout(): void {
    this.currentSession = null;
  }
  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  isLoggedIn(): boolean {
    return this.currentSession !== null;
  }

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .createHash('sha256')
      .update(salt + password)
      .digest('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, expectedHash] = storedHash.split(':');
    if (!salt || !expectedHash) return false;
    const actualHash = crypto
      .createHash('sha256')
      .update(salt + password)
      .digest('hex');
    return actualHash === expectedHash;
  }
}
