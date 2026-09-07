import type { UploadedImageFile } from "@app/uploads/types/uploaded-image-file.type";
import { HttpService } from "@nestjs/axios";
import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { AxiosError } from "axios";
import { firstValueFrom } from "rxjs";
import {
  type Measurement,
  type SmartMeasurementReportResponseDto,
  SmartMeasurementResponseDto,
} from "./dto/smart-measurement-response.dto";
import type { CreateMeasurementDto } from "./dto/create-measurement.dto";
import type { SensorManufacturer } from "./enums/sensor-manufacturer.enum";
import { ReportSmartMapper } from "./mappers/report-smart.mapper";

@Injectable()
export class MeasurementSmartService {
  private readonly logger = new Logger(MeasurementSmartService.name);

  constructor(private readonly httpService: HttpService) {}

  async sendImageToDecodedSmart(file: UploadedImageFile): Promise<Measurement> {
    const form = new FormData();
    const imageBytes = new Uint8Array(file.buffer);
    const blob = new Blob([imageBytes], { type: file.mimetype });
    form.append("file", blob, file.originalname || this.getFallbackFilename(file.mimetype));
    form.append("time_zone", "America/Manaus");
    form.append("sent_at", new Date().toISOString());
    const smartUrl = process.env.SMART_URL ?? "http://localhost:8040";
    this.logger.log(
      `Enviando imagem para Smart. url=${smartUrl}/v1/measurements/read-image mimetype=${file.mimetype} size=${file.size}`,
    );
    let data: SmartMeasurementResponseDto;

    try {
      const response = await firstValueFrom(
        this.httpService.post<SmartMeasurementResponseDto>(
          `${smartUrl}/v1/measurements/read-image`,
          form,
        ),
      );
      data = response.data;
    } catch (error) {
      const errorDetails = this.describeSmartError(error);
      this.logger.error(`Erro ao chamar Smart. ${errorDetails}`);
      throw new ServiceUnavailableException({
        message: "Smart nao conseguiu processar a imagem.",
        details: errorDetails,
      });
    }

    if (!data.ok || !data.measurement) {
      this.logger.warn(
        `Smart nao decodificou medicao. warnings=${JSON.stringify(data.warnings)} evidence=${JSON.stringify(data.evidence)}`,
      );
      throw new ServiceUnavailableException({
        message: "Smart nao conseguiu decodificar a imagem.",
        warnings: data.warnings,
        evidence: data.evidence,
      });
    }

    this.logger.log(`Smart decodificou medicao: ${JSON.stringify(data.measurement)}`);

    return data.measurement;
  }

  async sendReportToDecodedSmart(
    file: UploadedImageFile,
    userId: string,
    sensorManufacturer: SensorManufacturer,
  ): Promise<CreateMeasurementDto[]> {
    const form = new FormData();
    const reportBytes = new Uint8Array(file.buffer);
    const blob = new Blob([reportBytes], { type: file.mimetype });
    form.append("file", blob, file.originalname || this.getFallbackReportFilename(file.mimetype));
    form.append("user_id", userId);
    form.append("sensor_manufacturer", sensorManufacturer);

    const smartUrl = process.env.SMART_URL ?? "http://localhost:8040";
    this.logger.log(
      `Enviando relatorio para Smart. url=${smartUrl}/v1/measurements/import-xls mimetype=${file.mimetype} size=${file.size} userId=${userId} sensorManufacturer=${sensorManufacturer}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<SmartMeasurementReportResponseDto>(
          `${smartUrl}/v1/measurements/import-xls`,
          form,
        ),
      );
      this.logger.log(
        `Smart decodificou relatorio. count=${response.data.count} user_id=${response.data.user_id} warnings=${JSON.stringify(response.data.warnings)}`,
      );

      return ReportSmartMapper.mapSmartReportToMeasurements(response.data);
    } catch (error) {
      const errorDetails = this.describeSmartError(error);
      this.logger.error(`Erro ao chamar Smart para relatorio. ${errorDetails}`);
      throw new ServiceUnavailableException({
        message: "Smart nao conseguiu processar o relatorio.",
        details: errorDetails,
      });
    }
  }

  private describeSmartError(error: unknown): string {
    if (error instanceof AxiosError) {
      return `status=${error.response?.status ?? "sem-status"} code=${error.code ?? "sem-code"} message=${error.message} data=${JSON.stringify(error.response?.data)}`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return JSON.stringify(error);
  }

  private getFallbackFilename(mimetype: string): string {
    if (mimetype === "image/png") return "measurement.png";
    if (mimetype === "image/webp") return "measurement.webp";
    return "measurement.jpg";
  }

  private getFallbackReportFilename(mimetype: string): string {
    if (mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      return "measurement-report.xlsx";
    }
    return "measurement-report.xls";
  }
}
