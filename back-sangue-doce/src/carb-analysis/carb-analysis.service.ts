import type { AuthenticatedRequest } from "@app/@infra/guard/auth.guard";
import { PrismaService } from "@infra/database/prisma.service";
import { AwsS3Service } from "@infra/storage/aws-s3.service";
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import type { CarbAnalysis } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { MailService } from "src/mail/mail.service";
import { AnthropicCarbAnalysisService } from "./anthropic-carb-analysis.service";
import { CarbAnalysisReportPdfService } from "./carb-analysis-report-pdf.service";
import { CountCarbProducer } from "./count-carb.producer";
import type {
  CarbAnalysisJobStatus,
  CarbAnalysisResult,
  CountCarbJobData,
  PublicCarbAnalysis,
  QueuedCarbAnalysis,
  UploadedImageFile,
} from "./types";

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

@Injectable()
export class CarbAnalysisService {
  constructor(
    private readonly anthropicCarbAnalysisService: AnthropicCarbAnalysisService,
    private readonly prisma: PrismaService,
    private readonly awsS3Service: AwsS3Service,
    private readonly countCarbProducer: CountCarbProducer,
    private readonly carbAnalysisReportPdfService: CarbAnalysisReportPdfService,
    private readonly mailService: MailService,
  ) {}

  async enqueueImageAnalysis(
    req: AuthenticatedRequest,
    file?: UploadedImageFile,
  ): Promise<QueuedCarbAnalysis> {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    this.validateUploadedImage(file);

    const imageUrl = await this.uploadAnalysisImage(req.user.sub, file);
    const job = await this.countCarbProducer.enqueueAnalysis({
      imageUrl,
      mimetype: file.mimetype,
      originalName: file.originalname || "food-image.jpg",
      userId: req.user.sub,
    });

    return {
      jobId: String(job.id),
      status: "queued",
      imageUrl,
    };
  }

  async analyzeImage(
    req: AuthenticatedRequest,
    file?: UploadedImageFile,
  ): Promise<PublicCarbAnalysis> {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    this.validateUploadedImage(file);

    const result = await this.analyzeFoodImage(file);
    const imageUrl = await this.uploadAnalysisImage(req.user.sub, file);

    return this.saveAnalysis(req.user.sub, result, imageUrl);
  }

  async processQueuedAnalysis(
    data: CountCarbJobData,
    queueJobId: string,
  ): Promise<PublicCarbAnalysis> {
    const [user, file] = await Promise.all([
      this.prisma.user.findUnique({
        select: {
          email: true,
          name: true,
        },
        where: {
          id: data.userId,
        },
      }),
      this.downloadQueuedImage(data),
    ]);

    if (!user) {
      throw new BadRequestException("Usuario da analise de carboidratos nao encontrado.");
    }

    const result = await this.analyzeFoodImage(file);
    const analysis = await this.saveAnalysis(data.userId, result, data.imageUrl, queueJobId);

    // Envio do relatorio por e-mail desativado temporariamente a pedido do usuario.
    // await this.sendAnalysisReportEmail({
    //   analysis,
    //   userEmail: user.email,
    //   userName: user.name,
    // });

    return analysis;
  }

  async getAnalysisStatus(
    req: AuthenticatedRequest,
    jobId: string,
  ): Promise<CarbAnalysisJobStatus> {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const job = await this.countCarbProducer.getJob(jobId);

    if (!job || (job.data as CountCarbJobData).userId !== req.user.sub) {
      throw new NotFoundException("Job de analise de carboidratos nao encontrado.");
    }

    return {
      jobId,
      status: this.mapJobState(await job.getState()),
    };
  }

  async getAnalysisResult(req: AuthenticatedRequest, jobId: string): Promise<PublicCarbAnalysis> {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const analysis = await this.prisma.carbAnalysis.findFirst({
      where: {
        queueJobId: jobId,
        userId: req.user.sub,
      },
    });

    if (!analysis) {
      throw new NotFoundException("Resultado da analise de carboidratos ainda nao disponivel.");
    }

    return this.toPublicAnalysis(analysis);
  }

  private mapJobState(state: string): CarbAnalysisJobStatus["status"] {
    switch (state) {
      case "completed":
        return "completed";
      case "failed":
        return "failed";
      case "active":
        return "processing";
      case "waiting":
      case "waiting-children":
      case "delayed":
      case "prioritized":
        return "queued";
      default:
        return "unknown";
    }
  }

  private async analyzeFoodImage(file: UploadedImageFile): Promise<CarbAnalysisResult> {
    try {
      return await this.anthropicCarbAnalysisService.analyzeFoodImage(file);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadGatewayException({
        message: "Nao foi possivel concluir a analise de carboidratos.",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private validateUploadedImage(file?: UploadedImageFile): asserts file is UploadedImageFile {
    if (!file) {
      throw new BadRequestException(
        "Envie a imagem em multipart/form-data usando o campo image ou file.",
      );
    }

    if (!SUPPORTED_IMAGE_TYPES.has(file.mimetype)) {
      throw new BadRequestException("Tipo de imagem nao suportado.");
    }
  }

  private async downloadQueuedImage(data: CountCarbJobData): Promise<UploadedImageFile> {
    try {
      const response = await fetch(data.imageUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type") ?? data.mimetype;
      const buffer = Buffer.from(await response.arrayBuffer());

      return {
        buffer,
        mimetype: contentType.split(";")[0] || data.mimetype,
        originalname: data.originalName,
        size: buffer.length,
      };
    } catch (error) {
      throw new BadGatewayException({
        message: "Nao foi possivel baixar a imagem da analise para processamento.",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async sendAnalysisReportEmail(params: {
    analysis: PublicCarbAnalysis;
    userEmail: string;
    userName: string;
  }): Promise<void> {
    const pdf = await this.carbAnalysisReportPdfService.generateAnalysisPdf(params);

    await this.mailService.sendSystemEmail({
      attachments: [
        {
          content: pdf,
          contentType: "application/pdf",
          filename: `analise-carboidratos-${params.analysis.id}.pdf`,
        },
      ],
      body: "Sua analise de carboidratos foi concluida. O relatorio em PDF esta anexado a este email.",
      intro: "Resultado da analise de carboidratos",
      recipientName: params.userName,
      subject: "Sua analise de carboidratos esta pronta",
      title: "Analise de carboidratos concluida",
      to: params.userEmail,
    });
  }

  private async saveAnalysis(
    userId: string,
    result: CarbAnalysisResult,
    imageUrl: string,
    queueJobId?: string,
  ): Promise<PublicCarbAnalysis> {
    const existingAnalysis = await this.prisma.carbAnalysis.findFirst({
      where: {
        imageUrl,
        userId,
      },
    });

    if (existingAnalysis) {
      return this.toPublicAnalysis(existingAnalysis);
    }

    const analysis = await this.prisma.carbAnalysis.create({
      data: {
        confidence: result.confianca,
        estimatedGlucose: this.parseOptionalInteger(result.glicose_estimada),
        imageUrl,
        queueJobId,
        result: result as Prisma.InputJsonValue,
        totalCarbsGrams: this.parseGrams(result.carboidratos),
        userId,
      },
    });

    return this.toPublicAnalysis(analysis);
  }

  private toPublicAnalysis(analysis: CarbAnalysis): PublicCarbAnalysis {
    return {
      id: analysis.id,
      userId: analysis.userId,
      imageUrl: analysis.imageUrl,
      result: analysis.result as CarbAnalysisResult,
      estimatedGlucose: analysis.estimatedGlucose,
      totalCarbsGrams: analysis.totalCarbsGrams,
      confidence: analysis.confidence,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
    };
  }

  private async uploadAnalysisImage(userId: string, file: UploadedImageFile): Promise<string> {
    const uploadedObject = await this.awsS3Service.uploadObject({
      buffer: file.buffer,
      contentType: file.mimetype,
      fileName: file.originalname,
      keyPrefix: `public/carb-analyses/${userId}`,
    });

    return uploadedObject.url;
  }

  private parseGrams(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.round(value);
    }

    if (typeof value !== "string") {
      return null;
    }

    const match = value.match(/\d+(?:[,.]\d+)?/);

    if (!match) {
      return null;
    }

    return Math.round(Number(match[0].replace(",", ".")));
  }

  private parseOptionalInteger(value: unknown): number | null {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return null;
    }

    return Math.round(value);
  }
}
