import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { CreateUserDto, createUserSchema } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import {
  UserEmailAlreadyExistsError,
  UserRepository,
} from './repositories/user.repository';
import { type PublicUserType } from '@shared/types/user-public.type';

const scrypt = promisify(scryptCallback);
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<PublicUserType> {
    const payload = this.parseCreateUser(createUserDto);

    const passwordHash = await this.hashPassword(payload.password);
    const userEntity = UserEntity.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
      birthDate: payload.birthDate,
      diabetesType: payload.diabetesType,
    });

    try {
      const user = await this.userRepository.create(userEntity);

      return user.toPublic();
    } catch (error) {
      if (error instanceof UserEmailAlreadyExistsError) {
        throw new ConflictException('E-mail already registered.');
      }

      throw error;
    }
  }

  async findAll(): Promise<PublicUserType[]> {
    const users = await this.userRepository.findAll();

    return users.map((user) => user.toPublic());
  }

  async findOne(id: string): Promise<PublicUserType> {
    if (!this.isValidUuid(id)) {
      throw new BadRequestException('Invalid user id.');
    }

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    return user.toPublic();
  }

  async findEmail(email: string): Promise<PublicUserType | null> {
    const user = await this.userRepository.findByEmail(email);

    return user ? user.toPublic() : null;
  }

  private parseCreateUser(createUserDto: CreateUserDto): CreateUserDto {
    const result = createUserSchema.safeParse(createUserDto);

    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((issue) => issue.message),
      );
    }

    return result.data;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  private isValidUuid(id: string): boolean {
    return UUID_REGEX.test(id);
  }
}
