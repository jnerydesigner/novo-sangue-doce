import { Module } from "@nestjs/common";
import { ShortLinksController } from "./short-links.controller";

@Module({ controllers: [ShortLinksController] })
export class ShortLinksModule {}
