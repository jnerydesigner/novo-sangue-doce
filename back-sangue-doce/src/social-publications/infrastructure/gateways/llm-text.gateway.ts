import Anthropic from "@anthropic-ai/sdk";
import type {
  GenerateSocialContentInput,
  GenerateSocialContentOutput,
} from "@app/social-publications/types";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  SOCIAL_TEXT_MAX_CONTENT_CHARACTERS,
  SOCIAL_TEXT_MAX_HASHTAGS,
  SOCIAL_TEXT_MAX_SHORT_TITLE_CHARACTERS,
  SOCIAL_TEXT_PROMPT,
} from "../prompts/social-text.prompt";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 1500;

type LlmTextResponse = {
  content: string;
  hashtags: string[];
  shortTitle: string;
};

function limitText(text: string, maxLength: number): string {
  const normalized = text.trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const excerpt = normalized.slice(0, maxLength).trimEnd();
  const lastSentenceEnd = Math.max(
    excerpt.lastIndexOf("."),
    excerpt.lastIndexOf("!"),
    excerpt.lastIndexOf("?"),
  );

  if (lastSentenceEnd >= Math.floor(maxLength * 0.6)) {
    return excerpt.slice(0, lastSentenceEnd + 1).trim();
  }

  const lastSpace = excerpt.lastIndexOf(" ");

  return `${excerpt.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}...`;
}

export function normalizeTextResponse(payload: unknown): LlmTextResponse {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Resposta da LLM nao veio como objeto JSON");
  }

  const raw = payload as Record<string, unknown>;

  const content =
    typeof raw.content === "string"
      ? limitText(raw.content, SOCIAL_TEXT_MAX_CONTENT_CHARACTERS)
      : "";
  const shortTitle =
    typeof raw.shortTitle === "string"
      ? limitText(raw.shortTitle, SOCIAL_TEXT_MAX_SHORT_TITLE_CHARACTERS)
      : "";

  let hashtags: string[] = [];
  if (Array.isArray(raw.hashtags)) {
    hashtags = raw.hashtags
      .map((h) => String(h).trim())
      .filter((h) => h.length > 0)
      .map((h) => (h.startsWith("#") ? h : `#${h}`))
      .slice(0, SOCIAL_TEXT_MAX_HASHTAGS);
  }

  if (!content) {
    throw new Error("Resposta da LLM esta vazia");
  }

  return { content, hashtags, shortTitle };
}

@Injectable()
export class LlmTextGateway {
  private readonly logger = new Logger(LlmTextGateway.name);
  private client?: Anthropic;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.model = this.configService.get<string>("LLM_TEXT_MODEL") ?? DEFAULT_MODEL;
    this.timeoutMs = Number(this.configService.get<string>("LLM_TEXT_TIMEOUT_MS") ?? 60_000);
  }

  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({
        apiKey: this.configService.get<string>("ANTHROPIC_API_KEY"),
        maxRetries: 3,
      });
    }

    return this.client;
  }

  async generateSocialContent(
    input: GenerateSocialContentInput,
  ): Promise<GenerateSocialContentOutput> {
    const prompt = SOCIAL_TEXT_PROMPT.replace("{{title}}", input.title)
      .replace("{{category}}", input.category ?? "Não categorizado")
      .replace("{{tags}}", input.tags?.join(", ") ?? "Nenhuma")
      .replace("{{content}}", this.truncateMarkdown(input.markdown, 6000));

    this.logger.log(
      `Generating social text content model=${this.model} title="${input.title.substring(0, 50)}"`,
    );

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const message = await this.getClient().messages.create(
        {
          max_tokens: DEFAULT_MAX_TOKENS,
          messages: [{ role: "user", content: prompt }],
          model: this.model,
        },
        { signal: controller.signal },
      );

      clearTimeout(timeout);

      const textBlock = message.content.find((block) => block.type === "text");

      if (!textBlock || textBlock.type !== "text") {
        throw new Error("Resposta nao contem texto");
      }

      const cleaned = textBlock.text
        .trim()
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed: unknown = JSON.parse(cleaned);
      const normalized = normalizeTextResponse(parsed);

      this.logger.log(
        `Social text generated model=${this.model} tokens_in=${message.usage?.input_tokens} tokens_out=${message.usage?.output_tokens}`,
      );

      return {
        ...normalized,
        model: this.model,
        requestId: message.id,
        usage: {
          inputTokens: message.usage?.input_tokens,
          outputTokens: message.usage?.output_tokens,
        },
      };
    } catch (error) {
      clearTimeout(timeout);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Timeout ao gerar texto social (${this.timeoutMs}ms)`);
      }

      throw error;
    }
  }

  async generateImageAltText(input: {
    image: Buffer;
    mimeType: "image/jpeg" | "image/png" | "image/webp";
    title: string;
  }): Promise<string> {
    const message = await this.getClient().messages.create({
      max_tokens: 160,
      model: this.model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: input.mimeType,
                data: input.image.toString("base64"),
              },
            },
            {
              type: "text",
              text: [
                "Escreva um texto alternativo acessivel em portugues do Brasil para esta imagem.",
                `Ela sera a capa da materia: ${input.title}`,
                "Descreva somente o que e visualmente relevante, em uma frase objetiva de ate 180 caracteres.",
                "Nao comece com 'imagem de', 'foto de' ou 'ilustracao de'. Responda apenas com o texto alternativo.",
              ].join("\n"),
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Nao foi possivel gerar o texto alternativo da imagem.");
    }

    return textBlock.text
      .trim()
      .replace(/^['"]|['"]$/g, "")
      .slice(0, 180);
  }

  async generateArticleInfographicDirection(input: {
    title: string;
    excerpt: string;
    content: string;
  }): Promise<string> {
    const prompt = [
      "Atue como diretor de arte editorial especializado em infograficos de saude.",
      "Analise integralmente a materia abaixo antes de propor qualquer imagem.",
      "O tema visual deve nascer exclusivamente do conteudo: nao presuma alimentacao, medicamentos, glicemia ou qualquer outro assunto.",
      "Identifique a ideia central, os elementos visuais realmente pertinentes e uma composicao que ajude o leitor a compreender a materia.",
      "Transforme a analise em um briefing final, pronto para um modelo gerador de imagens.",
      "O briefing deve:",
      "- descrever um infografico editorial horizontal, acolhedor, confiavel e contemporaneo;",
      "- definir assunto principal, metafora visual, composicao, hierarquia, paleta e estilo;",
      "- reservar margens seguras para cortes responsivos;",
      "- evitar estetica hospitalar fria, banco de imagens generico e alarmismo;",
      "- selecionar no maximo 6 informacoes curtas e verificaveis da materia quando texto ajudar a compreensao;",
      "- colocar entre aspas todo texto que deva aparecer literalmente na imagem;",
      "- nao inventar estatisticas, recomendacoes, fontes ou creditos;",
      "- pedir que nao sejam incluidos logotipos nem marcas-d'agua.",
      "Responda somente com o briefing visual em portugues, sem explicar sua analise e sem usar JSON.",
      "",
      `Titulo: ${input.title}`,
      `Resumo: ${input.excerpt}`,
      "",
      "Conteudo da materia:",
      input.content.slice(0, 10_000),
    ].join("\n");

    this.logger.log(
      `Generating article infographic direction model=${this.model} title="${input.title.substring(0, 50)}"`,
    );

    const message = await this.getClient().messages.create({
      max_tokens: 1_500,
      model: this.model,
      messages: [{ role: "user", content: prompt }],
    });
    const textBlock = message.content.find((block) => block.type === "text");

    if (!textBlock || textBlock.type !== "text" || !textBlock.text.trim()) {
      throw new Error("Nao foi possivel planejar o infografico da materia.");
    }

    return textBlock.text.trim();
  }

  private truncateMarkdown(markdown: string, maxChars: number): string {
    if (markdown.length <= maxChars) {
      return markdown;
    }

    return markdown.substring(0, maxChars) + "\n\n[Conteúdo truncado para processamento]";
  }
}
