import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUsersRepository } from './users/prisma-users.repository';
import { UserRepository } from '@app/users/repositories/user.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    PrismaUsersRepository,
    {
      provide: UserRepository,
      useExisting: PrismaUsersRepository,
    },
  ],
  exports: [PrismaService, UserRepository],
})
export class DatabaseModule {}
