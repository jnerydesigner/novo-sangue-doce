import { AuthRepository } from "@app/auth/repositories/auth.repository";
import { AuthorRepository } from "@app/authors/repositories/author.repository";
import { PostRepository } from "@app/posts/repositories/post.repository";
import { SocialPublicationRepository } from "@app/social-publications/domain/social-publication.repository";
import { UserRepository } from "@app/users/repositories/user.repository";
import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthPrismaRepository } from "./auth/auth-prisma.repository";
import { PrismaAuthorsRepository } from "./authors/prisma-authors.repository";
import { PrismaPostsRepository } from "./posts/prisma-posts.repository";
import { PrismaService } from "./prisma.service";
import { PrismaSocialPublicationRepository } from "./social-publications/prisma-social-publication.repository";
import { PrismaUsersRepository } from "./users/prisma-users.repository";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    PrismaUsersRepository,
    PrismaAuthorsRepository,
    PrismaPostsRepository,
    PrismaSocialPublicationRepository,
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
      provide: SocialPublicationRepository,
      useExisting: PrismaSocialPublicationRepository,
    },
    {
      provide: AuthRepository,
      useExisting: AuthPrismaRepository,
    },
  ],
  exports: [
    PrismaService,
    UserRepository,
    AuthorRepository,
    PostRepository,
    SocialPublicationRepository,
    AuthRepository,
  ],
})
export class DatabaseModule {}
