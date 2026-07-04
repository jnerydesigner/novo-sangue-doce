import {
  createHash,
  randomBytes,
  randomInt,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { formatDateToDayMonthYear } from "@app/@helper/format-date.helper";
import type { AuthenticatedRequest } from "@app/@infra/guard/auth.guard";
import { MailService } from "@app/mail/mail.service";
import { UserEntity } from "@app/users/entities/user.entity";
import {
  UserEmailAlreadyExistsError,
  UserRepository,
} from "@app/users/repositories/user.repository";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DiabetesTypeEnum } from "@shared/enum/diabets-type.enum";
import {
  type RequestEmailLoginCodeDto,
  requestEmailLoginCodeSchema,
} from "./dto/request-email-login-code.dto";
import { type SetPasswordDto, setPasswordSchema } from "./dto/set-password.dto";
import { type UpdateProfileDto, updateProfileSchema } from "./dto/update-profile.dto";
import {
  type VerifyEmailLoginCodeDto,
  verifyEmailLoginCodeSchema,
} from "./dto/verify-email-login-code.dto";
import { AuthRepository } from "./repositories/auth.repository";
import type { GoogleAuthUser, GoogleProfileUser } from "./types/google-auth-user.type";
import type { JwtPayload } from "./types/jwt-payload.type";

const scrypt = promisify(scryptCallback);
const EMAIL_LOGIN_CODE_TTL_IN_MINUTES = 5;
const EMAIL_LOGIN_CODE_MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<{ access_token: string } | null> {
    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user) {
      return null;
    }

    const passwordMatches = await this.comparePassword(password, user.getPasswordHash());

    if (!passwordMatches) {
      return null;
    }

    const payload = this.createJwtPayload(user);

    const access_token = await this.signJwt(payload);

    return {
      access_token,
    };
  }

  async validateGoogleUser(profile: GoogleProfileUser): Promise<GoogleAuthUser> {
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
      throw new BadRequestException("Password is already configured.");
    }

    const updatedUser = await this.userRepository.updatePasswordHash(
      currentUser.sub,
      await this.hashPassword(payload.password),
    );
    const profile = this.createJwtPayload(updatedUser);
    const access_token = await this.signJwt(profile);

    return { access_token, profile };
  }

  async createSession(user: UserEntity): Promise<{ access_token: string; profile: JwtPayload }> {
    const profile = this.createJwtPayload(user);
    const access_token = await this.signJwt(profile);

    return { access_token, profile };
  }

  async requestEmailLoginCode(
    requestEmailLoginCodeDto: RequestEmailLoginCodeDto,
  ): Promise<{ ok: true }> {
    const payload = this.parseRequestEmailLoginCode(requestEmailLoginCodeDto);
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      return { ok: true };
    }

    const code = this.generateLoginCode();
    const codeHash = this.hashLoginCode(code);
    const expiresAt = new Date(Date.now() + EMAIL_LOGIN_CODE_TTL_IN_MINUTES * 60 * 1000);

    await this.authRepository.createEmailCodeHash(payload.email, codeHash, expiresAt);
    await this.mailService.sendSystemEmail({
      to: payload.email,
      subject: "Seu codigo de acesso ao Sangue Doce",
      title: "Seu codigo de acesso",
      intro: "Use este codigo para entrar no Sangue Doce.",
      body: `Codigo: ${code}. Ele expira em ${EMAIL_LOGIN_CODE_TTL_IN_MINUTES} minutos.`,
      footerText: "Se voce nao pediu este codigo, pode ignorar este e-mail com seguranca.",
    });

    return { ok: true };
  }

  async verifyEmailLoginCode(
    verifyEmailLoginCodeDto: VerifyEmailLoginCodeDto,
  ): Promise<{ access_token: string }> {
    const payload = this.parseVerifyEmailLoginCode(verifyEmailLoginCodeDto);
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException("Codigo invalido ou expirado.");
    }

    const loginCode = await this.authRepository.findLatestEmailCode(payload.email);

    if (!loginCode || loginCode.expiresAt < new Date()) {
      throw new UnauthorizedException("Codigo invalido ou expirado.");
    }

    if (loginCode.attempts >= EMAIL_LOGIN_CODE_MAX_ATTEMPTS) {
      throw new UnauthorizedException("Codigo invalido ou expirado.");
    }

    if (!this.compareEasyCode(payload.code, loginCode.codeHash)) {
      await this.authRepository.incrementEmailCodeAttempts(loginCode.id);
      throw new UnauthorizedException("Codigo invalido ou expirado.");
    }

    await this.authRepository.consumeEmailCode(loginCode.id);

    return this.validateSessionUser(user);
  }

  private async comparePassword(plainPassword: string, passwordHash: string): Promise<boolean> {
    const [algorithm, salt, storedHash] = passwordHash.split(":");

    if (algorithm !== "scrypt" || !salt || !storedHash) {
      return false;
    }

    const derivedKey = (await scrypt(plainPassword, salt, 64)) as Buffer;
    const storedKey = Buffer.from(storedHash, "hex");

    return derivedKey.length === storedKey.length && timingSafeEqual(derivedKey, storedKey);
  }

  private compareEasyCode(plainCode: string, hashedCode: string): boolean {
    const hashedPlainCode = this.hashLoginCode(plainCode);

    const plainCodeBuffer = Buffer.from(hashedPlainCode, "hex");
    const hashedCodeBuffer = Buffer.from(hashedCode, "hex");

    if (plainCodeBuffer.length !== hashedCodeBuffer.length) {
      return false;
    }

    return timingSafeEqual(plainCodeBuffer, hashedCodeBuffer);
  }

  private async validateSessionUser(user: UserEntity): Promise<{ access_token: string }> {
    const payload = this.createJwtPayload(user);
    const access_token = await this.signJwt(payload);

    return { access_token };
  }

  private createJwtPayload(userEntity: UserEntity): JwtPayload {
    const user = userEntity.toPublic();

    return {
      sub: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      birthDate: user.birthDate ? formatDateToDayMonthYear(user.birthDate) : undefined,
      diabetesType: this.formatDiabetesType(user.diabetesType),
      role: user.role as "ADMIN" | "USER",
      roles: [user.role as "ADMIN" | "USER"],
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
    diabetesType: NonNullable<UpdateProfileDto["diabetesType"]>;
  } {
    const result = updateProfileSchema.safeParse(updateProfileDto);

    if (!result.success) {
      throw new BadRequestException(result.error.issues.map((issue) => issue.message));
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
      throw new BadRequestException(result.error.issues.map((issue) => issue.message));
    }

    return result.data;
  }

  private parseRequestEmailLoginCode(
    requestEmailLoginCodeDto: RequestEmailLoginCodeDto,
  ): RequestEmailLoginCodeDto {
    const result = requestEmailLoginCodeSchema.safeParse(requestEmailLoginCodeDto);

    if (!result.success) {
      throw new BadRequestException(result.error.issues.map((issue) => issue.message));
    }

    return {
      email: result.data.email.trim().toLowerCase(),
    };
  }

  private parseVerifyEmailLoginCode(
    verifyEmailLoginCodeDto: VerifyEmailLoginCodeDto,
  ): VerifyEmailLoginCodeDto {
    const result = verifyEmailLoginCodeSchema.safeParse(verifyEmailLoginCodeDto);

    if (!result.success) {
      throw new BadRequestException(result.error.issues.map((issue) => issue.message));
    }

    return {
      code: result.data.code,
      email: result.data.email.trim().toLowerCase(),
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

    return `scrypt:${salt}:${derivedKey.toString("hex")}`;
  }

  private createOAuthPasswordHash(providerUserId: string): string {
    return `oauth:google:${providerUserId}:${randomBytes(16).toString("hex")}`;
  }

  private isPasswordSetupRequired(user: UserEntity): boolean {
    return user.getPasswordHash().startsWith("oauth:");
  }

  private formatDiabetesType(diabetesType: string): string {
    return (
      DiabetesTypeEnum[diabetesType as keyof typeof DiabetesTypeEnum] ?? DiabetesTypeEnum.UNKNOWN
    );
  }

  getAuthenticatedUser(req: AuthenticatedRequest): JwtPayload {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return req.user;
  }

  private generateLoginCode(): string {
    return randomInt(100000, 1000000).toString();
  }

  private hashLoginCode(code: string): string {
    return createHash("sha256")
      .update(`${code}:${process.env.JWT_SECRET || "default_secret"}`)
      .digest("hex");
  }
}
