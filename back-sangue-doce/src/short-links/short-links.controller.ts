import { randomBytes } from "node:crypto";
import { PrismaService } from "@infra/database/prisma.service";
import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { Public } from "@app/auth/decorators/public.decorator";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { Role } from "@app/auth/enums/role.enum";
import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, UseGuards } from "@nestjs/common";

@Controller("short-links")
export class ShortLinksController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  list() {
    return this.prisma.shortLink.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { locations: { orderBy: { visits: "desc" } } } });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() body: unknown) {
    const input = body && typeof body === "object" ? body as Record<string, unknown> : {};
    if (typeof input.url !== "string" || input.url.length > 4096) throw new BadRequestException("Informe uma URL válida.");
    let url: URL;
    try { url = new URL(input.url.trim()); } catch { throw new BadRequestException("Informe uma URL válida."); }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new BadRequestException("Use uma URL HTTP ou HTTPS válida.");
    if (input.title != null && (typeof input.title !== "string" || input.title.length > 120)) throw new BadRequestException("O título deve ter até 120 caracteres.");
    const title = typeof input.title === "string" ? input.title.trim() || null : null;
    return this.prisma.shortLink.create({ data: { code: randomBytes(8).toString("base64url"), url: url.toString(), title } });
  }

  @Get(":code")
  @Public()
  async resolve(@Param("code") code: string, @Query("count") count?: string, @Query("country") rawCountry?: string, @Query("region") rawRegion?: string) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(code)) throw new NotFoundException("Link não encontrado.");
    const country = typeof rawCountry === "string" && /^[A-Z]{2}$/.test(rawCountry) && rawCountry !== "XX" ? rawCountry : "";
    const region = country && typeof rawRegion === "string" && /^[\p{L}\p{N} .'-]{1,80}$/u.test(rawRegion) ? rawRegion : "";
    const link = count === "0" ? await this.prisma.shortLink.findUnique({ where: { code }, select: { url: true } }) : await this.prisma.$transaction(async (tx) => {
      const [updated] = await tx.shortLink.updateManyAndReturn({ where: { code }, data: { visits: { increment: 1 } }, select: { id: true, url: true } });
      if (!updated) return null;
      await tx.shortLinkLocation.upsert({ where: { shortLinkId_country_region: { shortLinkId: updated.id, country, region } }, create: { shortLinkId: updated.id, country, region, visits: 1 }, update: { visits: { increment: 1 } } });
      return { url: updated.url };
    });
    if (!link) throw new NotFoundException("Link não encontrado.");
    return link;
  }
}
