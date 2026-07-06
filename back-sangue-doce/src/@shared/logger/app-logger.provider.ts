import { Injectable, Logger, type LoggerService, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private context = "SangueDoce";
  private readonly logger = new Logger();

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.logger.log(message, context ?? this.context);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context ?? this.context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context ?? this.context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context ?? this.context);
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, context ?? this.context);
  }
}
