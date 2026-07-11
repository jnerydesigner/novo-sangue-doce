import type {
  GenerateSocialImageInput,
  GenerateSocialImageOutput,
} from "@app/social-publications/types";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI, { toFile } from "openai";

const DEFAULT_MODEL = "gpt-image-2";
const DEFAULT_SIZE = "1024x1024";
const DEFAULT_QUALITY = "low";
type ImageQuality = "low" | "medium" | "high";

@Injectable()
export class LlmImageGateway {
  private readonly logger = new Logger(LlmImageGateway.name);
  private client?: OpenAI;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly quality: ImageQuality;

  constructor(private readonly configService: ConfigService) {
    this.model = this.configService.get<string>("LLM_IMAGE_MODEL") ?? DEFAULT_MODEL;
    this.timeoutMs = Number(this.configService.get<string>("LLM_IMAGE_TIMEOUT_MS") ?? 180_000);
    this.quality = this.parseQuality(
      this.configService.get<string>("LLM_IMAGE_QUALITY") ?? DEFAULT_QUALITY,
    );
  }

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: this.configService.get<string>("OPENAI_API_KEY"),
        timeout: this.timeoutMs,
      });
    }

    return this.client;
  }

  async generateSocialImage(input: GenerateSocialImageInput): Promise<GenerateSocialImageOutput> {
    this.logger.log(
      `Generating social image via OpenAI model=${this.model} quality=${this.quality} aspect=${input.targetAspectRatio}`,
    );

    const prompt = [
      "Create a professional social media image based on this reference image.",
      "The new image should:",
      "- Be a square composition (1:1 aspect ratio)",
      "- Have a clean, professional look",
      "- Maintain visual coherence with the original subject",
      "- Be optimized for mobile viewing",
      "- Not include any social media logos",
      "- Not include long text overlays",
      "- Not include watermarks",
      "- Have safe margins on edges",
      "",
      "Reference title:",
      input.title,
      "",
      "Reference summary:",
      input.summary,
      ...(input.editInstruction
        ? [
            "",
            "Additional editorial instruction:",
            input.editInstruction,
            "Follow this instruction without overriding the safety and visual rules above.",
          ]
        : []),
    ].join("\n");

    const size = this.parseSize(input.targetAspectRatio);

    const isGptImageModel = this.model.startsWith("gpt-image-");
    const response = isGptImageModel
      ? await this.getClient().images.edit({
          model: this.model,
          image: await toFile(input.sourceImage, "reference.png", { type: input.mimeType }),
          prompt,
          n: 1,
          size,
          quality: this.quality,
          output_format: "png",
        })
      : await this.getClient().images.generate({
          model: this.model,
          prompt,
          n: 1,
          size,
          quality: "hd",
        });

    const imageData = response.data?.[0];

    const imageBuffer = await this.toImageBuffer(imageData);

    this.logger.log(
      `Social image generated via OpenAI model=${this.model} size=${imageBuffer.length} revised_prompt=${imageData?.revised_prompt?.substring(0, 100)}`,
    );

    return {
      image: imageBuffer,
      mimeType: "image/png",
      model: this.model,
      requestId: response.created?.toString(),
      revisedPrompt: imageData?.revised_prompt ?? undefined,
    };
  }

  async generateArticleBanner(input: {
    title: string;
    excerpt: string;
    content: string;
  }): Promise<GenerateSocialImageOutput> {
    this.logger.log(
      `Generating article banner via OpenAI model=${this.model} quality=${this.quality}`,
    );

    const prompt = [
      "Crie uma imagem editorial profissional para o banner de uma materia sobre diabetes e saude.",
      "A imagem deve:",
      "- ter composicao horizontal 16:9, adequada para o topo de uma materia",
      "- representar visualmente a ideia central do conteudo, sem ser literal ou alarmista",
      "- transmitir acolhimento, confianca e clareza editorial",
      "- evitar aparencia de banco de imagens generico e estetica hospitalar fria",
      "- nao conter textos, letras, logotipos, marcas d'agua ou interfaces",
      "- manter o assunto principal dentro de margens seguras para cortes responsivos",
      "- retratar pessoas com naturalidade e diversidade quando pessoas forem pertinentes",
      "",
      `Titulo: ${input.title}`,
      `Resumo: ${input.excerpt}`,
      "",
      "Contexto da materia:",
      input.content.slice(0, 8_000),
    ].join("\n");

    const response = await this.getClient().images.generate({
      model: this.model,
      prompt,
      n: 1,
      size: "1536x1024",
      ...(this.model.startsWith("gpt-image-")
        ? { quality: this.quality, output_format: "png" as const }
        : { quality: "hd" as const }),
    });
    const imageData = response.data?.[0];
    const imageBuffer = await this.toImageBuffer(imageData);

    return {
      image: imageBuffer,
      mimeType: "image/png",
      model: this.model,
      requestId: response.created?.toString(),
      revisedPrompt: imageData?.revised_prompt ?? undefined,
    };
  }

  private async toImageBuffer(
    imageData: { b64_json?: string; url?: string } | undefined,
  ): Promise<Buffer> {
    if (imageData?.b64_json) {
      return Buffer.from(imageData.b64_json, "base64");
    }

    if (imageData?.url) {
      const imageResponse = await fetch(imageData.url);

      if (!imageResponse.ok) {
        throw new Error(`Falha ao baixar imagem gerada: HTTP ${imageResponse.status}`);
      }

      return Buffer.from(await imageResponse.arrayBuffer());
    }

    throw new Error("OpenAI nao retornou dados da imagem");
  }

  private parseSize(aspectRatio: "1:1" | "4:5" | "16:9"): `${number}x${number}` {
    switch (aspectRatio) {
      case "4:5":
        return "1024x1536";
      case "16:9":
        return "1536x1024";
      case "1:1":
      default:
        return DEFAULT_SIZE;
    }
  }

  private parseQuality(value: string): ImageQuality {
    return value === "medium" || value === "high" ? value : "low";
  }
}
