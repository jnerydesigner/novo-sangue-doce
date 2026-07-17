import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { MailModule } from "src/mail/mail.module";
import { NewsletterController } from "./newsletter.controller";
import { NewsletterProcessor } from "./newsletter.processor";
import { NEWSLETTER_QUEUE, NewsletterQueue } from "./newsletter.queue";
import { NewsletterService } from "./newsletter.service";

@Module({
  imports: [BullModule.registerQueue({ name: NEWSLETTER_QUEUE }), MailModule],
  controllers: [NewsletterController],
  providers: [NewsletterQueue, NewsletterService, NewsletterProcessor],
})
export class NewsletterModule {}
