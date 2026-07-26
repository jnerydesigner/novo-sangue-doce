import { randomUUID } from "node:crypto";
import type { AuthenticatedRequest } from "@app/@infra/guard/auth.guard";
import { ImageService } from "@app/image/image.service";
import { PostRepository } from "@app/posts/repositories/post.repository";
import { LlmImageGateway } from "@app/social-publications/infrastructure/gateways/llm-image.gateway";
import { LlmTextGateway } from "@app/social-publications/infrastructure/gateways/llm-text.gateway";
import { AwsS3Service } from "@infra/storage/aws-s3.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PostBannerQueue } from "./post-banner.queue";

@Injectable()
export class PostBannerService {
  private readonly uploadsPath: string;

  constructor(
    private readonly queue: PostBannerQueue,
    private readonly posts: PostRepository,
    private readonly imageGateway: LlmImageGateway,
    private readonly textGateway: LlmTextGateway,
    private readonly imageService: ImageService,
    private readonly s3: AwsS3Service,
    config: ConfigService,
  ) {
    this.uploadsPath = (
      config.get<string>("PATH_TO_UPLOADS_MEDIA") ?? "social-publications"
    ).replace(/^\/+|\/+$/g, "");
  }

  async enqueue(postId: string, req: AuthenticatedRequest) {
    const post = await this.posts.findById(postId);
    if (!post) throw new NotFoundException("Materia nao encontrada.");

    const job = await this.queue.enqueue({ postId, requestedBy: req.user?.sub ?? "admin" });
    return { jobId: String(job.id), postId, status: "queued" as const };
  }

  async status(jobId: string) {
    const job = await this.queue.getJob(jobId);
    if (!job) throw new NotFoundException("Geracao de banner nao encontrada.");

    const state = await job.getState();
    const status =
      state === "completed"
        ? "completed"
        : state === "failed"
          ? "failed"
          : state === "active"
            ? "processing"
            : "queued";

    type ProcessResult = { coverImageAlt: string; coverImageUrl: string; postId: string };
    const result: ProcessResult | undefined =
      state === "completed" ? (job.returnvalue as ProcessResult) : undefined;

    return {
      jobId,
      status,
      progress: typeof job.progress === "number" ? job.progress : 0,
      result,
      message:
        state === "failed" ? (job.failedReason ?? "Nao foi possivel gerar o banner.") : undefined,
    };
  }

  async process(postId: string, updateProgress: (progress: number) => Promise<void>) {
    const post = await this.posts.findById(postId);
    if (!post) throw new NotFoundException("Materia nao encontrada.");

    const data = post.toPersistence();
    const content = this.extractText(data.content);
    if (!content) throw new Error("Salve algum conteudo no rascunho antes de gerar o banner.");

    await updateProgress(15);
    const visualDirection = await this.textGateway.generateArticleInfographicDirection({
      title: data.title,
      excerpt: data.excerpt,
      content,
    });
    await updateProgress(35);
    const generated = await this.imageGateway.generateArticleBanner({
      title: data.title,
      excerpt: data.excerpt,
      visualDirection,
    });
    await updateProgress(70);

    const webp = await this.imageService.toWebp(generated.image, 88);
    const coverImageAlt = await this.textGateway.generateImageAltText({
      image: webp,
      mimeType: "image/webp",
      title: data.title,
    });
    await updateProgress(80);

    const key = `${this.uploadsPath}/posts/${postId}/banner-${randomUUID()}.webp`;
    const uploaded = await this.s3.uploadObject({ buffer: webp, contentType: "image/webp", key });
    await this.posts.updatePostCoverImage(postId, uploaded.url, coverImageAlt);
    await updateProgress(100);

    return { coverImageAlt, coverImageUrl: uploaded.url, postId };
  }

  private extractText(content: unknown): string {
    if (!Array.isArray(content)) return "";

    return content
      .map((block) => {
        if (!block || typeof block !== "object") return "";
        const value = block as Record<string, unknown>;
        return [value.heading, value.text, value.content, value.caption, value.title]
          .filter((item): item is string => typeof item === "string")
          .concat(
            Array.isArray(value.items)
              ? value.items.filter((item): item is string => typeof item === "string")
              : [],
          )
          .join("\n");
      })
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 12_000);
  }
}
