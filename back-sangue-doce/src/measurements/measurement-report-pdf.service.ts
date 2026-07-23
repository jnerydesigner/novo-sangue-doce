import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import PDFDocument from "pdfkit";
import sharp from "sharp";
import type { MonthlyMeasurementReport, PublicMeasurement } from "./measurements.service";
import { AppLogger } from "@app/@shared/logger/app-logger.provider";

type ReportColumn = {
  label: string;
  noteTypes: string[];
  width: number;
};

type GlucoseStage = {
  label: string;
  description: string;
  range: string;
  color: string;
  isNormal?: boolean;
  min?: number;
  max?: number;
};

const REPORT_COLUMNS: ReportColumn[] = [
  {
    label: "ANTES DO CAFE",
    noteTypes: ["FASTING_WAKE_UP", "BEFORE_BREAKFAST"],
    width: 78,
  },
  {
    label: "DEPOIS DO CAFE",
    noteTypes: ["AFTER_BREAKFAST"],
    width: 78,
  },
  {
    label: "ANTES DO ALMOCO",
    noteTypes: ["BEFORE_LUNCH"],
    width: 82,
  },
  {
    label: "DEPOIS DO ALMOCO",
    noteTypes: ["AFTER_LUNCH"],
    width: 82,
  },
  {
    label: "ANTES DA JANTA",
    noteTypes: ["BEFORE_DINNER"],
    width: 80,
  },
  {
    label: "DEPOIS DA JANTA",
    noteTypes: ["AFTER_DINNER", "BEFORE_SLEEP"],
    width: 80,
  },
];

const ADA_REFERENCE_TEXT = "De acordo com a American Diabetes Association (ADA)";

const GLUCOSE_STAGES: GlucoseStage[] = [
  {
    label: "Abaixo de 79",
    description: "Nivel preocupante",
    range: "(< 79 mg/dL)",
    color: "#ef1d12",
    max: 79,
  },
  {
    label: "Entre 80 e 120",
    description: "Nivel normal",
    range: "(80 - 120 mg/dL)",
    color: "#159455",
    isNormal: true,
    min: 80,
    max: 120,
  },
  {
    label: "Entre 121 e 180",
    description: "Acima da meta",
    range: "(121 - 180 mg/dL)",
    color: "#ff7a00",
    min: 121,
    max: 180,
  },
  {
    label: "Entre 181 e 250",
    description: "Elevada",
    range: "(181 - 250 mg/dL)",
    color: "#f04012",
    min: 181,
    max: 250,
  },
  {
    label: "Entre 251 e 300",
    description: "Muito elevada",
    range: "(251 - 300 mg/dL)",
    color: "#d60000",
    min: 251,
    max: 300,
  },
  {
    label: "Acima de 300",
    description: "Criticamente elevada",
    range: "(> 300 mg/dL)",
    color: "#98080c",
    min: 301,
  },
];

@Injectable()
export class MeasurementReportPdfService {
  constructor(
    private readonly configService: ConfigService,
    private readonly appLogger: AppLogger,
  ) {
    this.appLogger.setContext(MeasurementReportPdfService.name);
  }

  async generateMonthlyReportPdf(params: {
    birthDate?: string;
    diabetesType?: string;
    report: MonthlyMeasurementReport;
    reportUrl?: string;
  }): Promise<Buffer> {
    const avatarImage = await this.fetchAvatarImage(params.report.userAvatarUrl);
    const logoImage = await this.fetchLogoImage();

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margins: { bottom: 10, left: 22, right: 22, top: 16 },
        size: "A4",
      });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      const urlFullReport = this.buildReportUrl(params.reportUrl);

      this.drawHeader(doc, { ...params, avatarImage, logoImage });
      this.drawTable(doc, params.report);
      this.drawFooter(doc, urlFullReport);

      doc.end();
    });
  }

  async generateMonthlyReportImage(params: {
    birthDate?: string;
    diabetesType?: string;
    report: MonthlyMeasurementReport;
    reportUrl?: string;
  }): Promise<Buffer> {
    const avatarImage = await this.fetchAvatarImage(params.report.userAvatarUrl);
    const logoImage = await this.fetchLogoImage();
    const avatarData = avatarImage?.toString("base64");
    const logoData = logoImage?.toString("base64");
    const fontPath = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
    const fontData = existsSync(fontPath) ? readFileSync(fontPath).toString("base64") : "";
    const scale = 2;
    const pageWidth = 595.28 * scale;
    const pageHeight = 841.89 * scale;
    const left = 22 * scale;
    const top = 16 * scale;
    const photoSize = 70 * scale;
    const labelX = left + photoSize + 24 * scale;
    const brandWidth = 150 * scale;
    const brandX = pageWidth - left - brandWidth;
    const labelWidth = 126 * scale;
    const valueX = labelX + labelWidth + 12 * scale;
    const rowHeight = 19 * scale;
    const dateWidth = 70 * scale;
    const tableHeaderY = 124 * scale;
    const tableWidth =
      dateWidth + REPORT_COLUMNS.reduce((total, column) => total + column.width * scale, 0);
    const headerRows = [
      ["NOME:", params.report.userName.toUpperCase()],
      ["DATA NASC:", params.birthDate ?? "NAO INFORMADO"],
      ["INICIO AMOSTRAGEM:", this.formatDate(params.report.period.startDate)],
      ["FIM AMOSTRAGEM:", this.formatDate(params.report.period.endDate)],
      ["TIPO DIABETES:", this.formatDiabetesType(params.diabetesType)],
    ];
    const headerInfo = headerRows
      .map(
        ([label, value], index) =>
          `<text x="${labelX}" y="${top + index * 18 * scale}" class="label">${this.escapeXml(label)}</text><text x="${valueX}" y="${top + index * 18 * scale}" class="valueStrong">${this.escapeXml(value)}</text>`,
      )
      .join("");
    const tableLabels = REPORT_COLUMNS.reduce(
      (markup, column, index) => {
        const x =
          left +
          dateWidth +
          REPORT_COLUMNS.slice(0, index).reduce((total, item) => total + item.width * scale, 0);

        return `${markup}<text x="${x + (column.width * scale) / 2}" y="${tableHeaderY}" text-anchor="middle" class="tableHeader">${column.label}</text>`;
      },
      `<text x="${left + dateWidth / 2}" y="${tableHeaderY}" text-anchor="middle" class="tableHeader">DIA</text>`,
    );
    const rows = params.report.days
      .map((day, index) => {
        const y = tableHeaderY + 22 * scale + index * rowHeight;
        let columnX = left + dateWidth;
        const values = REPORT_COLUMNS.map((column) => {
          const x = columnX;
          const measurement = this.getMeasurementForColumn(day.measurements, column);
          columnX += column.width * scale;

          if (!measurement) {
            return "";
          }

          const stage = this.getGlucoseStage(measurement.glucoseValueMgDl);
          const centerX = x + (column.width * scale) / 2;

          return `<rect x="${centerX - 15 * scale}" y="${y - 8 * scale}" width="${7 * scale}" height="${7 * scale}" fill="${stage.color}" rx="${1.5 * scale}"/><text x="${centerX}" y="${y}" text-anchor="middle" class="tableValue">${measurement.glucoseValueMgDl}</text>`;
        }).join("");

        const lineY = y + 10 * scale;

        return `<text x="${left + dateWidth / 2}" y="${y}" text-anchor="middle" class="tableDate">${this.formatDate(day.date)}</text>${values}<line x1="${left}" y1="${lineY}" x2="${left + tableWidth}" y2="${lineY}" class="rowLine"/>`;
      })
      .join("");
    const avatar = avatarData
      ? `<image href="data:image/png;base64,${avatarData}" x="${left}" y="${top + 12 * scale}" width="${photoSize}" height="${photoSize}" preserveAspectRatio="xMidYMid slice"/>`
      : `<text x="${left + photoSize / 2}" y="${top + 42 * scale}" text-anchor="middle" class="muted">FOTO</text>`;
    const logoSize = 42 * scale;
    const logoX = brandX + (brandWidth - logoSize) / 2;
    const logo = logoData
      ? `<image href="data:image/png;base64,${logoData}" x="${logoX}" y="${top + 12 * scale}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`
      : "";
    const url = this.buildReportUrl(params.reportUrl) ?? "";
    const legendRows = this.buildSvgLegendRows(pageWidth, scale);
    const reportUrlMarkup = url
      ? `<text x="${pageWidth / 2}" y="${817 * scale}" text-anchor="middle" class="footerUrl">${this.escapeXml(url)}</text>`
      : "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">
      <style>@font-face{font-family:ReportFont;src:url(data:font/ttf;base64,${fontData})}.page{fill:#fff}.photoBorder{fill:none;stroke:#d8cdbb;stroke-width:2}.line{stroke:#d8cdbb;stroke-width:2}.muted{fill:#6f6558;font:bold 18px ReportFont,Arial,sans-serif}.label{fill:#6f6558;font:bold 17px ReportFont,Arial,sans-serif}.valueStrong{fill:#211d18;font:bold 17px ReportFont,Arial,sans-serif}.brand{fill:#0f4f2d;font:bold 22px ReportFont,Arial,sans-serif}.brandSubtitle{fill:#6f6558;font:bold 12px ReportFont,Arial,sans-serif}.tableHeader{fill:#211d18;font:bold 15px ReportFont,Arial,sans-serif}.tableDate{fill:#211d18;font:17px ReportFont,Arial,sans-serif}.tableValue{fill:#211d18;font:bold 17px ReportFont,Arial,sans-serif}.rowLine{stroke:#d8cdbb;stroke-width:1.5}.legendTitle{fill:#211d18;font:bold 10px ReportFont,Arial,sans-serif}.legendDescription{fill:#211d18;font:9px ReportFont,Arial,sans-serif}.legendRange{fill:#211d18;font:8.5px ReportFont,Arial,sans-serif}.adaReference{fill:#6f6558;font:bold 10px ReportFont,Arial,sans-serif}.footer{fill:#6f6558;font:bold 16px ReportFont,Arial,sans-serif}.footerUrl{fill:#6f6558;font:13px ReportFont,Arial,sans-serif}</style>
      <rect width="${pageWidth}" height="${pageHeight}" class="page"/>
      <rect x="${left}" y="${top + 12 * scale}" width="${photoSize}" height="${photoSize}" class="photoBorder"/>${avatar}
      ${headerInfo}
      ${logo}<text x="${brandX + brandWidth / 2}" y="${top + 47 * scale}" text-anchor="middle" class="brand">Sangue Doce</text><text x="${brandX + brandWidth / 2}" y="${top + 62 * scale}" text-anchor="middle" class="brandSubtitle">RELATORIO DE GLICEMIA</text>
      <line x1="${left}" y1="${tableHeaderY - 9 * scale}" x2="${left + tableWidth}" y2="${tableHeaderY - 9 * scale}" class="line"/>
      ${tableLabels}
      <line x1="${left}" y1="${tableHeaderY + 14 * scale}" x2="${left + tableWidth}" y2="${tableHeaderY + 14 * scale}" class="line"/>
      ${rows}
      ${legendRows}
      <text x="${pageWidth / 2}" y="${786 * scale}" text-anchor="middle" class="adaReference">${this.escapeXml(ADA_REFERENCE_TEXT)}</text>
      <text x="${pageWidth / 2}" y="${(url ? 802 : 814) * scale}" text-anchor="middle" class="footer">ESTE RELATORIO FOI GERADO PELO SITE SANGUE DOCE</text>
      ${reportUrlMarkup}
    </svg>`;
    return sharp(Buffer.from(svg)).png().toBuffer();
  }

  private escapeXml(value: string) {
    return value.replace(
      /[&<>"']/g,
      (character) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ??
        character,
    );
  }

  private drawHeader(
    doc: PDFKit.PDFDocument,
    params: {
      birthDate?: string;
      diabetesType?: string;
      avatarImage?: Buffer;
      logoImage?: Buffer;
      report: MonthlyMeasurementReport;
      reportUrl?: string;
    },
  ) {
    const { report } = params;
    const left = doc.page.margins.left;
    const top = doc.page.margins.top;
    this.appLogger.log("Top " + top);
    const photoSize = 70;
    const labelX = left + photoSize + 24;
    const brandWidth = 150;
    const brandX = doc.page.width - doc.page.margins.right - brandWidth;
    const labelWidth = 126;
    const valueX = labelX + labelWidth + 12;
    const valueWidth = brandX - valueX - 18;
    const rowHeight = 18;
    const rows = [
      ["NOME:", report.userName.toUpperCase()],
      ["DATA NASC:", params.birthDate ?? "NAO INFORMADO"],
      ["INICIO AMOSTRAGEM:", this.formatDate(report.period.startDate)],
      ["FIM AMOSTRAGEM:", this.formatDate(report.period.endDate)],
      ["TIPO DIABETES:", this.formatDiabetesType(params.diabetesType)],
    ];

    doc
      .rect(left, top + 12, photoSize, photoSize)
      .strokeColor("#d8cdbb")
      .stroke();

    const avatarWasDrawn =
      params.avatarImage && this.drawImage(doc, params.avatarImage, left, top + 12, photoSize);

    if (!avatarWasDrawn) {
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#6f6558")
        .text("FOTO", left, top + 42, {
          align: "center",
          width: photoSize,
        });
    }

    rows.forEach(([label, value], index) => {
      const y = top + index * rowHeight;

      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor("#6f6558")
        .text(label, labelX, y, { width: labelWidth });
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor("#211d18")
        .text(value, valueX, y, { width: valueWidth });
    });

    this.drawBrand(doc, brandX, top + 12, brandWidth, params.logoImage);
  }

  private drawBrand(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    logoImage?: Buffer,
  ) {
    const logoSize = 42;
    const logoX = x + (width - logoSize) / 2;

    if (logoImage) {
      doc.image(logoImage, logoX, y, {
        fit: [logoSize, logoSize],
        align: "center",
        valign: "center",
      });
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#0f4f2d")
      .text("Sangue Doce", x, y + 47, {
        align: "center",
        width,
      });
    doc
      .font("Helvetica-Bold")
      .fontSize(5.8)
      .fillColor("#6f6558")
      .text("RELATORIO DE GLICEMIA", x, y + 62, {
        align: "center",
        width,
      });
  }

  private drawTable(doc: PDFKit.PDFDocument, report: MonthlyMeasurementReport) {
    const left = doc.page.margins.left;
    const startY = 124;
    const dateWidth = 70;
    const tableWidth =
      dateWidth + REPORT_COLUMNS.reduce((total, column) => total + column.width, 0);
    const firstRowY = this.drawTableHeader(doc, startY, dateWidth, tableWidth);
    const tableBottomY = 748;
    const rowHeight = Math.min(
      19,
      Math.max(8.6, (tableBottomY - firstRowY) / Math.max(report.days.length, 1)),
    );
    const rowFontSize = rowHeight < 11 ? 5.8 : rowHeight < 14 ? 6.7 : rowHeight < 17 ? 7.5 : 8.4;
    const badgeSize = rowHeight < 11 ? 3.8 : rowHeight < 14 ? 4.4 : 5.5;
    let currentY = firstRowY;

    doc.font("Helvetica").fontSize(rowFontSize).fillColor("#211d18");

    report.days.forEach((day) => {
      const y = currentY;

      doc.text(this.formatDate(day.date), left, y, {
        align: "center",
        width: dateWidth,
      });

      let columnX = left + dateWidth;

      REPORT_COLUMNS.forEach((column) => {
        const measurement = this.getMeasurementForColumn(day.measurements, column);
        const stage = measurement ? this.getGlucoseStage(measurement.glucoseValueMgDl) : null;

        if (measurement && stage) {
          const value = String(measurement.glucoseValueMgDl);
          const textWidth = doc.font("Helvetica-Bold").fontSize(rowFontSize).widthOfString(value);
          const centerX = columnX + column.width / 2;

          doc
            .roundedRect(
              centerX - textWidth / 2 - badgeSize - 3,
              y + Math.max(1.5, rowFontSize * 0.22),
              badgeSize,
              badgeSize,
              1,
            )
            .fillColor(stage.color)
            .fill();
          doc.fillColor("#211d18").text(value, columnX, y, {
            align: "center",
            width: column.width,
          });
        }
        columnX += column.width;
      });

      doc
        .moveTo(left, y + rowHeight - 4)
        .lineTo(left + tableWidth, y + rowHeight - 4)
        .strokeColor("#d8cdbb")
        .lineWidth(0.5)
        .stroke();
      doc.font("Helvetica").fontSize(rowFontSize).fillColor("#211d18");
      currentY += rowHeight;
    });
  }

  private drawTableHeader(
    doc: PDFKit.PDFDocument,
    y: number,
    dateWidth: number,
    tableWidth: number,
  ) {
    const left = doc.page.margins.left;

    doc
      .moveTo(left, y - 9)
      .lineTo(left + tableWidth, y - 9)
      .strokeColor("#d8cdbb")
      .stroke();

    doc.font("Helvetica-Bold").fontSize(7.6).fillColor("#211d18");
    doc.text("DIA", left, y, { width: dateWidth, align: "center" });

    let x = left + dateWidth;

    REPORT_COLUMNS.forEach((column) => {
      doc.text(column.label, x, y, {
        align: "center",
        width: column.width,
      });
      x += column.width;
    });

    doc
      .moveTo(left, y + 14)
      .lineTo(left + tableWidth, y + 14)
      .strokeColor("#d8cdbb")
      .stroke();

    doc.font("Helvetica").fontSize(8.4).fillColor("#211d18");

    return y + 22;
  }

  private drawFooter(doc: PDFKit.PDFDocument, reportUrl?: string) {
    const footerWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    this.drawLegend(doc, 754);

    doc
      .font("Helvetica-Bold")
      .fontSize(5.8)
      .fillColor("#6f6558")
      .text(ADA_REFERENCE_TEXT, doc.page.margins.left, 784, {
        align: "center",
        width: footerWidth,
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#6f6558")
      .text(
        "ESTE RELATORIO FOI GERADO PELO SITE SANGUE DOCE",
        doc.page.margins.left,
        reportUrl ? 800 : 812,
        {
          align: "center",
          width: footerWidth,
        },
      );

    if (reportUrl) {
      doc
        .font("Helvetica")
        .fontSize(6.2)
        .fillColor("#6f6558")
        .text(reportUrl, doc.page.margins.left, 815, {
          align: "center",
          width: footerWidth,
        });
    }
  }

  private getMeasurementForColumn(
    measurements: PublicMeasurement[],
    column: ReportColumn,
  ): PublicMeasurement | null {
    return (
      measurements.find(
        (measurement) => measurement.noteType && column.noteTypes.includes(measurement.noteType),
      ) ?? null
    );
  }

  private getGlucoseStage(value: number): GlucoseStage {
    return (
      GLUCOSE_STAGES.find((stage) => {
        const aboveMin = stage.min === undefined || value >= stage.min;
        const belowMax = stage.max === undefined || value <= stage.max;
        return aboveMin && belowMax;
      }) ?? GLUCOSE_STAGES[GLUCOSE_STAGES.length - 1]
    );
  }

  private buildSvgLegendRows(pageWidth: number, scale: number) {
    const itemWidth = 86 * scale;
    const startX = (pageWidth - itemWidth * GLUCOSE_STAGES.length) / 2;

    return GLUCOSE_STAGES.map((stage, index) => {
      const x = startX + index * itemWidth;
      const y = 756 * scale;

      return `<rect x="${x}" y="${y - 11 * scale}" width="${7 * scale}" height="${7 * scale}" fill="${stage.color}" rx="${1.5 * scale}"/><text x="${x + 8 * scale}" y="${y - 4 * scale}" class="legendTitle">${this.escapeXml(stage.label)}</text><text x="${x + 8 * scale}" y="${y + 9 * scale}" class="legendDescription">${this.escapeXml(stage.description)}</text><text x="${x + 8 * scale}" y="${y + 21 * scale}" class="legendRange">${this.escapeXml(stage.range)}</text>`;
    }).join("");
  }

  private drawLegend(doc: PDFKit.PDFDocument, y: number) {
    const itemWidth = 86;
    const startX = (doc.page.width - itemWidth * GLUCOSE_STAGES.length) / 2;

    GLUCOSE_STAGES.forEach((stage, index) => {
      const itemX = startX + index * itemWidth;

      doc
        .roundedRect(itemX, y - 6.5, 5.5, 5.5, 1)
        .fillColor(stage.color)
        .fill();
      doc
        .font("Helvetica-Bold")
        .fontSize(5.8)
        .fillColor("#211d18")
        .text(stage.label, itemX + 8, y - 7, {
          lineBreak: false,
          width: itemWidth - 8,
        });
      doc
        .font("Helvetica")
        .fontSize(5.6)
        .fillColor("#211d18")
        .text(stage.description, itemX + 8, y + 4, {
          lineBreak: false,
          width: itemWidth - 8,
        });
      doc
        .font("Helvetica")
        .fontSize(5.3)
        .fillColor("#211d18")
        .text(stage.range, itemX + 8, y + 15, {
          lineBreak: false,
          width: itemWidth - 8,
        });
    });
  }

  private formatDate(value: Date | string) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC",
      year: "numeric",
    }).format(new Date(value));
  }

  private formatDiabetesType(value?: string) {
    if (!value) {
      return "NAO INFORMADO";
    }

    return value.replace("Diabetes tipo ", "").replace("Diabetes ", "").toUpperCase();
  }

  private drawImage(
    doc: PDFKit.PDFDocument,
    image: Buffer,
    x: number,
    y: number,
    size: number,
  ): boolean {
    try {
      doc.image(image, x, y, {
        fit: [size, size],
        align: "center",
        valign: "center",
      });

      return true;
    } catch {
      return false;
    }
  }

  private buildReportUrl(reportUrl?: string): string | undefined {
    if (!reportUrl) {
      return undefined;
    }

    if (/^https?:\/\//i.test(reportUrl)) {
      return reportUrl;
    }

    const siteUrl =
      this.configService.get<string>("URL_SITE") ??
      this.configService.get<string>("FRONTEND_URL") ??
      "";

    if (!siteUrl) {
      return reportUrl;
    }

    return `${siteUrl.replace(/\/$/, "")}/${reportUrl.replace(/^\/+/, "")}`;
  }

  private async fetchAvatarImage(avatarUrl?: string): Promise<Buffer | undefined> {
    if (!avatarUrl) {
      return undefined;
    }

    try {
      const response = await fetch(this.resolvePublicImageUrl(avatarUrl));

      if (!response.ok) {
        return undefined;
      }

      return this.normalizeImageForPdf(Buffer.from(await response.arrayBuffer()));
    } catch {
      return undefined;
    }
  }

  private async fetchLogoImage(): Promise<Buffer | undefined> {
    const localPaths = [
      join(process.cwd(), "public", "sangue-doce-logo-small.png"),
      join(process.cwd(), "..", "front-sangue-doce", "public", "sangue-doce-logo-small.png"),
      join(__dirname, "../../../../front-sangue-doce/public/sangue-doce-logo-small.png"),
    ];
    const localPath = localPaths.find((path) => existsSync(path));

    if (localPath) {
      return readFileSync(localPath);
    }

    const siteUrl =
      this.configService.get<string>("URL_SITE") ?? this.configService.get<string>("FRONTEND_URL");
    if (!siteUrl) return undefined;

    try {
      const response = await fetch(`${siteUrl.replace(/\/$/, "")}/sangue-doce-logo-small.png`);
      return response.ok ? Buffer.from(await response.arrayBuffer()) : undefined;
    } catch {
      return undefined;
    }
  }

  private async normalizeImageForPdf(image: Buffer): Promise<Buffer | undefined> {
    try {
      return await sharp(image).rotate().png().toBuffer();
    } catch {
      return undefined;
    }
  }

  private resolvePublicImageUrl(value: string): string {
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    const publicBaseUrl = this.configService.get<string>("MINIO_PUBLIC_URL") ?? "";
    const publicPath = this.configService.get<string>("MINIO_PUBLIC_PATH") ?? "";

    if (!publicBaseUrl || !value.startsWith("/")) {
      return value;
    }

    if (publicPath && !value.startsWith(publicPath)) {
      return `${publicBaseUrl.replace(/\/$/, "")}/${publicPath.replace(/^\/|\/$/g, "")}/${value.replace(/^\/+/, "")}`;
    }

    return `${publicBaseUrl.replace(/\/$/, "")}${value}`;
  }
}
