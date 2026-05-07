/**
 * User — domain model for an authenticated user account.
 * Passwords are never stored in plain text; only the hash is persisted.
 */
export interface User {
  id: number;
  username: string;
  password_hash: string; // SHA-256 hex digest stored in DB
  created_at: string;    // ISO datetime string
}

/** Input shape for registering a new user (plain password — hashed by AuthService) */
export interface UserCreateInput {
  username: string;
  password: string; // plain-text; hashed before being passed to the repository
}

/** Lightweight session object held in memory for the duration of the run */
export interface Session {
  userId: number;
  username: string;
  loggedInAt: string; // ISO datetime string
}
