import { Module } from "@nestjs/common";
import { AppHomeController } from "./app-home.controller";
import { AppHomeService } from "./app-home.service";

@Module({
  controllers: [AppHomeController],
  providers: [AppHomeService],
})
export class AppHomeModule {}
