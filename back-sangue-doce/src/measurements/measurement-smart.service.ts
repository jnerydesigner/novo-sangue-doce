import { UploadedImageFile } from "@app/uploads/types/uploaded-image-file.type";
import { HttpService } from "@nestjs/axios";
import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { type Measurement, SmartMeasurementResponseDto } from "./dto/smart-measurement-response.dto";

@Injectable()
export class MeasurementSmartService {
  constructor(private readonly httpService: HttpService) {}

  async sendImageToDecodedSmart(file: UploadedImageFile): Promise<Measurement> {
    const form = new FormData();
    const imageBytes = new Uint8Array(file.buffer);
    const blob = new Blob([imageBytes], { type: file.mimetype });
    form.append("file", blob, "measurement.png");
    form.append("time_zone", "America/Manaus");
    form.append("sent_at", new Date().toISOString());
    const smartUrl = process.env.SMART_URL ?? "http://localhost:8040";
    const { data } = await firstValueFrom(
      this.httpService.post<SmartMeasurementResponseDto>(
        `${smartUrl}/v1/measurements/read-image`,
        form,
      ),
    );

    if (!data.ok || !data.measurement) {
      throw new ServiceUnavailableException({
        message: "Smart nao conseguiu decodificar a imagem.",
        warnings: data.warnings,
        evidence: data.evidence,
      });
    }

    return data.measurement;
  }
}
