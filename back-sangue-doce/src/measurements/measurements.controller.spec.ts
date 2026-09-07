import { describe, expect, it, vi } from "vitest";
import { SensorManufacturer } from "./enums/sensor-manufacturer.enum";
import { MeasurementsController } from "./measurements.controller";

describe("MeasurementsController", () => {
  it("passes undefined file to service when upload payload is missing", async () => {
    const measurementsService = {
      createFromSmartImage: vi.fn().mockResolvedValue({ id: "measurement-id" }),
      enqueueSmartReportImport: vi.fn(),
      getReportImportStatus: vi.fn(),
      readSmartReport: vi.fn(),
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

  it("passes report file to service when report upload is received", async () => {
    const measurementsService = {
      createFromSmartImage: vi.fn(),
      enqueueSmartReportImport: vi.fn().mockResolvedValue({ jobId: "job-id", status: "queued" }),
      getReportImportStatus: vi.fn(),
      readSmartReport: vi.fn().mockResolvedValue({ ok: true, count: 0, measurements: [] }),
    };
    const controller = new MeasurementsController(measurementsService as never, {} as never);
    const request = { user: { sub: "4f3069fb-7d80-45b1-a2b4-dc2d3dbec84d" } };
    const file = {
      buffer: Buffer.from("fake-report"),
      mimetype: "application/vnd.ms-excel",
      originalname: "relatorio.xls",
      size: 20,
    };

    await expect(
      controller.uploadReportMeasurementToSmart(
        { report: [file] },
        SensorManufacturer.Sibionics,
        request as never,
      ),
    ).resolves.toEqual({ jobId: "job-id", status: "queued" });
    expect(measurementsService.enqueueSmartReportImport).toHaveBeenCalledWith(
      request,
      file,
      SensorManufacturer.Sibionics,
    );
  });

  it("passes report import status lookup to service", async () => {
    const measurementsService = {
      createFromSmartImage: vi.fn(),
      enqueueSmartReportImport: vi.fn(),
      getReportImportStatus: vi.fn().mockResolvedValue({
        jobId: "job-id",
        progress: 100,
        status: "completed",
      }),
      readSmartReport: vi.fn(),
    };
    const controller = new MeasurementsController(measurementsService as never, {} as never);
    const request = { user: { sub: "4f3069fb-7d80-45b1-a2b4-dc2d3dbec84d" } };

    await expect(controller.getReportImportStatus(request as never, "job-id")).resolves.toEqual({
      jobId: "job-id",
      progress: 100,
      status: "completed",
    });
    expect(measurementsService.getReportImportStatus).toHaveBeenCalledWith(request, "job-id");
  });
});
