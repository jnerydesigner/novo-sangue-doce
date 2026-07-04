import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import handlebars from "handlebars";
import { type CreateEmailResponse, Resend } from "resend";

type SystemEmailParams = {
  to: string | string[];
  subject: string;
  title: string;
  previewText?: string;
  recipientName?: string;
  intro: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
  footerText?: string;
};

@Injectable()
export class MailService {
  private readonly systemEmailTemplate: HandlebarsTemplateDelegate;
  private readonly logoUrl: string =
    `https://minio.sanguedoce.com.br/sangue-doce/public/sangue-doce-logo.png`;

  constructor(
    private readonly resend: Resend,
    private readonly configService: ConfigService,
  ) {
    const templatePath = join(__dirname, "templates", "system-email.hbs");
    this.systemEmailTemplate = handlebars.compile(readFileSync(templatePath, "utf8"), {
      strict: true,
    });
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
      from,
      to: params.to,
      subject: params.subject,
      html,
    });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
