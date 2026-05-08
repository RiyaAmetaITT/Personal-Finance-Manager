import { AuthValidator } from '../../src/validators/AuthValidator';

describe('AuthValidator', () => {

  describe('validateRegistration()', () => {
    it('should pass for a valid username and password', () => {
      const result = AuthValidator.validateRegistration({ username: 'alice_01', password: 'secure1' });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for a username shorter than 3 characters', () => {
      const result = AuthValidator.validateRegistration({ username: 'ab', password: 'secure1' });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail for a username longer than 20 characters', () => {
      const result = AuthValidator.validateRegistration({ username: 'a'.repeat(21), password: 'secure1' });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail for a username with spaces', () => {
      const result = AuthValidator.validateRegistration({ username: 'ali ce', password: 'secure1' });
      expect(result.isValid).toBe(false);
    });

    it('should fail for a username with special characters other than underscore', () => {
      const result = AuthValidator.validateRegistration({ username: 'ali@ce!', password: 'secure1' });
      expect(result.isValid).toBe(false);
    });

    it('should fail for a password shorter than 6 characters', () => {
      const result = AuthValidator.validateRegistration({ username: 'alice', password: '12345' });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail for an empty username', () => {
      const result = AuthValidator.validateRegistration({ username: '', password: 'secure1' });
      expect(result.isValid).toBe(false);
    });

    it('should fail for an empty password', () => {
      const result = AuthValidator.validateRegistration({ username: 'alice', password: '' });
      expect(result.isValid).toBe(false);
    });

    it('should accept exactly 3-character usernames (boundary)', () => {
      const result = AuthValidator.validateRegistration({ username: 'ali', password: 'secure1' });
      expect(result.isValid).toBe(true);
    });

    it('should accept exactly 20-character usernames (boundary)', () => {
      const result = AuthValidator.validateRegistration({ username: 'a'.repeat(20), password: 'secure1' });
      expect(result.isValid).toBe(true);
    });

    it('should accept exactly 6-character passwords (boundary)', () => {
      const result = AuthValidator.validateRegistration({ username: 'alice', password: '123456' });
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateLogin()', () => {
    it('should pass for a non-empty username and password', () => {
      const result = AuthValidator.validateLogin('alice', 'anypassword');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for an empty username', () => {
      const result = AuthValidator.validateLogin('', 'anypassword');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail for an empty password', () => {
      const result = AuthValidator.validateLogin('alice', '');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail for a whitespace-only username', () => {
      const result = AuthValidator.validateLogin('   ', 'anypassword');
      expect(result.isValid).toBe(false);
    });

    it('should fail for null username', () => {
      const result = AuthValidator.validateLogin(null, 'anypassword');
      expect(result.isValid).toBe(false);
    });

    it('should fail for undefined password', () => {
      const result = AuthValidator.validateLogin('alice', undefined);
      expect(result.isValid).toBe(false);
    });
  });
});
