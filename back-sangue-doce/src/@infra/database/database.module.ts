import { AuthRepository } from "@app/auth/repositories/auth.repository";
import { AuthorRepository } from "@app/authors/repositories/author.repository";
import { PostRepository } from "@app/posts/repositories/post.repository";
import { UserRepository } from "@app/users/repositories/user.repository";
import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthPrismaRepository } from "./auth/auth-prisma.repository";
import { PrismaAuthorsRepository } from "./authors/prisma-authors.repository";
import { PrismaPostsRepository } from "./posts/prisma-posts.repository";
import { PrismaService } from "./prisma.service";
import { PrismaUsersRepository } from "./users/prisma-users.repository";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    PrismaUsersRepository,
    PrismaAuthorsRepository,
    PrismaPostsRepository,
    AuthPrismaRepository,
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
    {
      provide: AuthRepository,
      useExisting: AuthPrismaRepository,
    },
  ],
  exports: [PrismaService, UserRepository, AuthorRepository, PostRepository, AuthRepository],
})
export class DatabaseModule {}
