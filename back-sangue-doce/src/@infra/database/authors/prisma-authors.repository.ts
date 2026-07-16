import { AuthorEntity } from "@app/authors/entities/author.entity";
import {
  AuthorAlreadyExistsError,
  type AuthorRepository,
  AuthorUserNotFoundError,
} from "@app/authors/repositories/author.repository";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";

const authorInclude = {
  socialMedia: {
    orderBy: [{ position: "asc" as const }, { name: "asc" as const }],
  },
  user: {
    select: {
      avatarUrl: true,
    },
  },
} satisfies Prisma.PostAuthorInclude;

type AuthorRecord = Prisma.PostAuthorGetPayload<{
  include: typeof authorInclude;
}>;

@Injectable()
export class PrismaAuthorsRepository implements AuthorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(author: AuthorEntity): Promise<AuthorEntity> {
    try {
      const socialMedia = author.getSocialMedia();
      const createdAuthor = await this.prisma.postAuthor.create({
        data: {
          ...author.toPersistence(),
          socialMedia: {
            create: socialMedia.map((item, index) => ({
              name: item.name,
              slug: item.slug,
              url: item.url,
              position: item.position ?? index,
            })),
          },
        },
        include: authorInclude,
      });

      return this.toEntity(createdAuthor);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new AuthorAlreadyExistsError();
      }

      if (this.isForeignKeyError(error)) {
        throw new AuthorUserNotFoundError();
      }

      throw error;
    }
  }

  async findAll(): Promise<AuthorEntity[]> {
    const authors = await this.prisma.postAuthor.findMany({
      include: authorInclude,
      orderBy: { createdAt: "desc" },
    });

    return authors.map((author) => this.toEntity(author));
  }

  async findById(id: string): Promise<AuthorEntity | null> {
    const author = await this.prisma.postAuthor.findUnique({
      include: authorInclude,
      where: { id },
    });

    return author ? this.toEntity(author) : null;
  }

  async findByUserId(userId: string): Promise<AuthorEntity | null> {
    const author = await this.prisma.postAuthor.findFirst({
      include: authorInclude,
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return author ? this.toEntity(author) : null;
  }

  async findBySlug(slug: string): Promise<AuthorEntity | null> {
    const author = await this.prisma.postAuthor.findUnique({
      include: authorInclude,
      where: { slug },
    });

    return author ? this.toEntity(author) : null;
  }

  async findByEmail(email: string): Promise<AuthorEntity | null> {
    const author = await this.prisma.postAuthor.findUnique({
      include: authorInclude,
      where: { email },
    });

    return author ? this.toEntity(author) : null;
  }

  async updateProfileByUserId(
    userId: string,
    data: {
      bio: string | null;
      role: string;
      socialMedia: { name: string; slug: string; url: string; position?: number }[];
    },
  ): Promise<AuthorEntity | null> {
    const author = await this.prisma.postAuthor.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    if (!author) {
      return null;
    }

    const updatedAuthor = await this.prisma.postAuthor.update({
      data: {
        bio: data.bio,
        role: data.role,
        socialMedia: {
          deleteMany: {},
          create: data.socialMedia.map((item, index) => ({
            name: item.name,
            slug: item.slug,
            url: item.url,
            position: item.position ?? index,
          })),
        },
      },
      include: authorInclude,
      where: { id: author.id },
    });

    return this.toEntity(updatedAuthor);
  }

  private toEntity(author: AuthorRecord): AuthorEntity {
    return AuthorEntity.fromPersistence({
      ...author,
      avatarUrl: author.user.avatarUrl,
      socialMedia: author.socialMedia.map((item) => ({
        name: item.name,
        slug: item.slug,
        url: item.url,
        position: item.position,
      })),
    });
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }

  private isForeignKeyError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
  }
}
