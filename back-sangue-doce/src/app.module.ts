import { InfraModule } from "@infra/infra.module";
import { BullModule } from "@nestjs/bullmq";
import { Global, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { SharedModule } from "@shared/shared.module";
import { AuthGuard } from "./@infra/guard/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { AuthorsModule } from "./authors/authors.module";
import { CarbAnalysisModule } from "./carb-analysis/carb-analysis.module";
import { HealthModule } from "./health/health.module";
import { ImageModule } from "./image/image.module";
import { InstitutionalPublicationsModule } from "./institutional-publications/institutional-publications.module";
import { MeasurementsModule } from "./measurements/measurements.module";
import { NewsletterModule } from "./newsletter/newsletter.module";
import { PostBannerModule } from "./post-banners/post-banner.module";
import { PostsModule } from "./posts/posts.module";
import { RecipesModule } from "./recipes/recipes.module";
import { SocialPublicationsModule } from "./social-publications/social-publications.module";
import { UploadsModule } from "./uploads/uploads.module";
import { UsersModule } from "./users/users.module";
import { RequestIdMiddleware } from "./@infra/middleware/request-id.middleware";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>("REDIS_HOST") ?? "localhost",
          port: Number(configService.get<string>("REDIS_PORT") ?? 6380),
        },
      }),
    }),
    ImageModule,
    InstitutionalPublicationsModule,
    CarbAnalysisModule,
    AuthorsModule,
    AuthModule,
    SharedModule,
    InfraModule,
    HealthModule,
    UsersModule,
    PostsModule,
    RecipesModule,
    PostBannerModule,
    MeasurementsModule,
    NewsletterModule,
    UploadsModule,
    SocialPublicationsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
