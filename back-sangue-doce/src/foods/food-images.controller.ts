import { AuthGuard } from "@app/@infra/guard/auth.guard";
import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { Role } from "@app/auth/enums/role.enum";
import { Body, Controller, Param, ParseIntPipe, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { z } from "zod";
import { FoodImagesService } from "./food-images.service";
import type { UploadedImageFile } from "@app/uploads/types/uploaded-image-file.type";

@Controller("foods-images")
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class FoodImagesController {
  constructor(private readonly foodImagesService: FoodImagesService) { }

  @Post(":id/image")
  findAndAttach(@Param("id", ParseIntPipe) foodId: number) {
    return this.foodImagesService.findAndAttach(foodId);
  }

  @Post(":id/image/manual")
  @UseInterceptors(FileInterceptor("image", { limits: { fileSize: 5 * 1024 * 1024 } }))
  addManual(
    @Param("id", ParseIntPipe) foodId: number,
    @Body() body: unknown,
    @UploadedFile() file?: UploadedImageFile,
  ) {
    const input = z.object({
      sourceUrl: z.url().optional(),
      sourceName: z.string().trim().min(1).optional(),
      license: z.string().trim().min(1).optional(),
    }).parse(body);

    return this.foodImagesService.attachManualUpload(foodId, file, input);
  }

  @Put(":id/image/manual")
  @UseInterceptors(FileInterceptor("image", { limits: { fileSize: 5 * 1024 * 1024 } }))
  updateManual(
    @Param("id", ParseIntPipe) foodId: number,
    @Body() body: unknown,
    @UploadedFile() file?: UploadedImageFile,
  ) {
    const input = z.object({
      sourceUrl: z.url().optional(), sourceName: z.string().trim().min(1).optional(), license: z.string().trim().min(1).optional(),
    }).parse(body);
    return this.foodImagesService.updateManualUpload(foodId, file, input);
  }
}
