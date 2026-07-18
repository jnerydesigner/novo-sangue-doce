import { HealthController } from "@app/health/health.controller";
import { HealthService } from "@app/health/health.service";
import { Test, type TestingModule } from "@nestjs/testing";

describe("HealthController", () => {
  let controller: HealthController;
  let service: jest.Mocked<Pick<HealthService, "check">>;

  beforeEach(async () => {
    service = {
      check: jest.fn().mockReturnValue({ ping: "pong" }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: service }],
    }).compile();

    controller = module.get(HealthController);
  });

  it("returns the service health check payload", () => {
    expect(controller.check()).toEqual({ ping: "pong" });
    expect(service.check).toHaveBeenCalledTimes(1);
  });
});
