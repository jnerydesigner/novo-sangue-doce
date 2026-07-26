import { AuthController } from "@app/auth/auth.controller";
import { AuthService } from "@app/auth/auth.service";
import { UnauthorizedException } from "@nestjs/common";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

type MockAuthService = Mocked<Pick<AuthService, "validateUser">>;

describe("AuthController", () => {
  let controller: AuthController;
  let service: MockAuthService;

  beforeEach(() => {
    service = {
      validateUser: vi.fn(),
    };
    controller = new AuthController(service as AuthService);
  });

  describe("login", () => {
    it("returns the access token when credentials are valid", async () => {
      service.validateUser.mockResolvedValue({ access_token: "access-token" });

      await expect(
        controller.login({ email: "jander@example.com", password: "123456" }),
      ).resolves.toEqual({ access_token: "access-token" });
      expect(service.validateUser).toHaveBeenCalledWith("jander@example.com", "123456");
    });

    it("rejects invalid credentials", async () => {
      service.validateUser.mockResolvedValue(null);

      await expect(
        controller.login({ email: "jander@example.com", password: "wrong-password" }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
