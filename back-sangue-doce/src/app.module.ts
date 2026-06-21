import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { InfraModule } from '@infra/infra.module';
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    SharedModule,
    InfraModule,
    HealthModule,
    UsersModule,
    MeasurementsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
