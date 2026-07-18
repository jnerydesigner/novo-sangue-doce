import {
  type SocialPublicationRecord,
  SocialPublicationRepository,
} from "@app/social-publications/domain/social-publication.repository";
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export type InstagramPublicationResponse = {
  postId: string;
  socialPublicationId: string;
  instagramMediaId: string | null;
  instagramContainerId: string;
  status: "PUBLISHED";
};

type InstagramMediaContainerResponse = {
  id?: string;
};

type InstagramMediaPublishResponse = {
  id?: string;
};

type InstagramContainerStatusResponse = {
  id?: string;
  status_code?: "EXPIRED" | "ERROR" | "FINISHED" | "IN_PROGRESS" | "PUBLISHED";
  status?: string;
};

@Injectable()
export class InstagramService {
  constructor(
    private readonly configService: ConfigService,
    private readonly socialPublicationRepository: SocialPublicationRepository,
  ) {}

  async publishLatestCompleted(postId: string): Promise<InstagramPublicationResponse> {
    const publication = await this.socialPublicationRepository.findLatestCompletedByPostId(postId);

    if (!publication) {
      throw new NotFoundException(
        `Nao existe publicacao social concluida para a materia ${postId}.`,
      );
    }

    return this.publishPublication(publication);
  }

  async publishCompleted(socialPublicationId: string): Promise<InstagramPublicationResponse> {
    const publication = await this.socialPublicationRepository.findById(socialPublicationId);

    if (!publication) {
      throw new NotFoundException("Publicacao social nao encontrada.");
    }

    return this.publishPublication(publication);
  }

  private async publishPublication(
    publication: SocialPublicationRecord,
  ): Promise<InstagramPublicationResponse> {
    if (publication.status !== "COMPLETED") {
      throw new BadRequestException("Apenas publicacoes concluidas podem ser publicadas.");
    }

    if (!publication.generatedContent) {
      throw new NotFoundException("A publicacao social concluida nao possui texto.");
    }

    if (!publication.generatedImageUrl) {
      throw new NotFoundException(
        "A publicacao social concluida nao possui URL publica da imagem.",
      );
    }

    const caption = this.formatCaption(
      publication.generatedContent,
      publication.generatedHashtags ?? [],
    );
    const instagramContainerId = await this.createImageContainer(
      publication.generatedImageUrl,
      caption,
    );
    await this.waitForContainerReady(instagramContainerId);
    const instagramMediaId = await this.publishMediaContainer(instagramContainerId);

    await this.socialPublicationRepository.markAsPublished(publication.id, "INSTAGRAM", {
      status: "PUBLISHED",
      externalPostId: instagramMediaId,
      mediaUrn: instagramContainerId,
      publishedAt: new Date().toISOString(),
    });

    return {
      postId: publication.postId,
      socialPublicationId: publication.id,
      instagramMediaId,
      instagramContainerId,
      status: "PUBLISHED",
    };
  }

  private getInstagramConfig() {
    const accessToken = this.configService.getOrThrow<string>("INSTAGRAM_ACCESS_TOKEN");
    const userId = this.configService.getOrThrow<string>("INSTAGRAM_USER_ID");
    const apiVersion = this.configService.get<string>("INSTAGRAM_GRAPH_API_VERSION") ?? "v23.0";

    return { accessToken, userId, apiVersion };
  }

  private formatCaption(content: string, hashtags: string[]): string {
    const normalizedContent = content.trim();
    const hashtagsToAppend = hashtags
      .map((hashtag) => hashtag.trim())
      .filter((hashtag) => hashtag.length > 0)
      .filter((hashtag) => !normalizedContent.includes(hashtag));

    return [normalizedContent, hashtagsToAppend.join(" ")].filter(Boolean).join("\n\n");
  }

  private async createImageContainer(imageUrl: string, caption: string): Promise<string> {
    const { accessToken, userId, apiVersion } = this.getInstagramConfig();
    const params = new URLSearchParams({
      image_url: imageUrl,
      caption,
      access_token: accessToken,
    });

    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${userId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new BadGatewayException(
        `Erro ao criar container no Instagram (HTTP ${response.status}): ${error}`,
      );
    }

    const body = (await response.json()) as InstagramMediaContainerResponse;

    if (!body.id) {
      throw new BadGatewayException("Instagram nao retornou o ID do container de midia.");
    }

    return body.id;
  }

  private async waitForContainerReady(containerId: string): Promise<void> {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const status = await this.getContainerStatus(containerId);

      if (!status.status_code || status.status_code === "FINISHED") {
        return;
      }

      if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
        throw new BadGatewayException(
          `Container do Instagram nao pode ser publicado: ${status.status ?? status.status_code}`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }

    throw new BadGatewayException("Tempo limite aguardando o container do Instagram ficar pronto.");
  }

  private async getContainerStatus(containerId: string): Promise<InstagramContainerStatusResponse> {
    const { accessToken, apiVersion } = this.getInstagramConfig();
    const params = new URLSearchParams({
      fields: "status_code,status",
      access_token: accessToken,
    });

    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${containerId}?${params.toString()}`,
    );

    if (!response.ok) {
      const error = await response.text();
      throw new BadGatewayException(
        `Erro ao consultar container no Instagram (HTTP ${response.status}): ${error}`,
      );
    }

    return (await response.json()) as InstagramContainerStatusResponse;
  }

  private async publishMediaContainer(containerId: string): Promise<string | null> {
    const { accessToken, userId, apiVersion } = this.getInstagramConfig();
    const params = new URLSearchParams({
      creation_id: containerId,
      access_token: accessToken,
    });

    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${userId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new BadGatewayException(
        `Erro ao publicar no Instagram (HTTP ${response.status}): ${error}`,
      );
    }

    const body = (await response.json()) as InstagramMediaPublishResponse;

    return body.id ?? null;
  }
}
