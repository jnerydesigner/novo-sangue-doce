import { existsSync } from "node:fs";
import { join } from "node:path";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import PDFDocument from "pdfkit";
import sharp from "sharp";
import type { MonthlyMeasurementReport, PublicMeasurement } from "./measurements.service";

type ReportColumn = {
  label: string;
  noteTypes: string[];
  width: number;
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

@Injectable()
export class MeasurementReportPdfService {
  constructor(private readonly configService: ConfigService) {}

  async generateMonthlyReportPdf(params: {
    birthDate?: string;
    diabetesType?: string;
    report: MonthlyMeasurementReport;
    reportUrl?: string;
  }): Promise<Buffer> {
    const avatarImage = await this.fetchAvatarImage(params.report.userAvatarUrl);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 28,
        size: "A4",
      });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      const urlFullReport = this.buildReportUrl(params.reportUrl);

      this.drawHeader(doc, { ...params, avatarImage });
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
    const avatarData = avatarImage?.toString("base64");
    const rows = params.report.days
      .map((day, index) => {
        const values = REPORT_COLUMNS.map((column) =>
          this.getMeasurementForColumn(day.measurements, column)?.glucoseValueMgDl ?? "",
        );
        const y = 420 + index * 34;
        return `<text x="48" y="${y}" class="date">${this.formatDate(day.date)}</text>${values.map((value, i) => `<text x="${190 + i * 163}" y="${y}" class="value">${value}</text>`).join("")}<line x1="40" y1="${y + 12}" x2="1200" y2="${y + 12}" class="line"/>`;
      })
      .join("");
    const height = Math.max(860, 450 + params.report.days.length * 34);
    const avatar = avatarData ? `<image href="data:image/png;base64,${avatarData}" x="48" y="90" width="120" height="120" preserveAspectRatio="xMidYMid slice"/>` : `<text x="108" y="155" text-anchor="middle" class="muted">FOTO</text>`;
    const labels = REPORT_COLUMNS.map((column, i) => `<text x="${190 + i * 163}" y="397" text-anchor="middle" class="header">${column.label}</text>`).join("");
    const url = this.buildReportUrl(params.reportUrl) ?? "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="${height}" viewBox="0 0 1240 ${height}">
      <style>.bg{fill:#eef6fc}.card{fill:#fff;stroke:#b7d1e8}.ink{fill:#12263d;font-family:'DejaVu Sans',sans-serif}.muted{fill:#60758a;font-family:'DejaVu Sans',sans-serif;font-size:16px}.label{fill:#60758a;font:bold 16px 'DejaVu Sans'}.text{fill:#12263d;font:16px 'DejaVu Sans'}.title{fill:#12263d;font:bold 32px 'DejaVu Sans'}.brand{fill:#145484;font:bold 24px 'DejaVu Sans'}.header{fill:#12263d;font:bold 13px 'DejaVu Sans'}.date{fill:#12263d;font:bold 14px 'DejaVu Sans'}.value{fill:#12263d;font:14px 'DejaVu Sans';text-anchor:middle}.line{stroke:#cbddea}.small{fill:#60758a;font:12px 'DejaVu Sans'}</style>
      <rect width="1240" height="${height}" class="bg"/><rect x="32" y="32" width="1176" height="${height - 64}" rx="10" class="card"/>
      <text x="48" y="70" class="title">Relatório de glicemia</text>${avatar}
      <text x="190" y="112" class="label">NOME:</text><text x="340" y="112" class="text">${this.escapeXml(params.report.userName).toUpperCase()}</text>
      <text x="190" y="142" class="label">DATA NASC:</text><text x="340" y="142" class="text">${this.escapeXml(params.birthDate ?? "NAO INFORMADO")}</text>
      <text x="190" y="172" class="label">INICIO AMOSTRAGEM:</text><text x="340" y="172" class="text">${this.formatDate(params.report.period.startDate)}</text>
      <text x="190" y="202" class="label">FIM AMOSTRAGEM:</text><text x="340" y="202" class="text">${this.formatDate(params.report.period.endDate)}</text>
      <text x="190" y="232" class="label">TIPO DIABETES:</text><text x="340" y="232" class="text">${this.escapeXml(this.formatDiabetesType(params.diabetesType))}</text>
      <text x="48" y="370" class="brand">Sangue Doce</text><text x="48" y="390" class="small">RELATÓRIO DE GLICEMIA</text><line x1="40" y1="405" x2="1200" y2="405" class="line"/>
      <text x="48" y="397" class="header">DIA</text>${labels}${rows}<text x="620" y="${height - 40}" text-anchor="middle" class="small">ESTE RELATÓRIO FOI GERADO PELO SITE SANGUE DOCE ${this.escapeXml(url)}</text>
    </svg>`;
    return sharp(Buffer.from(svg)).png().toBuffer();
  }

  private escapeXml(value: string) {
    return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
  }

  private drawHeader(
    doc: PDFKit.PDFDocument,
    params: {
      birthDate?: string;
      diabetesType?: string;
      avatarImage?: Buffer;
      report: MonthlyMeasurementReport;
      reportUrl?: string;
    },
  ) {
    const { report } = params;
    const left = doc.page.margins.left;
    const top = doc.page.margins.top;
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

    this.drawBrand(doc, brandX, top + 12, brandWidth);
  }

  private drawBrand(doc: PDFKit.PDFDocument, x: number, y: number, width: number) {
    const logoPath = join(
      process.cwd(),
      "..",
      "front-sangue-doce",
      "public",
      "sangue-doce-logo-small.png",
    );
    const logoSize = 42;
    const logoX = x + (width - logoSize) / 2;

    if (existsSync(logoPath)) {
      doc.image(logoPath, logoX, y, {
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
    const startY = 142;
    const rowHeight = 19;
    const dateWidth = 70;
    const tableWidth =
      dateWidth + REPORT_COLUMNS.reduce((total, column) => total + column.width, 0);
    let currentY = this.drawTableHeader(doc, startY, dateWidth, tableWidth);

    report.days.forEach((day) => {
      if (currentY > 760) {
        doc.addPage();
        currentY = this.drawTableHeader(doc, 40, dateWidth, tableWidth);
      }

      const y = currentY;

      doc.text(this.formatDate(day.date), left, y, {
        align: "center",
        width: dateWidth,
      });

      let columnX = left + dateWidth;

      REPORT_COLUMNS.forEach((column) => {
        const measurement = this.getMeasurementForColumn(day.measurements, column);

        doc.text(measurement ? String(measurement.glucoseValueMgDl) : "", columnX, y, {
          align: "center",
          width: column.width,
        });
        columnX += column.width;
      });

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

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#6f6558")
      .text(
        "ESTE RELATORIO FOI GERADO PELO SITE SANGUE DOCE",
        doc.page.margins.left,
        reportUrl ? 790 : 800,
        {
          align: "center",
          width: footerWidth,
        },
      );

    if (reportUrl) {
      doc
        .font("Helvetica")
        .fontSize(6.4)
        .fillColor("#6f6558")
        .text(reportUrl, doc.page.margins.left, 805, {
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
