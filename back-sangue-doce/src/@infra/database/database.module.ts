import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUsersRepository } from './users/prisma-users.repository';
import { UserRepository } from '@app/users/repositories/user.repository';
import { PrismaAuthorsRepository } from './authors/prisma-authors.repository';
import { AuthorRepository } from '@app/authors/repositories/author.repository';
import { PrismaPostsRepository } from './posts/prisma-posts.repository';
import { PostRepository } from '@app/posts/repositories/post.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    PrismaUsersRepository,
    PrismaAuthorsRepository,
    PrismaPostsRepository,
    {
      provide: UserRepository,
      useExisting: PrismaUsersRepository,
    },
    {
      provide: AuthorRepository,
      useExisting: PrismaAuthorsRepository,
    },
    {
      provide: PostRepository,
      useExisting: PrismaPostsRepository,
    },
  ],
  exports: [PrismaService, UserRepository, AuthorRepository, PostRepository],
})
export class DatabaseModule {}
