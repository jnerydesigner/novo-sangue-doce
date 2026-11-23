import { BadRequestException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { ShortLinksController } from "./short-links.controller";
import type { PrismaService } from "@infra/database/prisma.service";

function setup() {
  const db = { shortLink: { create: vi.fn(), findUnique: vi.fn(), updateManyAndReturn: vi.fn(), findMany: vi.fn() }, shortLinkLocation: { upsert: vi.fn() }, $transaction: vi.fn() };
  db.$transaction.mockImplementation((callback) => callback(db));
  return { db, controller: new ShortLinksController(db as unknown as PrismaService) };
}

describe("short links", () => {
  it("creates a short link preserving the destination query", () => {
    const { db, controller } = setup();
    controller.create({ url: "https://example.com/item?ref=affiliate", title: " Indicação " });
    expect(db.shortLink.create).toHaveBeenCalledWith({ data: { code: expect.stringMatching(/^[A-Za-z0-9_-]{11}$/), url: "https://example.com/item?ref=affiliate", title: "Indicação" } });
  });

  it("rejects unsafe destinations", () => {
    const { controller } = setup();
    for (const url of ["javascript:alert(1)", "https://user:pass@example.com", "invalid"]) {
      expect(() => controller.create({ url })).toThrow(BadRequestException);
    }
  });

  it("returns 404 for a missing link", async () => {
    const { controller, db } = setup();
    db.shortLink.updateManyAndReturn.mockResolvedValue([]);
    await expect(controller.resolve("abcdefghijk")).rejects.toThrow(NotFoundException);
  });

  it("increments visits atomically when resolving a link", async () => {
    const { controller, db } = setup();
    db.shortLink.updateManyAndReturn.mockResolvedValue([{ id: "link-id", url: "https://example.com/" }]);
    await expect(controller.resolve("abcdefghijk")).resolves.toEqual({ url: "https://example.com/" });
    expect(db.shortLink.updateManyAndReturn).toHaveBeenCalledWith({
      where: { code: "abcdefghijk" }, data: { visits: { increment: 1 } }, select: { id: true, url: true },
    });
    expect(db.shortLinkLocation.upsert).toHaveBeenCalledWith(expect.objectContaining({ create: { shortLinkId: "link-id", country: "", region: "", visits: 1 } }));
  });

  it("aggregates country and region without storing an IP", async () => {
    const { controller, db } = setup();
    db.shortLink.updateManyAndReturn.mockResolvedValue([{ id: "link-id", url: "https://example.com/" }]);
    await controller.resolve("abcdefghijk", undefined, "BR", "Amazonas");
    expect(db.shortLinkLocation.upsert).toHaveBeenCalledWith(expect.objectContaining({ create: { shortLinkId: "link-id", country: "BR", region: "Amazonas", visits: 1 } }));
  });

  it("resolves a repeated visit without incrementing", async () => {
    const { controller, db } = setup();
    db.shortLink.findUnique.mockResolvedValue({ url: "https://example.com/" });
    await expect(controller.resolve("abcdefghijk", "0")).resolves.toEqual({ url: "https://example.com/" });
    expect(db.shortLink.updateManyAndReturn).not.toHaveBeenCalled();
  });
});
