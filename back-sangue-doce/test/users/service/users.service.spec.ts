import type { CreateUserDto } from "@app/users/dto/create-user.dto";
import { type UserDiabetesType, UserEntity, type UserRole } from "@app/users/entities/user.entity";
import {
  UserEmailAlreadyExistsError,
  UserRepository,
} from "@app/users/repositories/user.repository";
import { UsersService } from "@app/users/users.service";
import { BadRequestException, ConflictException } from "@nestjs/common";

type MockUserRepository = jest.Mocked<UserRepository>;

const now = new Date("2026-07-18T12:00:00.000Z");

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
    id: props.id ?? "4f3069fb-7d80-45b1-a2b4-dc2d3dbec84d",
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

function makeRepository(): MockUserRepository {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    updateProfile: jest.fn(),
    updatePasswordHash: jest.fn(),
    updateAvatarUrl: jest.fn(),
  };
}

describe("UsersService", () => {
  let repository: MockUserRepository;
  let service: UsersService;

  beforeEach(() => {
    repository = makeRepository();
    service = new UsersService(repository);
  });

  describe("create", () => {
    const payload: CreateUserDto = {
      name: " Jander Nery ",
      email: "JANDER@EXAMPLE.COM",
      password: "strong-pass",
      birthDate: "1990-01-01",
      diabetesType: "TYPE_1",
    };

    it("validates, normalizes and persists a public user", async () => {
      repository.create.mockImplementation(async (user) => {
        const persistence = user.toPersistence();

        expect(persistence).toEqual({
          name: "Jander Nery",
          email: "jander@example.com",
          passwordHash: expect.stringMatching(/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/),
          avatarUrl: null,
          birthDate: new Date("1990-01-01"),
          diabetesType: "TYPE_1",
          role: "USER",
        });

        return makeUserEntity({
          name: persistence.name,
          email: persistence.email,
          passwordHash: persistence.passwordHash,
          birthDate: persistence.birthDate,
          diabetesType: persistence.diabetesType,
          role: persistence.role,
        });
      });

      await expect(service.create(payload)).resolves.toMatchObject({
        id: "4f3069fb-7d80-45b1-a2b4-dc2d3dbec84d",
        name: "Jander Nery",
        email: "jander@example.com",
        diabetesType: "TYPE_1",
        role: "USER",
      });
      expect(repository.create).toHaveBeenCalledTimes(1);
    });

    it("rejects invalid payloads", async () => {
      await expect(
        service.create({
          name: "J",
          email: "invalid",
          password: "short",
          diabetesType: "UNKNOWN",
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("maps duplicate e-mail errors to conflict", async () => {
      repository.create.mockRejectedValue(new UserEmailAlreadyExistsError());

      await expect(service.create(payload)).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe("findAll", () => {
    it("returns public users", async () => {
      repository.findAll.mockResolvedValue([
        makeUserEntity({ id: "4f3069fb-7d80-45b1-a2b4-dc2d3dbec84d" }),
        makeUserEntity({
          id: "09b8bff7-81f2-4b4c-8f91-b61c9c2fa926",
          email: "maria@example.com",
        }),
      ]);

      await expect(service.findAll()).resolves.toHaveLength(2);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("findOne", () => {
    it("rejects invalid ids", async () => {
      await expect(service.findOne("not-a-uuid")).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.findById).not.toHaveBeenCalled();
    });

    it("rejects missing users", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne("4f3069fb-7d80-45b1-a2b4-dc2d3dbec84d")).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it("returns the public user by id", async () => {
      repository.findById.mockResolvedValue(makeUserEntity());

      await expect(service.findOne("4f3069fb-7d80-45b1-a2b4-dc2d3dbec84d")).resolves.toMatchObject({
        id: "4f3069fb-7d80-45b1-a2b4-dc2d3dbec84d",
        email: "jander@example.com",
      });
    });
  });

  describe("findEmail", () => {
    it("returns null when no user matches the e-mail", async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(service.findEmail("missing@example.com")).resolves.toBeNull();
    });

    it("returns the public user by e-mail", async () => {
      repository.findByEmail.mockResolvedValue(makeUserEntity());

      await expect(service.findEmail("jander@example.com")).resolves.toMatchObject({
        email: "jander@example.com",
      });
    });
  });
});
