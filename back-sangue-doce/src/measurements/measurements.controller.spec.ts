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
      controller.uploadImageMeasurementToSmart(undefined, "application/json", request as never),
    ).resolves.toEqual({ id: "measurement-id" });
    expect(measurementsService.createFromSmartImage).toHaveBeenCalledWith(request, undefined, {
      contentType: "application/json",
      fileFields: [],
    });
  });
});
