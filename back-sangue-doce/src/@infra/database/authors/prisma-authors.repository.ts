import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthorEntity } from '@app/authors/entities/author.entity';
import {
  AuthorAlreadyExistsError,
  AuthorRepository,
  AuthorUserNotFoundError,
} from '@app/authors/repositories/author.repository';
import { PrismaService } from '../prisma.service';

type AuthorRecord = Prisma.PostAuthorGetPayload<Record<string, never>>;

@Injectable()
export class PrismaAuthorsRepository implements AuthorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(author: AuthorEntity): Promise<AuthorEntity> {
    try {
      const createdAuthor = await this.prisma.postAuthor.create({
        data: author.toPersistence(),
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
      orderBy: { createdAt: 'desc' },
    });

    return authors.map((author) => this.toEntity(author));
  }

  async findById(id: string): Promise<AuthorEntity | null> {
    const author = await this.prisma.postAuthor.findUnique({ where: { id } });

    return author ? this.toEntity(author) : null;
  }

  async findBySlug(slug: string): Promise<AuthorEntity | null> {
    const author = await this.prisma.postAuthor.findUnique({
      where: { slug },
    });

    return author ? this.toEntity(author) : null;
  }

  async findByEmail(email: string): Promise<AuthorEntity | null> {
    const author = await this.prisma.postAuthor.findUnique({
      where: { email },
    });

    return author ? this.toEntity(author) : null;
  }

  private toEntity(author: AuthorRecord): AuthorEntity {
    return AuthorEntity.fromPersistence(author);
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private isForeignKeyError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    );
  }
}
