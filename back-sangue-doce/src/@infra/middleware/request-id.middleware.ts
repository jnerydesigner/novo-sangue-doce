import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incomingRequestId = req.header("x-request-id");

    const requestId =
      typeof incomingRequestId === "string" && incomingRequestId.length <= 100
        ? incomingRequestId
        : randomUUID();

    req.headers["x-request-id"] = requestId;
    res.setHeader("x-request-id", requestId);

    next();
  }
}
