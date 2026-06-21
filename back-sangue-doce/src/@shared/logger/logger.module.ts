import { Module } from '@nestjs/common';
import { AppLogger } from './app-logger.provider';

@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
