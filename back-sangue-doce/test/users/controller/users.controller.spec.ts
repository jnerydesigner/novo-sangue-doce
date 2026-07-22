import { AuthGuard } from "@app/@infra/guard/auth.guard";
import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { UsersController } from "@app/users/users.controller";
import { UsersService } from "@app/users/users.service";
import { Test, type TestingModule } from "@nestjs/testing";
import { vi, type Mocked } from "vitest";

type MockUsersService = Mocked<
  Pick<UsersService, "create" | "findAll" | "findEmail" | "findOne">
>;

const publicUser = {
  id: "4f3069fb-7d80-45b1-a2b4-dc2d3dbec84d",
  name: "Jander Nery",
  email: "jander@example.com",
  diabetesType: "UNKNOWN" as const,
  role: "USER" as const,
  createdAt: new Date("2026-07-18T12:00:00.000Z"),
  updatedAt: new Date("2026-07-18T12:00:00.000Z"),
};

describe("UsersController", () => {
  let controller: UsersController;
  let service: MockUsersService;

  beforeEach(async () => {
    service = {
      create: vi.fn().mockResolvedValue(publicUser),
      findAll: vi.fn().mockResolvedValue([publicUser]),
      findEmail: vi.fn().mockResolvedValue(publicUser),
      findOne: vi.fn().mockResolvedValue(publicUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .compile();

    controller = module.get(UsersController);
  });

  it("delegates user creation to the service", async () => {
    const payload = {
      name: "Jander Nery",
      email: "jander@example.com",
      password: "strong-pass",
      diabetesType: "UNKNOWN" as const,
    };

    await expect(controller.create(payload)).resolves.toBe(publicUser);
    expect(service.create).toHaveBeenCalledWith(payload);
  });

  it("delegates user listing to the service", async () => {
    await expect(controller.findAll()).resolves.toEqual([publicUser]);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it("delegates e-mail search to the service", async () => {
    await expect(controller.findEmail("jander@example.com")).resolves.toBe(publicUser);
    expect(service.findEmail).toHaveBeenCalledWith("jander@example.com");
  });

  it("delegates user lookup to the service", async () => {
    await expect(controller.findOne(publicUser.id)).resolves.toBe(publicUser);
    expect(service.findOne).toHaveBeenCalledWith(publicUser.id);
  });
});
