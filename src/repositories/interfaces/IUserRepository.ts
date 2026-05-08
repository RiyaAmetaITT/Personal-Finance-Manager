import { User, UserCreateInput } from '../../models/User';

export interface IUserRepository {
  create(data: UserCreateInput & { password_hash: string }): User;
  findByUsername(username: string): User | null;
  findById(id: number): User | null;
}
