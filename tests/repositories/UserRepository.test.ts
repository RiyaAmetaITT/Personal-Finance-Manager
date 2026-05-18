import Database from 'better-sqlite3';
import { DatabaseConnection } from '../../src/database/db';
import { SchemaInitializer } from '../../src/database/SchemaInitializer';
import { UserRepository } from '../../src/repositories/UserRepository';

describe('UserRepository', () => {
  let db: Database.Database;
  let repo: UserRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    SchemaInitializer.initialize(db);
    DatabaseConnection.setInstance(db);
    repo = new UserRepository(db);
  });

  afterEach(() => {
    DatabaseConnection.resetInstance();
  });

  describe('create()', () => {
    it('should return a User with a generated id', () => {
      const user = repo.create({ username: 'alice', password: 'secret1', password_hash: 'salt:hash' });
      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('number');
    });

    it('should store username in lowercase', () => {
      const user = repo.create({ username: 'ALICE', password: 'secret1', password_hash: 'salt:hash' });
      expect(user.username).toBe('alice');
    });

    it('should throw on duplicate username', () => {
      repo.create({ username: 'alice', password: 'secret1', password_hash: 'salt:hash' });
      expect(() =>
        repo.create({ username: 'alice', password: 'secret2', password_hash: 'salt2:hash2' })
      ).toThrow();
    });

    it('should persist the password_hash provided', () => {
      const user = repo.create({ username: 'bob', password: 'pass123', password_hash: 'mysalt:myhash' });
      expect(user.password_hash).toBe('mysalt:myhash');
    });

    it('should set created_at to a non-empty string', () => {
      const user = repo.create({ username: 'carol', password: 'pass123', password_hash: 's:h' });
      expect(typeof user.created_at).toBe('string');
      expect(user.created_at.length).toBeGreaterThan(0);
    });
  });

  describe('findByUsername()', () => {
    beforeEach(() => {
      repo.create({ username: 'alice', password: 'secret1', password_hash: 'salt:hash' });
    });

    it('should return the correct User for a known username', () => {
      const user = repo.findByUsername('alice');
      expect(user).not.toBeNull();
      expect(user!.username).toBe('alice');
    });

    it('should be case-insensitive', () => {
      const user = repo.findByUsername('ALICE');
      expect(user).not.toBeNull();
      expect(user!.username).toBe('alice');
    });

    it('should return null for an unknown username', () => {
      const user = repo.findByUsername('nobody');
      expect(user).toBeNull();
    });

    it('should return null for an empty string', () => {
      const user = repo.findByUsername('');
      expect(user).toBeNull();
    });
  });

  describe('findById()', () => {
    it('should return the correct User for a known id', () => {
      const created = repo.create({ username: 'dave', password: 'pass123', password_hash: 's:h' });
      const found = repo.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null for an unknown id', () => {
      const found = repo.findById(9999);
      expect(found).toBeNull();
    });

    it('should return null for id 0', () => {
      const found = repo.findById(0);
      expect(found).toBeNull();
    });
  });
});
