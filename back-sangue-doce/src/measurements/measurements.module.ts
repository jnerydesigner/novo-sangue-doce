import { Module } from '@nestjs/common';
import { UsersModule } from '@app/users/users.module';
import { MeasurementsController } from './measurements.controller';
import { MeasurementsService } from './measurements.service';
import { AuthService } from '@app/auth/auth.service';

@Module({
  imports: [UsersModule],
  controllers: [MeasurementsController],
  providers: [MeasurementsService, AuthService],
})
export class MeasurementsModule {}
