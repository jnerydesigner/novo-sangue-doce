import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type {
  MonthlyMeasurementReport,
  PublicMeasurement,
} from './measurements.service';

type ReportColumn = {
  label: string;
  noteTypes: string[];
  width: number;
};

const REPORT_COLUMNS: ReportColumn[] = [
  {
    label: 'ANTES DO CAFE',
    noteTypes: ['FASTING_WAKE_UP', 'BEFORE_BREAKFAST'],
    width: 78,
  },
  {
    label: 'DEPOIS DO CAFE',
    noteTypes: ['AFTER_BREAKFAST'],
    width: 78,
  },
  {
    label: 'ANTES DO ALMOCO',
    noteTypes: ['BEFORE_LUNCH'],
    width: 82,
  },
  {
    label: 'DEPOIS DO ALMOCO',
    noteTypes: ['AFTER_LUNCH'],
    width: 82,
  },
  {
    label: 'ANTES DA JANTA',
    noteTypes: ['BEFORE_DINNER'],
    width: 80,
  },
  {
    label: 'DEPOIS DA JANTA',
    noteTypes: ['AFTER_DINNER', 'BEFORE_SLEEP'],
    width: 80,
  },
];

@Injectable()
export class MeasurementReportPdfService {
  async generateMonthlyReportPdf(params: {
    birthDate?: string;
    diabetesType?: string;
    report: MonthlyMeasurementReport;
    reportUrl?: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 28,
        size: 'A4',
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.drawHeader(doc, params);
      this.drawTable(doc, params.report);
      this.drawFooter(doc);

      doc.end();
    });
  }

  private drawHeader(
    doc: PDFKit.PDFDocument,
    params: {
      birthDate?: string;
      diabetesType?: string;
      report: MonthlyMeasurementReport;
      reportUrl?: string;
    },
  ) {
    const { report } = params;
    const left = doc.page.margins.left;
    const top = doc.page.margins.top;
    const photoSize = 70;
    const labelX = left + photoSize + 24;
    const valueX = labelX + 165;
    const rowHeight = 18;
    const rows = [
      ['NOME:', report.userName.toUpperCase()],
      ['DATA NASC:', params.birthDate ?? 'NAO INFORMADO'],
      ['INICIO AMOSTRAGEM', this.formatDate(report.period.startDate)],
      ['FIM AMOSTRAGEM', this.formatDate(report.period.endDate)],
      ['TIPO DIABETES', this.formatDiabetesType(params.diabetesType)],
      ['URL RELATORIO', params.reportUrl ?? ''],
    ];

    doc
      .rect(left, top + 12, photoSize, photoSize)
      .strokeColor('#d8cdbb')
      .stroke();
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#6f6558')
      .text('FOTO', left, top + 42, {
        align: 'center',
        width: photoSize,
      });

    rows.forEach(([label, value], index) => {
      const y = top + index * rowHeight;

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#6f6558')
        .text(label, labelX, y, { width: 145 });
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#211d18')
        .text(value, valueX, y, { width: 260 });
    });
  }

  private drawTable(doc: PDFKit.PDFDocument, report: MonthlyMeasurementReport) {
    const left = doc.page.margins.left;
    const startY = 142;
    const rowHeight = 19;
    const dateWidth = 70;
    const tableWidth =
      dateWidth +
      REPORT_COLUMNS.reduce((total, column) => total + column.width, 0);
    let currentY = this.drawTableHeader(doc, startY, dateWidth, tableWidth);

    report.days.forEach((day) => {
      if (currentY > 760) {
        doc.addPage();
        currentY = this.drawTableHeader(doc, 40, dateWidth, tableWidth);
      }

      const y = currentY;

      doc.text(this.formatDate(day.date), left, y, {
        align: 'center',
        width: dateWidth,
      });

      let columnX = left + dateWidth;

      REPORT_COLUMNS.forEach((column) => {
        const measurement = this.getMeasurementForColumn(
          day.measurements,
          column,
        );

        doc.text(
          measurement ? String(measurement.glucoseValueMgDl) : '',
          columnX,
          y,
          {
            align: 'center',
            width: column.width,
          },
        );
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
      .strokeColor('#d8cdbb')
      .stroke();

    doc.font('Helvetica-Bold').fontSize(7.6).fillColor('#211d18');
    doc.text('DIA', left, y, { width: dateWidth, align: 'center' });

    let x = left + dateWidth;

    REPORT_COLUMNS.forEach((column) => {
      doc.text(column.label, x, y, {
        align: 'center',
        width: column.width,
      });
      x += column.width;
    });

    doc
      .moveTo(left, y + 14)
      .lineTo(left + tableWidth, y + 14)
      .strokeColor('#d8cdbb')
      .stroke();

    doc.font('Helvetica').fontSize(8.4).fillColor('#211d18');

    return y + 22;
  }

  private drawFooter(doc: PDFKit.PDFDocument) {
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#6f6558')
      .text(
        'ESTE RELATORIO FOI GERADO PELO SITE SANGUE DOCE',
        doc.page.margins.left,
        800,
        {
          align: 'center',
          width:
            doc.page.width - doc.page.margins.left - doc.page.margins.right,
        },
      );
  }

  private getMeasurementForColumn(
    measurements: PublicMeasurement[],
    column: ReportColumn,
  ): PublicMeasurement | null {
    return (
      measurements.find(
        (measurement) =>
          measurement.noteType &&
          column.noteTypes.includes(measurement.noteType),
      ) ?? null
    );
  }

  private formatDate(value: Date | string) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'UTC',
      year: 'numeric',
    }).format(new Date(value));
  }

  private formatDiabetesType(value?: string) {
    if (!value) {
      return 'NAO INFORMADO';
    }

    return value
      .replace('Diabetes tipo ', '')
      .replace('Diabetes ', '')
      .toUpperCase();
  }
}
