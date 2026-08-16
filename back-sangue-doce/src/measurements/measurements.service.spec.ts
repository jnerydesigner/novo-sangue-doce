import type { UploadedImageFile } from "@app/uploads/types/uploaded-image-file.type";
import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Measurement } from "./dto/smart-measurement-response.dto";
import { MeasurementsService } from "./measurements.service";

describe("MeasurementsService smart image ingestion", () => {
  let service: MeasurementsService;
  const measurementSmartService = {
    sendImageToDecodedSmart: vi.fn(),
  };

  beforeEach(() => {
    service = new MeasurementsService(
      {} as never,
      {} as never,
      {} as never,
      measurementSmartService as never,
    );
  });

  it("decodes the image through smart service without persisting in diagnostic mode", async () => {
    const file: UploadedImageFile = {
      buffer: Buffer.from("fake-image"),
      mimetype: "image/png",
      size: 10,
    };
    const request = { user: { sub: "4f3069fb-7d80-45b1-a2b4-dc2d3dbec84d" } };
    const decodedMeasurement: Measurement = {
      measuredAt: "2026-08-16T13:50:00-04:00",
      glucoseValueMgDl: 121,
      readingContext: "AFTER_MEAL",
      source: "SENSOR",
      noteType: "AFTER_LUNCH",
      timeZone: "America/Manaus",
    };
    measurementSmartService.sendImageToDecodedSmart.mockResolvedValue(decodedMeasurement);
    const createSpy = vi.spyOn(service, "create");

    await expect(service.createFromSmartImage(request as never, file)).resolves.toBe(
      decodedMeasurement,
    );
    expect(measurementSmartService.sendImageToDecodedSmart).toHaveBeenCalledWith(file);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("rejects requests without image file", async () => {
    await expect(
      service.createFromSmartImage({} as never, undefined, {
        contentType: "application/json",
        fileFields: [],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(measurementSmartService.sendImageToDecodedSmart).not.toHaveBeenCalled();
  });
});
