import { type AuthenticatedRequest, AuthGuard } from "@app/@infra/guard/auth.guard";
import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CarbAnalysisService } from "./carb-analysis.service";
import type {
  CarbAnalysisJobStatus,
  PublicCarbAnalysis,
  QueuedCarbAnalysis,
  UploadedImageFile,
} from "./types";

type CarbAnalysisUploadedFiles = {
  file?: UploadedImageFile[];
  image?: UploadedImageFile[];
};

@Controller("carb-analysis")
export class CarbAnalysisController {
  constructor(private readonly carbAnalysisService: CarbAnalysisService) {}

  @Post("analyze")
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "image", maxCount: 1 },
        { name: "file", maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 8 * 1024 * 1024,
        },
      },
    ),
  )
  analyzeImage(
    @Request() req: AuthenticatedRequest,
    @UploadedFiles() files?: CarbAnalysisUploadedFiles,
  ): Promise<QueuedCarbAnalysis> {
    const file = files?.image?.[0] ?? files?.file?.[0];

    return this.carbAnalysisService.enqueueImageAnalysis(req, file);
  }

  @Get("status/:jobId")
  @UseGuards(AuthGuard)
  getAnalysisStatus(
    @Request() req: AuthenticatedRequest,
    @Param("jobId") jobId: string,
  ): Promise<CarbAnalysisJobStatus> {
    return this.carbAnalysisService.getAnalysisStatus(req, jobId);
  }

  @Get("result/:jobId")
  @UseGuards(AuthGuard)
  getAnalysisResult(
    @Request() req: AuthenticatedRequest,
    @Param("jobId") jobId: string,
  ): Promise<PublicCarbAnalysis> {
    return this.carbAnalysisService.getAnalysisResult(req, jobId);
  }
}
