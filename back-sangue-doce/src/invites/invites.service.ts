import { PrismaService } from "@app/@infra/database/prisma.service";
import { AuthenticatedRequest } from "@app/@infra/guard/auth.guard";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, randomBytes } from "node:crypto";
import { MailService } from "src/mail/mail.service";

@Injectable()
export class InvitesService {
  private readonly logger = new Logger(InvitesService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async invite(userRequest: AuthenticatedRequest, guestEmail: string) {
    if (!userRequest.user?.sub) {
      throw new UnauthorizedException();
    }

    const email = guestEmail.trim().toLowerCase();
    const rawToken = randomBytes(32).toString("hex");

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException("Este e-mail já possui uma conta.");
    }

    const existingInvite = await this.prisma.invite.findFirst({
      where: {
        email,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    if (existingInvite) {
      throw new ConflictException("Já existe um convite pendente para este e-mail.");
    }

    await this.prisma.invite.create({
      data: {
        tokenHash: this.createHashToken(rawToken),
        email,
        senderId: userRequest.user?.sub,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const baseUrl =
      this.configService.get<string>("FRONTEND_URL") ??
      this.configService.get<string>("URL_API") ??
      "http://localhost:3010";
    const link = `${baseUrl.replace(/\/$/, "")}/convite/${rawToken}`;

    await this.mailService.sendSystemEmail({
      to: email,
      subject: "Você foi convidado para o Sangue Doce",
      title: "Convite para o Sangue Doce",
      previewText: "Seu convite para acessar o Sangue Doce está esperando por você.",
      intro: "Você recebeu um convite para participar do Sangue Doce.",
      body: "Clique no botão abaixo para aceitar o convite. Este link é válido por 7 dias.",
      actionLabel: "Aceitar convite",
      actionUrl: link,
    });

    this.logger.log(`Convite enviado para ${email}`);
    return {
      message: "Convite enviado com sucesso.",
      email,
      link,
    };
  }

  async acceptInvite(userRequest: AuthenticatedRequest, rawToken: string) {
    if (!userRequest.user?.sub) {
      throw new UnauthorizedException();
    }

    const invite = await this.prisma.invite.findUnique({
      where: { tokenHash: this.createHashToken(rawToken) },
    });

    if (!invite) {
      throw new NotFoundException("Convite não encontrado.");
    }

    if (invite.status !== "PENDING") {
      throw new BadRequestException("Este convite não está mais disponível.");
    }

    if (invite.expiresAt <= new Date()) {
      await this.prisma.invite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      throw new BadRequestException("Este convite expirou.");
    }

    if (invite.email && invite.email !== userRequest.user.email.trim().toLowerCase()) {
      throw new BadRequestException("Este convite pertence a outro e-mail.");
    }

    const acceptedInvite = await this.prisma.$transaction(async (transaction) => {
      const result = await transaction.invite.updateMany({
        where: { id: invite.id, status: "PENDING" },
        data: {
          acceptedById: userRequest.user?.sub,
          acceptedAt: new Date(),
          status: "ACCEPTED",
        },
      });

      if (result.count !== 1) {
        throw new BadRequestException("Este convite não está mais disponível.");
      }

      return transaction.invite.findUniqueOrThrow({ where: { id: invite.id } });
    });

    this.logger.log(`Convite ${acceptedInvite.id} aceito pelo usuário ${userRequest.user.sub}`);

    return {
      id: acceptedInvite.id,
      email: invite.email,
      status: acceptedInvite.status,
      acceptedAt: acceptedInvite.acceptedAt,
    };
  }

  async validateInvite(rawToken: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { tokenHash: this.createHashToken(rawToken) },
      select: { email: true, status: true, expiresAt: true },
    });

    if (!invite) {
      throw new NotFoundException("Convite não encontrado.");
    }

    if (invite.status !== "PENDING") {
      throw new BadRequestException("Este convite não está mais disponível.");
    }

    if (invite.expiresAt <= new Date()) {
      await this.prisma.invite.updateMany({
        where: { tokenHash: this.createHashToken(rawToken), status: "PENDING" },
        data: { status: "EXPIRED" },
      });
      throw new BadRequestException("Este convite expirou.");
    }

    if (!invite.email) {
      throw new BadRequestException("Este convite não possui e-mail autorizado.");
    }

    return { email: invite.email };
  }

  async listPending() {
    return this.prisma.invite.findMany({
      where: { status: "PENDING", expiresAt: { gt: new Date() } },
      select: { id: true, email: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async resend(id: string) {
    const invite = await this.prisma.invite.findUnique({ where: { id } });
    if (!invite || invite.status !== "PENDING") {
      throw new NotFoundException("Convite pendente não encontrado.");
    }
    if (!invite.email) throw new BadRequestException("Este convite não possui e-mail.");

    const rawToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.invite.update({
      where: { id },
      data: { tokenHash: this.createHashToken(rawToken), expiresAt },
    });

    const baseUrl = this.configService.get<string>("FRONTEND_URL") ?? "http://localhost:3010";
    const link = `${baseUrl.replace(/\/$/, "")}/convite/${rawToken}`;
    await this.mailService.sendSystemEmail({
      to: invite.email,
      subject: "Reenvio do seu convite para o Sangue Doce",
      title: "Seu convite está esperando por você",
      intro: "Estamos reenviando seu convite para participar do Sangue Doce.",
      body: "Clique no botão abaixo para criar sua conta. Este link é válido por 7 dias.",
      actionLabel: "Criar minha conta",
      actionUrl: link,
    });

    return { id, email: invite.email, expiresAt };
  }

  private createHashToken(rawToken: string) {
    return createHash("sha256").update(rawToken).digest("hex");
  }
}
