import Anthropic from "@anthropic-ai/sdk";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CarbAnalysisResult, UploadedImageFile } from "./types";

type SupportedMediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

const SUPPORTED_MEDIA_TYPES = new Set<SupportedMediaType>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const DEFAULT_MODEL = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 2000;

const PROMPT = [
  "Você é um assistente especializado em identificar ingredientes de pratos ",
  "de comida em fotos. Observe a imagem e responda APENAS com um objeto JSON ",
  "válido, sem markdown e sem nenhum texto antes ou depois.\n\n",
  "O JSON deve ter SEMPRE exatamente estas chaves principais:\n",
  "{\n",
  '  "ingredientes": ["arroz branco", "frango grelhado"],\n',
  '  "confianca": "alta",\n',
  '  "observacoes": "algo relevante, se houver",\n',
  '  "carboidratos": 45,\n',
  '  "proteinas": 28,\n',
  '  "gorduras": 12,\n',
  '  "glicose_estimada": 55\n',
  "}\n\n",
  'Use "confianca" somente como "alta", "media" ou "baixa". ',
  "Use números inteiros para carboidratos, proteinas, gorduras e glicose_estimada, ",
  "sem unidade e sem texto. Se não conseguir estimar algum número, use null. ",
  "Liste apenas o que você conseguir identificar com razoável certeza visual, ",
  "e seja conciso. Se não conseguir identificar nada, retorne ingredientes como lista vazia, ",
  'confianca "baixa", observacoes explicando o motivo e os números como null. ',
  "Se houver bebidas, tente identificar também; inclua marca e volume quando visíveis, exemplo: ",
  '"Coca-Cola 350ml", "Heineken 600ml", "Guaraná Antarctica 2L". ',
  "A glicose_estimada deve ser uma referência aproximada, em mg/dL, de quanto a glicemia ",
  "pode subir com o prato.",
].join("");

function defaultResult(overrides: Partial<CarbAnalysisResult> = {}): CarbAnalysisResult {
  return {
    ingredientes: [],
    confianca: "baixa",
    observacoes: "",
    carboidratos: null,
    proteinas: null,
    gorduras: null,
    glicose_estimada: null,
    ...overrides,
  };
}

function extractNumber(value: unknown): number | null {
  if (typeof value === "boolean" || value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.round(value) : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(/[\d.,]+/);

  if (!match) {
    return null;
  }

  const parsed = Number(match[0].replace(",", "."));

  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function toDisplayString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function normalizeResult(payload: unknown): CarbAnalysisResult {
  if (typeof payload !== "object" || payload === null) {
    return defaultResult({
      erro: "Resposta não veio como objeto JSON",
      bruto: JSON.stringify(payload),
    });
  }

  const raw = payload as Record<string, unknown>;

  const ingredientesRaw = raw.ingredientes;
  const ingredientes: unknown[] =
    typeof ingredientesRaw === "string"
      ? ingredientesRaw
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : Array.isArray(ingredientesRaw)
        ? ingredientesRaw
        : [];

  const confiancaRaw = toDisplayString(raw.confianca, "baixa").toLowerCase().trim();
  const confianca: "alta" | "media" | "baixa" =
    confiancaRaw === "alta" || confiancaRaw === "media" ? confiancaRaw : "baixa";

  const normalized = defaultResult({
    ingredientes: ingredientes.map((item) => toDisplayString(item)),
    confianca,
    observacoes: toDisplayString(raw.observacoes),
    carboidratos: extractNumber(
      raw.carboidratos ?? raw.carboidratos_estimados ?? raw.total_carboidratos ?? raw.carbs,
    ),
    proteinas: extractNumber(raw.proteinas ?? raw.proteínas),
    gorduras: extractNumber(raw.gorduras),
    glicose_estimada: extractNumber(
      raw.glicose_estimada ?? raw.glucose_estimada ?? raw.aumento_glicemia,
    ),
  });

  if (raw.erro) {
    normalized.erro = toDisplayString(raw.erro);
  }
  if (raw.bruto) {
    normalized.bruto = toDisplayString(raw.bruto);
  }

  return normalized;
}

@Injectable()
export class AnthropicCarbAnalysisService {
  private client?: Anthropic;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({
        apiKey: this.configService.get<string>("ANTHROPIC_API_KEY"),
        maxRetries: 4,
      });
    }

    return this.client;
  }

  async analyzeFoodImage(file: UploadedImageFile): Promise<CarbAnalysisResult> {
    const mediaType = file.mimetype as SupportedMediaType;

    if (!SUPPORTED_MEDIA_TYPES.has(mediaType)) {
      throw new BadRequestException("Tipo de imagem não suportado.");
    }

    const model = this.configService.get<string>("ANTHROPIC_CARB_MODEL") ?? DEFAULT_MODEL;

    const message = await this.getClient().messages.create({
      max_tokens: DEFAULT_MAX_TOKENS,
      messages: [
        {
          content: [
            {
              source: {
                data: file.buffer.toString("base64"),
                media_type: mediaType,
                type: "base64",
              },
              type: "image",
            },
            { text: PROMPT, type: "text" },
          ],
          role: "user",
        },
      ],
      model,
    });

    if (message.stop_reason === "max_tokens") {
      const textBlock = message.content.find((block) => block.type === "text");

      return defaultResult({
        erro: "Resposta cortada por atingir max_tokens antes de terminar o JSON",
        bruto: textBlock?.type === "text" ? textBlock.text : "",
      });
    }

    const textBlock = message.content.find((block) => block.type === "text");

    if (!textBlock || textBlock.type !== "text") {
      return defaultResult({
        erro: "Resposta não contém texto",
        bruto: JSON.stringify(message.content),
      });
    }

    const cleaned = textBlock.text
      .trim()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return normalizeResult(JSON.parse(cleaned));
    } catch {
      return defaultResult({ erro: "Resposta não veio em JSON válido", bruto: cleaned });
    }
  }
}
