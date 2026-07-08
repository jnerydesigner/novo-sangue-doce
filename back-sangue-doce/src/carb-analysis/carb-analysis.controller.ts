import { type AuthenticatedRequest } from "@app/@infra/guard/auth.guard";
import { Controller, Post, Request, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CarbAnalysisService } from "./carb-analysis.service";
import type { QueuedCarbAnalysis, UploadedImageFile } from "./types";

type CarbAnalysisUploadedFiles = {
  file?: UploadedImageFile[];
  image?: UploadedImageFile[];
};

@Controller("carb-analysis")
export class CarbAnalysisController {
  constructor(private readonly carbAnalysisService: CarbAnalysisService) {}

  @Post("analyze")
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
}
