import { UserEntity } from '../entities/user.entity';
import type { UserDiabetesType } from '../entities/user.entity';

export class UserEmailAlreadyExistsError extends Error {
  constructor() {
    super('User e-mail already exists.');
    this.name = 'UserEmailAlreadyExistsError';
  }
}

export abstract class UserRepository {
  abstract create(user: UserEntity): Promise<UserEntity>;
  abstract findAll(): Promise<UserEntity[]>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findByEmailWithPassword(email: string): Promise<UserEntity | null>;
  abstract updateProfile(
    id: string,
    data: {
      name: string;
      birthDate: Date | null;
      diabetesType: UserDiabetesType;
    },
  ): Promise<UserEntity>;
  abstract updatePasswordHash(
    id: string,
    passwordHash: string,
  ): Promise<UserEntity>;
  abstract updateAvatarUrl(id: string, avatarUrl: string): Promise<UserEntity>;
}
