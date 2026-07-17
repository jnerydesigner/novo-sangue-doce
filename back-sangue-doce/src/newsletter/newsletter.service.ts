import { createHash, randomBytes } from "node:crypto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { NewsletterSubscriberStatus } from "@prisma/client";
import { PrismaService } from "src/@infra/database/prisma.service";
import { NewsletterQueue } from "./newsletter.queue";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class NewsletterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: NewsletterQueue,
  ) {}

  async subscribe(email: string, source = "homepage") {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new BadRequestException("Digite um e-mail válido.");
    }

    const token = randomBytes(32).toString("hex");
    const confirmationHash = this.hash(token);
    const confirmationExpiry = new Date(Date.now() + TOKEN_TTL_MS);
    const subscriber = await this.prisma.newsletterSubscriber.upsert({
      where: { normalizedEmail },
      create: {
        email: normalizedEmail,
        normalizedEmail,
        confirmationHash,
        confirmationExpiry,
        source,
      },
      update: {
        email: normalizedEmail,
        confirmationHash,
        confirmationExpiry,
        status: NewsletterSubscriberStatus.PENDING,
        unsubscribedAt: null,
      },
    });

    if (subscriber.status !== NewsletterSubscriberStatus.CONFIRMED) {
      await this.queue.enqueueConfirmation({ subscriberId: subscriber.id, token });
    }

    return { message: "Se o endereço for válido, enviaremos as instruções por e-mail." };
  }

  async confirm(token: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findFirst({
      where: {
        confirmationHash: this.hash(token),
        confirmationExpiry: { gt: new Date() },
      },
    });
    if (!subscriber) throw new BadRequestException("Link de confirmação inválido ou expirado.");

    await this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: NewsletterSubscriberStatus.CONFIRMED,
        confirmedAt: new Date(),
        confirmationHash: null,
        confirmationExpiry: null,
      },
    });
    return { message: "Assinatura confirmada com sucesso." };
  }

  getPendingSubscriber(id: string) {
    return this.prisma.newsletterSubscriber.findFirst({
      where: { id, status: NewsletterSubscriberStatus.PENDING },
      select: { email: true },
    });
  }

  private hash(value: string) {
    return createHash("sha256").update(value).digest("hex");
  }
}
