import Database from 'better-sqlite3';
import { DatabaseConnection } from '../../src/database/db';
import { SchemaInitializer } from '../../src/database/SchemaInitializer';
import { UserRepository } from '../../src/repositories/UserRepository';
import { AuthService } from '../../src/services/AuthService';

describe('AuthService', () => {
  let db: Database.Database;
  let userRepo: UserRepository;
  let authService: AuthService;

  beforeEach(() => {
    db = new Database(':memory:');
    SchemaInitializer.initialize(db);
    DatabaseConnection.setInstance(db);
    userRepo = new UserRepository(db);
    authService = new AuthService(userRepo);
  });

  afterEach(() => {
    DatabaseConnection.resetInstance();
  });

  describe('register()', () => {
    it('should create and return a new User', () => {
      const user = authService.register({ username: 'alice', password: 'secret1' });
      expect(user).toBeDefined();
      expect(user.username).toBe('alice');
      expect(typeof user.id).toBe('number');
    });

    it('should store a hash, not the plain-text password', () => {
      const user = authService.register({ username: 'alice', password: 'secret1' });
      expect(user.password_hash).not.toBe('secret1');
      expect(user.password_hash).toContain(':');
    });

    it('should throw on duplicate username', () => {
      authService.register({ username: 'alice', password: 'secret1' });
      expect(() =>
        authService.register({ username: 'alice', password: 'other123' })
      ).toThrow(/already taken/i);
    });

    it('should throw when username fails validation (too short)', () => {
      expect(() =>
        authService.register({ username: 'ab', password: 'secret1' })
      ).toThrow(/validation failed/i);
    });

    it('should throw when password is too short', () => {
      expect(() =>
        authService.register({ username: 'alice', password: '123' })
      ).toThrow(/validation failed/i);
    });
  });

  describe('login()', () => {
    beforeEach(() => {
      authService.register({ username: 'alice', password: 'secret1' });
    });

    it('should return a Session for correct credentials', () => {
      const session = authService.login('alice', 'secret1');
      expect(session).toBeDefined();
    });

    it('should contain the correct userId and username in Session', () => {
      const session = authService.login('alice', 'secret1');
      expect(session.username).toBe('alice');
      expect(typeof session.userId).toBe('number');
    });

    it('should set loggedInAt to an ISO date string', () => {
      const session = authService.login('alice', 'secret1');
      expect(() => new Date(session.loggedInAt)).not.toThrow();
    });

    it('should throw a generic message for wrong password (no enumeration)', () => {
      expect(() => authService.login('alice', 'wrongpass')).toThrow(
        /invalid username or password/i
      );
    });

    it('should throw a generic message for unknown username (no enumeration)', () => {
      expect(() => authService.login('nobody', 'secret1')).toThrow(
        /invalid username or password/i
      );
    });

    it('should throw when username is empty', () => {
      expect(() => authService.login('', 'secret1')).toThrow();
    });

    it('should throw when password is empty', () => {
      expect(() => authService.login('alice', '')).toThrow();
    });
  });

  describe('isLoggedIn()', () => {
    it('should return false before any login', () => {
      expect(authService.isLoggedIn()).toBe(false);
    });

    it('should return true after a successful login', () => {
      authService.register({ username: 'alice', password: 'secret1' });
      authService.login('alice', 'secret1');
      expect(authService.isLoggedIn()).toBe(true);
    });
  });

  describe('logout()', () => {
    it('should clear the session so isLoggedIn() returns false', () => {
      authService.register({ username: 'alice', password: 'secret1' });
      authService.login('alice', 'secret1');
      authService.logout();
      expect(authService.isLoggedIn()).toBe(false);
    });
  });

  describe('getCurrentSession()', () => {
    it('should return null before login', () => {
      expect(authService.getCurrentSession()).toBeNull();
    });

    it('should return the active Session after login', () => {
      authService.register({ username: 'alice', password: 'secret1' });
      authService.login('alice', 'secret1');
      const session = authService.getCurrentSession();
      expect(session).not.toBeNull();
      expect(session!.username).toBe('alice');
    });

    it('should return null again after logout', () => {
      authService.register({ username: 'alice', password: 'secret1' });
      authService.login('alice', 'secret1');
      authService.logout();
      expect(authService.getCurrentSession()).toBeNull();
    });
  });
});
