import { AuthService } from "@app/auth/auth.service";
import { AuthRepository } from "@app/auth/repositories/auth.repository";
import type { JwtPayload } from "@app/auth/types/jwt-payload.type";
import type { MailService } from "@app/mail/mail.service";
import { type UserDiabetesType, UserEntity, type UserRole } from "@app/users/entities/user.entity";
import { UserRepository } from "@app/users/repositories/user.repository";
import { UnauthorizedException } from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

type MockUserRepository = Mocked<UserRepository>;
type MockAuthRepository = Mocked<AuthRepository>;
type MockMailService = Pick<Mocked<MailService>, "sendSystemEmail">;
type MockJwtService = Pick<Mocked<JwtService>, "signAsync">;

const now = new Date("2026-07-18T12:00:00.000Z");
const currentUser: JwtPayload = {
  sub: "4f3069fb-7d80-45b1-a2b4-dc2d3dbec84d",
  name: "Jander Nery",
  email: "jander@example.com",
  role: "USER",
  roles: ["USER"],
};

function makeUserEntity(
  props: {
    id?: string;
    name?: string;
    email?: string;
    passwordHash?: string;
    birthDate?: Date | null;
    diabetesType?: UserDiabetesType;
    role?: UserRole;
  } = {},
) {
  return UserEntity.fromPersistence({
    id: props.id ?? currentUser.sub,
    name: props.name ?? "Jander Nery",
    email: props.email ?? "jander@example.com",
    passwordHash: props.passwordHash ?? "scrypt:salt:hash",
    avatarUrl: null,
    birthDate: props.birthDate ?? null,
    diabetesType: props.diabetesType ?? "UNKNOWN",
    role: props.role ?? "USER",
    createdAt: now,
    updatedAt: now,
  });
}

function makeUserRepository(): MockUserRepository {
  return {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByEmailWithPassword: vi.fn(),
    updateProfile: vi.fn(),
    updatePasswordHash: vi.fn(),
    updateAvatarUrl: vi.fn(),
  };
}

function makeAuthRepository(): MockAuthRepository {
  return {
    createEmailCodeHash: vi.fn(),
    findLatestEmailCode: vi.fn(),
    incrementEmailCodeAttempts: vi.fn(),
    consumeEmailCode: vi.fn(),
  };
}

describe("AuthService", () => {
  let userRepository: MockUserRepository;
  let authRepository: MockAuthRepository;
  let mailService: MockMailService;
  let jwtService: MockJwtService;
  let service: AuthService;

  beforeEach(() => {
    userRepository = makeUserRepository();
    authRepository = makeAuthRepository();
    mailService = { sendSystemEmail: vi.fn() };
    jwtService = { signAsync: vi.fn().mockResolvedValue("new-access-token") };
    service = new AuthService(
      userRepository,
      authRepository,
      mailService as MailService,
      jwtService as JwtService,
    );
  });

  describe("changePassword", () => {
    it("updates the authenticated user's password without requiring the previous password", async () => {
      userRepository.findById.mockResolvedValue(makeUserEntity());
      userRepository.updatePasswordHash.mockImplementation((id, passwordHash) =>
        Promise.resolve(makeUserEntity({ id, passwordHash })),
      );

      await expect(
        service.changePassword(currentUser, { password: "new-password" }),
      ).resolves.toEqual({
        access_token: "new-access-token",
        profile: expect.objectContaining({
          sub: currentUser.sub,
          email: currentUser.email,
          passwordSetupRequired: false,
        }),
      });

      expect(userRepository.findById).toHaveBeenCalledWith(currentUser.sub);
      expect(userRepository.updatePasswordHash).toHaveBeenCalledWith(
        currentUser.sub,
        expect.stringMatching(/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/),
      );
      expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
    });

    it("rejects when the authenticated user no longer exists", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.changePassword(currentUser, { password: "new-password" }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(userRepository.updatePasswordHash).not.toHaveBeenCalled();
    });
  });
});
