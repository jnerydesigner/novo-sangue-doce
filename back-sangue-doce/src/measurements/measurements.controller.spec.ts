import { describe, expect, it, vi } from "vitest";
import { MeasurementsController } from "./measurements.controller";

describe("MeasurementsController", () => {
  it("passes undefined file to service when upload payload is missing", async () => {
    const measurementsService = {
      createFromSmartImage: vi.fn().mockResolvedValue({ id: "measurement-id" }),
    };
    const controller = new MeasurementsController(measurementsService as never, {} as never);
    const request = { user: { sub: "4f3069fb-7d80-45b1-a2b4-dc2d3dbec84d" } };

    await expect(
      controller.uploadImageMeasurementToSmart(
        undefined,
        {
          "content-length": "42",
          "content-type": "application/json",
          authorization: "Bearer secret",
          host: "api.sanguedoce.com.br",
        },
        request as never,
      ),
    ).resolves.toEqual({ id: "measurement-id" });
    expect(measurementsService.createFromSmartImage).toHaveBeenCalledWith(request, undefined, {
      contentLength: "42",
      contentType: "application/json",
      fileFields: [],
      headerKeys: ["content-length", "content-type", "host"],
      host: "api.sanguedoce.com.br",
      transferEncoding: undefined,
      userAgent: undefined,
      xForwardedFor: undefined,
      xForwardedProto: undefined,
    });
  });
});
