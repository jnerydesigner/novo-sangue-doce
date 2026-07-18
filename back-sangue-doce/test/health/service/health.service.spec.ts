import { HealthService } from "@app/health/health.service";

describe("HealthService", () => {
  let service: HealthService;

  beforeEach(() => {
    service = new HealthService();
  });

  it("returns the health check payload", () => {
    expect(service.check()).toEqual({ ping: "pong" });
  });
});
