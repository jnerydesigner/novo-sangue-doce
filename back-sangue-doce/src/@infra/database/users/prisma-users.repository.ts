import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserEntity } from '@app/users/entities/user.entity';
import {
  UserEmailAlreadyExistsError,
  UserRepository,
} from '@app/users/repositories/user.repository';
import { PrismaService } from '../prisma.service';

type UserRecord = Prisma.UserGetPayload<Record<string, never>>;

@Injectable()
export class PrismaUsersRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: UserEntity): Promise<UserEntity> {
    try {
      const createdUser = await this.prisma.user.create({
        data: user.toPersistence(),
      });

      return this.toEntity(createdUser);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new UserEmailAlreadyExistsError();
      }

      throw error;
    }
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.toEntity(user));
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    return user ? this.toEntity(user) : null;
  }

  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    return user ? this.toEntity(user) : null;
  }

  private toEntity(user: UserRecord): UserEntity {
    return UserEntity.fromPersistence(user);
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
