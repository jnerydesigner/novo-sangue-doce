import type { UploadedImageFile } from "@app/uploads/types/uploaded-image-file.type";
import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Measurement } from "./dto/smart-measurement-response.dto";
import type { PublicMeasurement } from "./measurements.service";
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

  it("decodes the image through smart service and persists through create", async () => {
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
    const publicMeasurement: PublicMeasurement = {
      id: "992d35f0-02c6-44ec-aa72-0d26c3148bd4",
      userId: "4f3069fb-7d80-45b1-a2b4-dc2d3dbec84d",
      measuredAt: new Date("2026-08-16T13:50:00.000Z"),
      glucoseValueMgDl: 121,
      readingContext: "AFTER_MEAL",
      source: "SENSOR",
      noteType: "AFTER_LUNCH",
      noteLabel: "Depois do almoco",
      createdAt: new Date("2026-08-16T14:00:00.000Z"),
      updatedAt: new Date("2026-08-16T14:00:00.000Z"),
    };

    measurementSmartService.sendImageToDecodedSmart.mockResolvedValue(decodedMeasurement);
    const createSpy = vi.spyOn(service, "create").mockResolvedValue(publicMeasurement);

    await expect(service.createFromSmartImage(request as never, file)).resolves.toBe(
      publicMeasurement,
    );
    expect(measurementSmartService.sendImageToDecodedSmart).toHaveBeenCalledWith(file);
    expect(createSpy).toHaveBeenCalledWith(request, {
      measuredAt: "2026-08-16T13:50:00-04:00",
      glucoseValueMgDl: 121,
      source: "SENSOR",
      timeZone: "America/Manaus",
    });
  });

  it("rejects requests without image file", async () => {
    await expect(service.createFromSmartImage({} as never, undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(measurementSmartService.sendImageToDecodedSmart).not.toHaveBeenCalled();
  });
});
