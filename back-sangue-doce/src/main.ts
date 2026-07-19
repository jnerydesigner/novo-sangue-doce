import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Logger as PinoLogger } from "nestjs-pino";
import { AppModule } from "./app.module";

const logger = new Logger("Bootstrap");

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(PinoLogger));

  app.enableCors({
    origin: "*",
  });

  const port = Number(process.env.SERVER_PORT ?? 3000);
  const environment = process.env.NODE_ENV ?? "development";

  await app.listen(port, "0.0.0.0");

  const url = await app.getUrl();

  logger.log(`Sangue Doce API started`);
  logger.log(`Environment: ${environment}`);
  logger.log(`Listening on: ${url}`);
  logger.log(`Health check: ${url}/health`);
}

bootstrap().catch((error: unknown) => {
  logger.error("Failed to start Sangue Doce API", error);
  process.exit(1);
});
