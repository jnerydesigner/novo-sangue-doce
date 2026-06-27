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
  uploadPostImages(@Request() req: AuthenticatedRequest, @UploadedFile() file?: UploadedImageFile) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.uploadsService.uploadUserAvatar(req.user, file);
  }
}
