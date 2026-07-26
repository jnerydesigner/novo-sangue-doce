import { HealthService } from "@app/health/health.service";
import type { HealthCheckService, HealthIndicatorResult, MemoryHealthIndicator } from "@nestjs/terminus";
import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

type MockHealthCheckService = Mocked<Pick<HealthCheckService, "check">>;
type MockMemoryHealthIndicator = Mocked<Pick<MemoryHealthIndicator, "checkHeap">>;

const healthResult = {
  status: "ok",
  info: {
    memory_heap: {
      status: "up",
    },
  },
  error: {},
  details: {
    memory_heap: {
      status: "up",
    },
  },
} as const;

describe("HealthService", () => {
  let health: MockHealthCheckService;
  let memory: MockMemoryHealthIndicator;
  let service: HealthService;

  beforeEach(() => {
    health = {
      check: vi.fn().mockResolvedValue(healthResult),
    };
    memory = {
      checkHeap: vi.fn().mockResolvedValue({
        memory_heap: {
          status: "up",
        },
      } satisfies HealthIndicatorResult),
    };

    service = new HealthService(health as unknown as HealthCheckService, memory as unknown as MemoryHealthIndicator);
  });

  it("returns the health check payload", () => {
    expect(service.check()).toEqual({ ping: "pong" });
  });

  it("checks heap memory for liveness", async () => {
    await expect(service.live()).resolves.toEqual(healthResult);

    expect(health.check).toHaveBeenCalledTimes(1);
    const [indicators] = health.check.mock.calls[0];

    await expect(indicators[0]()).resolves.toEqual({
      memory_heap: {
        status: "up",
      },
    });
    expect(memory.checkHeap).toHaveBeenCalledWith("memory_heap", 300 * 1024 * 1024);
  });

  it("checks heap memory for readiness", async () => {
    await expect(service.ready()).resolves.toEqual(healthResult);

    expect(health.check).toHaveBeenCalledTimes(1);
    const [indicators] = health.check.mock.calls[0];

    await expect(indicators[0]()).resolves.toEqual({
      memory_heap: {
        status: "up",
      },
    });
    expect(memory.checkHeap).toHaveBeenCalledWith("memory_heap", 300 * 1024 * 1024);
  });
});
