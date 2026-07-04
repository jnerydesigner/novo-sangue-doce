import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { MailService } from "./mail.service";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: Resend,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new Resend(configService.getOrThrow<string>("RESEND_API_KEY")),
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
