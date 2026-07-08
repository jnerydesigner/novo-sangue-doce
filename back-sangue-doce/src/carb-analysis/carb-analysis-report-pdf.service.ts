import { existsSync } from "node:fs";
import { join } from "node:path";
import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import sharp from "sharp";
import type { CarbAnalysisResult, PublicCarbAnalysis } from "./types";

@Injectable()
export class CarbAnalysisReportPdfService {
  async generateAnalysisPdf(params: {
    analysis: PublicCarbAnalysis;
    userName: string;
    userEmail: string;
  }): Promise<Buffer> {
    const analysisImage = await this.fetchAnalysisImage(params.analysis.imageUrl);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margins: {
          bottom: 24,
          left: 36,
          right: 36,
          top: 24,
        },
        size: "A4",
      });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      this.drawHeader(doc);
      this.drawSummary(doc, params);
      const resultY = this.drawAnalyzedImage(doc, analysisImage);
      this.drawResult(doc, params.analysis.result, resultY);
      this.drawFooter(doc);

      doc.end();
    });
  }

  private drawHeader(doc: PDFKit.PDFDocument) {
    const logoPath = join(
      process.cwd(),
      "..",
      "front-sangue-doce",
      "public",
      "sangue-doce-logo-small.png",
    );

    if (existsSync(logoPath)) {
      doc.image(logoPath, doc.page.margins.left, 24, {
        fit: [38, 38],
      });
    }

    doc.font("Helvetica-Bold").fontSize(17).fillColor("#0f4f2d").text("Sangue Doce", 88, 28);
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#6f6558")
      .text("RELATORIO DE ANALISE DE CARBOIDRATOS", 88, 50);

    doc.moveTo(36, 82).lineTo(559, 82).strokeColor("#d8cdbb").stroke();
  }

  private drawSummary(
    doc: PDFKit.PDFDocument,
    params: {
      analysis: PublicCarbAnalysis;
      userName: string;
      userEmail: string;
    },
  ) {
    const { analysis } = params;
    let y = 104;

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#211d18");
    doc.text("Paciente", 36, y);
    doc.text("Data", 326, y);

    y += 16;
    doc.font("Helvetica").fontSize(9).fillColor("#211d18");
    doc.text(`${params.userName} <${params.userEmail}>`, 36, y, { width: 260 });
    doc.text(this.formatDateTime(analysis.createdAt), 326, y);

    y += 34;
    this.drawMetric(
      doc,
      "Carboidratos estimados",
      this.formatGrams(analysis.totalCarbsGrams),
      36,
      y,
    );
    this.drawMetric(doc, "Glicose estimada", this.formatGlucose(analysis.estimatedGlucose), 214, y);
    this.drawMetric(
      doc,
      "Confianca",
      analysis.confidence?.toUpperCase() ?? "NAO INFORMADA",
      392,
      y,
    );

    if (analysis.imageUrl) {
      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor("#6f6558")
        .text(`Imagem analisada: ${analysis.imageUrl}`, 36, y + 66, {
          width: 523,
        });
    }
  }

  private drawAnalyzedImage(doc: PDFKit.PDFDocument, image?: Buffer): number {
    if (!image) {
      return 268;
    }

    const x = 36;
    const y = 258;
    const width = 164;
    const height = 112;

    doc.font("Helvetica-Bold").fontSize(10).fillColor("#211d18").text("Imagem analisada", x, y);
    doc
      .rect(x, y + 18, width, height)
      .strokeColor("#d8cdbb")
      .stroke();

    try {
      doc.image(image, x + 1, y + 19, {
        fit: [width - 2, height - 2],
        align: "center",
        valign: "center",
      });
    } catch {
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#6f6558")
        .text("Nao foi possivel renderizar a imagem no PDF.", x + 12, y + 74, {
          align: "center",
          width: width - 24,
        });
    }

    return y + height + 38;
  }

  private drawMetric(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number) {
    doc.rect(x, y, 148, 52).strokeColor("#d8cdbb").stroke();
    doc
      .font("Helvetica-Bold")
      .fontSize(7)
      .fillColor("#6f6558")
      .text(label.toUpperCase(), x + 10, y + 10, {
        width: 128,
      });
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("#211d18")
      .text(value, x + 10, y + 28, {
        width: 128,
      });
  }

  private drawResult(doc: PDFKit.PDFDocument, result: CarbAnalysisResult, startY: number) {
    let y = startY;

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#211d18")
      .text("Resultado da analise", 44, y);
    y += 20;

    const ingredients = Array.isArray(result.ingredientes) ? result.ingredientes : [];
    const rows = [
      [
        "Ingredientes identificados",
        ingredients.length > 0 ? ingredients.join(", ") : "Nao informado",
      ],
      ["Proteinas", this.formatUnknown(result.proteinas)],
      ["Gorduras", this.formatUnknown(result.gorduras)],
      ["Observacoes", this.formatUnknown(result.observacoes)],
      ["Erro retornado", this.formatUnknown(result.erro)],
    ].filter(([, value]) => value !== "Nao informado");

    doc.font("Helvetica").fontSize(9).fillColor("#211d18");

    rows.forEach(([label, value]) => {
      doc.font("Helvetica-Bold").text(`${label}:`, 36, y, { width: 150 });
      doc.font("Helvetica").text(value, 190, y, { width: 369 });
      y += Math.max(20, doc.heightOfString(value, { width: 369 }) + 9);
    });

    if (rows.length === 0) {
      doc.text("A API retornou apenas os campos principais da analise.", 44, y);
    }
  }

  private drawFooter(doc: PDFKit.PDFDocument) {
    doc
      .font("Helvetica-Bold")
      .fontSize(7)
      .fillColor("#6f6558")
      .text("ESTE RELATORIO FOI GERADO AUTOMATICAMENTE PELO SANGUE DOCE", 36, 806, {
        align: "center",
        width: 523,
      });
  }

  private formatDateTime(value: Date | string) {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Manaus",
    }).format(new Date(value));
  }

  private formatGrams(value?: number | null) {
    return typeof value === "number" ? `${value} g` : "NAO INFORMADO";
  }

  private formatGlucose(value?: number | null) {
    return typeof value === "number" ? `${value} mg/dL` : "NAO INFORMADA";
  }

  private formatUnknown(value: unknown) {
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (value === null || value === undefined || value === "") {
      return "Nao informado";
    }

    return String(value);
  }

  private async fetchAnalysisImage(imageUrl?: string | null): Promise<Buffer | undefined> {
    if (!imageUrl) {
      return undefined;
    }

    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        return undefined;
      }

      return sharp(Buffer.from(await response.arrayBuffer()))
        .rotate()
        .png()
        .toBuffer();
    } catch {
      return undefined;
    }
  }
}
