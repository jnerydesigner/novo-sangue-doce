import { InfraModule } from "@infra/infra.module";
import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { SharedModule } from "@shared/shared.module";
import { AuthGuard } from "./@infra/guard/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { AuthorsModule } from "./authors/authors.module";
import { HealthModule } from "./health/health.module";
import { ImageModule } from "./image/image.module";
import { MeasurementsModule } from "./measurements/measurements.module";
import { PostsModule } from "./posts/posts.module";
import { UploadsModule } from "./uploads/uploads.module";
import { UsersModule } from "./users/users.module";

@Global()
@Module({
  imports: [
    ImageModule,
    AuthorsModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    SharedModule,
    InfraModule,
    HealthModule,
    UsersModule,
    PostsModule,
    MeasurementsModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
