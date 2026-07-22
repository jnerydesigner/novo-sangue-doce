import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import handlebars from "handlebars";
import { type CreateEmailResponse, Resend } from "resend";
import { AppLogger } from "src/@shared/logger/app-logger.provider";
import { SystemEmailParams } from "./types/system-email-params.type";

@Injectable()
export class MailService {
  private readonly systemEmailTemplate: HandlebarsTemplateDelegate;
  private readonly logoUrl: string = `https://sangue-doce.s3.us-east-1.amazonaws.com/sangue-doce-logo-small.png`;
  private readonly logger: AppLogger = new AppLogger();

  constructor(
    private readonly resend: Resend,
    private readonly configService: ConfigService,
  ) {
    const templatePath = join(__dirname, "templates", "system-email.hbs");
    this.systemEmailTemplate = handlebars.compile(readFileSync(templatePath, "utf8"), {
      strict: true,
    });
    this.logger.setContext(MailService.name);
  }

  async sendSystemEmail(params: SystemEmailParams): Promise<CreateEmailResponse["data"]> {
    // const frontendUrl = this.configService.get<string>("FRONTEND_URL") ?? "http://localhost:3010";
    const from =
      this.configService.get<string>("RESEND_FROM") ??
      this.configService.get<string>("MAILER_FROM") ??
      "Sangue Doce <onboarding@resend.dev>";

    const html = this.systemEmailTemplate({
      actionLabel: params.actionLabel ?? "Acessar Sangue Doce",
      actionUrl: params.actionUrl,
      body: params.body,
      currentYear: new Date().getFullYear(),
      footerText:
        params.footerText ??
        "Este e-mail foi enviado automaticamente pelo Sangue Doce. Nao responda esta mensagem.",
      intro: params.intro,
      logoUrl: this.logoUrl,
      previewText: params.previewText ?? params.subject,
      recipientName: params.recipientName,
      title: params.title,
    });

    const { data, error } = await this.resend.emails.send({
      attachments: params.attachments?.map((attachment) => ({
        content: attachment.content,
        content_type: attachment.contentType,
        filename: attachment.filename,
      })),
      from,
      to: params.to,
      subject: params.subject,
      html,
    });

    this.logger.log(JSON.stringify(data, null, 2), "MailService.sendSystemEmail");

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
