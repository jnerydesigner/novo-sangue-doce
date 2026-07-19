import { ImageService } from "@app/image/image.service";
import { AwsS3Service } from "@infra/storage/aws-s3.service";
import { BadGatewayException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../@infra/database/prisma.service";
import type { InstitutionalPublicationDto } from "./dto";

type PublicationResult = {
  status: "PUBLISHED";
  externalPostId: string | null;
  mediaUrn: string | null;
  publishedAt: string;
};

@Injectable()
export class InstitutionalPublicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsS3Service: AwsS3Service,
    private readonly imageService: ImageService,
    private readonly configService: ConfigService,
  ) {}

  async list(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [records, total] = await this.prisma.$transaction([
      this.prisma.institutionalPublication.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.institutionalPublication.count(),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data: records,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  create(dto: InstitutionalPublicationDto, requestedBy?: string) {
    return this.prisma.institutionalPublication.create({
      data: {
        title: dto.title,
        content: dto.content,
        hashtags: dto.hashtags,
        imageKey: dto.imageKey,
        imageUrl: dto.imageUrl,
        requestedBy,
      },
    });
  }

  update(id: string, dto: InstitutionalPublicationDto) {
    return this.prisma.institutionalPublication.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        hashtags: dto.hashtags,
        imageKey: dto.imageKey,
        imageUrl: dto.imageUrl,
      },
    });
  }

  async publishLinkedin(id: string) {
    const publication = await this.prisma.institutionalPublication.findUnique({ where: { id } });

    if (!publication) {
      throw new NotFoundException("Publicacao institucional nao encontrada.");
    }

    const hashtags = Array.isArray(publication.hashtags)
      ? publication.hashtags.map(String).join(" ")
      : "";
    const text = [publication.content, hashtags].filter(Boolean).join("\n\n");
    const sourceImage = await this.awsS3Service.downloadObject(publication.imageKey);
    const pngImage = await this.imageService.png(sourceImage);
    const mediaUrn = await this.uploadImage(pngImage);
    const externalPostId = await this.publishPost(text, mediaUrn, publication.title);
    const result: PublicationResult = {
      status: "PUBLISHED",
      externalPostId,
      mediaUrn,
      publishedAt: new Date().toISOString(),
    };

    return this.prisma.institutionalPublication.update({
      where: { id },
      data: {
        publicationResults: {
          ...((publication.publicationResults as Record<string, unknown>) ?? {}),
          LINKEDIN: result,
        },
        publishedAt: new Date(),
      },
    });
  }

  private getLinkedinConfig() {
    const accessToken = this.configService.getOrThrow<string>("LINKEDIN_ACCESS_TOKEN");
    const authorUrn = this.configService.getOrThrow<string>("LINKEDIN_AUTHOR_URN");
    const apiVersion = this.configService.get<string>("LINKEDIN_API_VERSION") ?? "202606";

    return { accessToken, authorUrn, apiVersion };
  }

  private async uploadImage(image: Buffer): Promise<string> {
    const { accessToken, authorUrn, apiVersion } = this.getLinkedinConfig();
    const response = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": apiVersion,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({ initializeUploadRequest: { owner: authorUrn } }),
    });

    if (!response.ok) {
      throw new BadGatewayException(`Erro ao iniciar upload no LinkedIn: ${await response.text()}`);
    }

    const initialization = (await response.json()) as {
      value?: { uploadUrl?: string; image?: string };
    };
    const uploadUrl = initialization.value?.uploadUrl;
    const imageUrn = initialization.value?.image;

    if (!uploadUrl || !imageUrn) {
      throw new BadGatewayException("LinkedIn nao retornou URL de upload e URN da imagem.");
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "image/png" },
      body: new Uint8Array(image),
    });

    if (!uploadResponse.ok) {
      throw new BadGatewayException(
        `Erro ao enviar imagem ao LinkedIn: ${await uploadResponse.text()}`,
      );
    }

    return imageUrn;
  }

  private async publishPost(text: string, imageUrn: string, altText: string) {
    const { accessToken, authorUrn, apiVersion } = this.getLinkedinConfig();
    const response = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": apiVersion,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: authorUrn,
        commentary: text,
        content: { media: { id: imageUrn, altText: altText.slice(0, 120) } },
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      }),
    });

    if (!response.ok) {
      throw new BadGatewayException(`Erro ao publicar no LinkedIn: ${await response.text()}`);
    }

    return response.headers.get("x-restli-id");
  }
}
