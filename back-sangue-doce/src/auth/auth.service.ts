import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import {
  UserEmailAlreadyExistsError,
  UserRepository,
} from '@app/users/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { formatDateToDayMonthYear } from '@app/@helper/format-date.helper';
import { DiabetesTypeEnum } from '@shared/enum/diabets-type.enum';
import type { JwtPayload } from './types/jwt-payload.type';
import { AuthenticatedRequest } from '@app/@infra/guard/auth.guard';
import { UserEntity } from '@app/users/entities/user.entity';
import type {
  GoogleAuthUser,
  GoogleProfileUser,
} from './types/google-auth-user.type';
import {
  type UpdateProfileDto,
  updateProfileSchema,
} from './dto/update-profile.dto';
import { type SetPasswordDto, setPasswordSchema } from './dto/set-password.dto';

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

    const payload = this.createJwtPayload(user);

    const access_token = await this.signJwt(payload);

    return {
      access_token,
    };
  }

  async validateGoogleUser(
    profile: GoogleProfileUser,
  ): Promise<GoogleAuthUser> {
    const email = profile.email.trim().toLowerCase();
    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      try {
        user = await this.userRepository.create(
          UserEntity.create({
            name: profile.name,
            email,
            passwordHash: this.createOAuthPasswordHash(profile.googleId),
          }),
        );
      } catch (error) {
        if (!(error instanceof UserEmailAlreadyExistsError)) {
          throw error;
        }

        user = await this.userRepository.findByEmail(email);
      }
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    const access_token = await this.signJwt(this.createJwtPayload(user));

    return { access_token };
  }

  async updateProfile(
    currentUser: JwtPayload,
    updateProfileDto: UpdateProfileDto,
  ): Promise<{ access_token: string; profile: JwtPayload }> {
    const payload = this.parseUpdateProfile(updateProfileDto);
    const user = await this.userRepository.updateProfile(currentUser.sub, {
      name: payload.name,
      birthDate: payload.birthDate ? new Date(payload.birthDate) : null,
      diabetesType: payload.diabetesType,
    });
    const profile = this.createJwtPayload(user);
    const access_token = await this.signJwt(profile);

    return { access_token, profile };
  }

  async getProfile(currentUser: JwtPayload): Promise<JwtPayload> {
    const user = await this.userRepository.findById(currentUser.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.createJwtPayload(user);
  }

  async setInitialPassword(
    currentUser: JwtPayload,
    setPasswordDto: SetPasswordDto,
  ): Promise<{ access_token: string; profile: JwtPayload }> {
    const payload = this.parseSetPassword(setPasswordDto);
    const user = await this.userRepository.findById(currentUser.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!this.isPasswordSetupRequired(user)) {
      throw new BadRequestException('Password is already configured.');
    }

    const updatedUser = await this.userRepository.updatePasswordHash(
      currentUser.sub,
      await this.hashPassword(payload.password),
    );
    const profile = this.createJwtPayload(updatedUser);
    const access_token = await this.signJwt(profile);

    return { access_token, profile };
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

  private createJwtPayload(userEntity: UserEntity): JwtPayload {
    const user = userEntity.toPublic();

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
      passwordSetupRequired: this.isPasswordSetupRequired(userEntity),
      createdAt: formatDateToDayMonthYear(user.createdAt),
      updatedAt: formatDateToDayMonthYear(user.updatedAt),
    };
  }

  private signJwt(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  private parseUpdateProfile(updateProfileDto: UpdateProfileDto): {
    name: string;
    birthDate: string | null;
    diabetesType: NonNullable<UpdateProfileDto['diabetesType']>;
  } {
    const result = updateProfileSchema.safeParse(updateProfileDto);

    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((issue) => issue.message),
      );
    }

    return {
      name: result.data.name,
      birthDate: result.data.birthDate ?? null,
      diabetesType: result.data.diabetesType,
    };
  }

  private parseSetPassword(setPasswordDto: SetPasswordDto): SetPasswordDto {
    const result = setPasswordSchema.safeParse(setPasswordDto);

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

  private createOAuthPasswordHash(providerUserId: string): string {
    return `oauth:google:${providerUserId}:${randomBytes(16).toString('hex')}`;
  }

  private isPasswordSetupRequired(user: UserEntity): boolean {
    return user.getPasswordHash().startsWith('oauth:');
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
