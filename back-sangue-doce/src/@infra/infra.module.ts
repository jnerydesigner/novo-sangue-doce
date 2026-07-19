import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { ObservabilityModule } from "./observability/observability.module";

@Module({
  imports: [DatabaseModule, ObservabilityModule],
})
export class InfraModule {}
