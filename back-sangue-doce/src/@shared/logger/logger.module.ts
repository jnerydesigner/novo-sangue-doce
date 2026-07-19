import { Module } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";
import { AppLogger } from "./app-logger.provider";

type PinoSerializedRequest = {
  id?: string;
  method?: string;
  headers?: {
    "x-request-id"?: string;
  };
  url?: string;
};

type PinoSerializedResponse = {
  statusCode?: number;
};

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || "info",
        genReqId: (request) => {
          const requestId = request.headers["x-request-id"];

          return typeof requestId === "string" && requestId.length > 0 ? requestId : randomUUID();
        },
        redact: {
          paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "req.body.password",
            "req.body.token",
            "res.headers.set-cookie",
          ],
          censor: "[REDACTED]",
        },
        customProps: () => ({
          service: "sangue-doce-api",
          environment: process.env.NODE_ENV ?? "development",
        }),
        serializers: {
          req(request: PinoSerializedRequest) {
            return {
              requestId: request.id ?? request.headers?.["x-request-id"],
              method: request.method,
              url: request.url,
            };
          },
          res(response: PinoSerializedResponse) {
            return {
              statusCode: response.statusCode,
            };
          },
        },
      },
    }),
  ],
  providers: [AppLogger],
  exports: [AppLogger, PinoLoggerModule],
})
export class LoggerModule {}
