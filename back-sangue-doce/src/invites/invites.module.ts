import { Module } from "@nestjs/common";
import { MailModule } from "src/mail/mail.module";
import { InvitesController } from "./invites.controller";
import { InvitesService } from "./invites.service";

@Module({
  imports: [MailModule],
  controllers: [InvitesController],
  providers: [InvitesService],
})
export class InvitesModule {}
