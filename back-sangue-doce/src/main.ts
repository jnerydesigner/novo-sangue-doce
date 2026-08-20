import { NestFactory } from "@nestjs/core";
import { Logger as PinoLogger } from "nestjs-pino";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(PinoLogger));
  const logger = app.get(PinoLogger);

  app.enableCors({
    origin: "*",
  });

  const port = Number(process.env.SERVER_PORT ?? 3000);
  const environment = process.env.NODE_ENV ?? "development";

  await app.listen(port, "0.0.0.0");

  const url = await app.getUrl();

  logger.log(`Sangue Doce API started`, "Bootstrap");
  logger.log(`Environment: ${environment}`, "Bootstrap");
  logger.log(`Listening on: ${url}`, "Bootstrap");
  logger.log(`Health check: ${url}/health`, "Bootstrap");
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start Sangue Doce API", error);
  process.exit(1);
});
