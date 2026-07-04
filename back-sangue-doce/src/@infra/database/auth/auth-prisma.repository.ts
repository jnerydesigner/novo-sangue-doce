import { AuthRepository, type EmailLoginCodeRecord } from "@app/auth/repositories/auth.repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class AuthPrismaRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEmailCodeHash(email: string, codeHash: string, expiresAt: Date): Promise<void> {
    await this.prisma.emailLoginCode.create({
      data: {
        email,
        codeHash,
        expiresAt,
      },
    });
  }

  async findLatestEmailCode(email: string): Promise<EmailLoginCodeRecord | null> {
    return this.prisma.emailLoginCode.findFirst({
      where: {
        email,
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async incrementEmailCodeAttempts(id: string): Promise<void> {
    await this.prisma.emailLoginCode.update({
      where: { id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });
  }

  async consumeEmailCode(id: string): Promise<void> {
    await this.prisma.emailLoginCode.update({
      where: { id },
      data: {
        consumedAt: new Date(),
      },
    });
  }
}
