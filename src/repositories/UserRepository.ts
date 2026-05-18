import Database from 'better-sqlite3';
import { User, UserCreateInput } from '../models/User';
import { IUserRepository } from './interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  constructor(private readonly db: Database.Database) {}

  create(data: UserCreateInput & { password_hash: string }): User {
    const result = this.db
      .prepare(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)'
      )
      .run(data.username.trim().toLowerCase(), data.password_hash);
    return this.findById(result.lastInsertRowid as number)!;
  }

  findByUsername(username: string): User | null {
    const row = this.db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(username.trim().toLowerCase());
    return (row as User) ?? null;
  }

  findById(id: number): User | null {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return (row as User) ?? null;
  }
}
