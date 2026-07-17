import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { MailService } from "src/mail/mail.service";
import { NEWSLETTER_QUEUE, type NewsletterConfirmationJob } from "./newsletter.queue";
import { NewsletterService } from "./newsletter.service";

@Processor(NEWSLETTER_QUEUE, { concurrency: 2 })
export class NewsletterProcessor extends WorkerHost {
  constructor(
    private readonly newsletterService: NewsletterService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async process(job: Job<NewsletterConfirmationJob>) {
    const subscriber = await this.newsletterService.getPendingSubscriber(job.data.subscriberId);
    if (!subscriber) return;

    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3010";
    const confirmationUrl = `${frontendUrl.replace(/\/$/, "")}/newsletter/confirm?token=${encodeURIComponent(job.data.token)}`;
    await this.mailService.sendSystemEmail({
      to: subscriber.email,
      subject: "Confirme sua assinatura do Boletim Sangue Doce",
      title: "Confirme seu e-mail",
      intro: "Falta só um passo para receber o Boletim Sangue Doce.",
      body: "Clique no botão abaixo para confirmar sua assinatura. Se você não fez esse pedido, ignore esta mensagem.",
      actionLabel: "Confirmar assinatura",
      actionUrl: confirmationUrl,
      footerText: "Este link expira em 24 horas.",
    });
  }
}
