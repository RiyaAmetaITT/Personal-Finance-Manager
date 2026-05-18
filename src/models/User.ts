export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface UserCreateInput {
  username: string;
  password: string;
}

export interface Session {
  userId: number;
  username: string;
  loggedInAt: string;
}
