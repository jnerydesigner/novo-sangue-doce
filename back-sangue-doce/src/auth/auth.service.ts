import { Injectable, UnauthorizedException } from '@nestjs/common';
import { scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { UserRepository } from '@app/users/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { formatDateToDayMonthYear } from '@app/@helper/format-date.helper';
import { DiabetesTypeEnum } from '@shared/enum/diabets-type.enum';
import type { PublicUserType } from '@shared/types/user-public.type';
import type { JwtPayload } from './types/jwt-payload.type';
import { AuthenticatedRequest } from '@app/@infra/guard/auth.guard';

const scrypt = promisify(scryptCallback);

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ access_token: string } | null> {
    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user) {
      return null;
    }

    const passwordMatches = await this.comparePassword(
      password,
      user.getPasswordHash(),
    );

    if (!passwordMatches) {
      return null;
    }

    const payload = this.createJwtPayload(user.toPublic());

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
    };
  }

  private async comparePassword(
    plainPassword: string,
    passwordHash: string,
  ): Promise<boolean> {
    const [algorithm, salt, storedHash] = passwordHash.split(':');

    if (algorithm !== 'scrypt' || !salt || !storedHash) {
      return false;
    }

    const derivedKey = (await scrypt(plainPassword, salt, 64)) as Buffer;
    const storedKey = Buffer.from(storedHash, 'hex');

    return (
      derivedKey.length === storedKey.length &&
      timingSafeEqual(derivedKey, storedKey)
    );
  }

  private createJwtPayload(user: PublicUserType): JwtPayload {
    return {
      sub: user.id,
      name: user.name,
      email: user.email,
      birthDate: user.birthDate
        ? formatDateToDayMonthYear(user.birthDate)
        : undefined,
      diabetesType: this.formatDiabetesType(user.diabetesType),
      role: user.role as 'ADMIN' | 'USER',
      roles: [user.role as 'ADMIN' | 'USER'],
      createdAt: formatDateToDayMonthYear(user.createdAt),
      updatedAt: formatDateToDayMonthYear(user.updatedAt),
    };
  }

  private formatDiabetesType(diabetesType: string): string {
    return (
      DiabetesTypeEnum[diabetesType as keyof typeof DiabetesTypeEnum] ??
      DiabetesTypeEnum.UNKNOWN
    );
  }

  getAuthenticatedUser(req: AuthenticatedRequest): JwtPayload {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return req.user;
  }
}
