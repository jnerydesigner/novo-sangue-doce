import { ImageService } from "@app/image/image.service";
import {
  type SocialPublicationRecord,
  SocialPublicationRepository,
} from "@app/social-publications/domain/social-publication.repository";
import { AwsS3Service } from "@infra/storage/aws-s3.service";
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SocialPublicationStatus } from "@app/social-publications/domain/social-publication-status.enum";

export type LinkedinPublicationResponse = {
  postId: string;
  socialPublicationId: string;
  linkedinPostId: string | null;
  linkedinImageUrn: string;
  status: "PUBLISHED";
};

@Injectable()
export class LinkedinService {
  constructor(
    private readonly configService: ConfigService,
    private readonly socialPublicationRepository: SocialPublicationRepository,
    private readonly awsS3Service: AwsS3Service,
    private readonly imageService: ImageService,
  ) {}

  async publishLatestCompleted(postId: string): Promise<LinkedinPublicationResponse> {
    const publication = await this.socialPublicationRepository.findLatestCompletedByPostId(postId);

    if (!publication) {
      throw new NotFoundException(
        `Nao existe publicacao social concluida para a materia ${postId}.`,
      );
    }

    return this.publishPublication(publication);
  }

  async publishCompleted(socialPublicationId: string): Promise<LinkedinPublicationResponse> {
    const publication = await this.socialPublicationRepository.findById(socialPublicationId);

    if (!publication) {
      throw new NotFoundException("Publicacao social nao encontrada.");
    }

    return this.publishPublication(publication);
  }

  private async publishPublication(
    publication: SocialPublicationRecord,
  ): Promise<LinkedinPublicationResponse> {
    if (publication.status !== SocialPublicationStatus.COMPLETED) {
      throw new BadRequestException("Apenas publicacoes concluidas podem ser publicadas.");
    }

    if (!publication.generatedContent) {
      throw new NotFoundException("A publicacao social concluida nao possui texto.");
    }
    if (!publication.generatedImageKey) {
      throw new NotFoundException("A publicacao social concluida nao possui imagem.");
    }

    const text = this.formatCommentary(
      publication.generatedContent,
      publication.generatedHashtags ?? [],
    );
    const sourceImage = await this.awsS3Service.downloadObject(publication.generatedImageKey);
    const pngImage = await this.imageService.png(sourceImage);
    const linkedinImageUrn = await this.uploadImage(pngImage);
    const linkedinPostId = await this.publishPost(
      text,
      linkedinImageUrn,
      publication.generatedShortTitle ?? "Imagem da publicacao",
    );
    await this.socialPublicationRepository.markAsPublished(publication.id, "LINKEDIN", {
      status: "PUBLISHED",
      externalPostId: linkedinPostId,
      mediaUrn: linkedinImageUrn,
      publishedAt: new Date().toISOString(),
    });

    return {
      postId: publication.postId,
      socialPublicationId: publication.id,
      linkedinPostId,
      linkedinImageUrn,
      status: "PUBLISHED",
    };
  }

  private getLinkedinConfig() {
    const accessToken = this.configService.getOrThrow<string>("LINKEDIN_ACCESS_TOKEN");
    const authorUrn = this.configService.getOrThrow<string>("LINKEDIN_AUTHOR_URN");
    const apiVersion = this.configService.get<string>("LINKEDIN_API_VERSION") ?? "202606";

    return { accessToken, authorUrn, apiVersion };
  }

  private formatCommentary(content: string, hashtags: string[]): string {
    const normalizedContent = content.trim();
    const hashtagsToAppend = hashtags
      .map((hashtag) => hashtag.trim())
      .filter((hashtag) => hashtag.length > 0)
      .filter((hashtag) => !normalizedContent.includes(hashtag));

    return [normalizedContent, hashtagsToAppend.join(" ")].filter(Boolean).join("\n\n");
  }

  private async uploadImage(image: Buffer): Promise<string> {
    const { accessToken, authorUrn, apiVersion } = this.getLinkedinConfig();
    const initializeResponse = await fetch(
      "https://api.linkedin.com/rest/images?action=initializeUpload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "LinkedIn-Version": apiVersion,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({ initializeUploadRequest: { owner: authorUrn } }),
      },
    );

    if (!initializeResponse.ok) {
      const error = await initializeResponse.text();
      throw new BadGatewayException(
        `Erro ao iniciar upload no LinkedIn (HTTP ${initializeResponse.status}): ${error}`,
      );
    }

    const initialization = (await initializeResponse.json()) as {
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
      const error = await uploadResponse.text();
      throw new BadGatewayException(
        `Erro ao enviar imagem ao LinkedIn (HTTP ${uploadResponse.status}): ${error}`,
      );
    }

    return imageUrn;
  }

  private async publishPost(
    text: string,
    imageUrn: string,
    altText: string,
  ): Promise<string | null> {
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
        content: {
          media: {
            id: imageUrn,
            altText: altText.slice(0, 120),
          },
        },
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
      const error = await response.text();
      throw new BadGatewayException(
        `Erro ao publicar no LinkedIn (HTTP ${response.status}): ${error}`,
      );
    }

    return response.headers.get("x-restli-id");
  }
}
