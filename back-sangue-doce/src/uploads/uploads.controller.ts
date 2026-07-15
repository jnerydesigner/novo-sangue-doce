import { type AuthenticatedRequest, AuthGuard } from "@app/@infra/guard/auth.guard";
import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { Role } from "@app/auth/enums/role.enum";
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { UploadedImageFile } from "./types/uploaded-image-file.type";
import { UploadsService } from "./uploads.service";

@Controller("uploads")
@UseGuards(AuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("users/avatar")
  @UseInterceptors(
    FileInterceptor("image", {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadUserAvatar(@Request() req: AuthenticatedRequest, @UploadedFile() file?: UploadedImageFile) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.uploadsService.uploadUserAvatar(req.user, file);
  }

  @Post("post/cover")
  @UseInterceptors(
    FileInterceptor("image", {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  uploadPostImageCover(
    @Request() req: AuthenticatedRequest,
    @Body("postId") postId: string,
    @UploadedFile() file?: UploadedImageFile,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    if (!postId) {
      throw new BadRequestException("Envie o postId no body usando multipart/form-data.");
    }

    return this.uploadsService.uploadPostImageCover(postId, file);
  }

  @Post("post/images")
  @UseInterceptors(
    FileInterceptor("image", {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  uploadPostImages(
    @Request() req: AuthenticatedRequest,
    @Body("postId") postId: string,
    @UploadedFile() file?: UploadedImageFile,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    if (!postId) {
      throw new BadRequestException("Envie o postId no body usando multipart/form-data.");
    }

    return this.uploadsService.uploadPostImages(postId, file);
  }

  @Post("recipe/cover")
  @UseInterceptors(FileInterceptor("image", { limits: { fileSize: 5 * 1024 * 1024 } }))
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  uploadRecipeCover(
    @Request() req: AuthenticatedRequest,
    @Body("recipeId") recipeId: string,
    @UploadedFile() file?: UploadedImageFile,
  ) {
    if (!req.user) throw new UnauthorizedException();
    if (!recipeId) throw new BadRequestException("Envie o recipeId no body usando multipart/form-data.");
    return this.uploadsService.uploadRecipeCover(recipeId, file);
  }

  @Post("recipe/images")
  @UseInterceptors(FileInterceptor("image", { limits: { fileSize: 5 * 1024 * 1024 } }))
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  uploadRecipeImage(
    @Request() req: AuthenticatedRequest,
    @Body("recipeId") recipeId: string,
    @UploadedFile() file?: UploadedImageFile,
  ) {
    if (!req.user) throw new UnauthorizedException();
    if (!recipeId) throw new BadRequestException("Envie o recipeId no body usando multipart/form-data.");
    return this.uploadsService.uploadRecipeImage(recipeId, file);
  }

  @Post("institutional-publications/image")
  @UseInterceptors(FileInterceptor("image", { limits: { fileSize: 5 * 1024 * 1024 } }))
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  uploadInstitutionalPublicationImage(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file?: UploadedImageFile,
  ) {
    if (!req.user) throw new UnauthorizedException();
    return this.uploadsService.uploadInstitutionalPublicationImage(file);
  }
}
