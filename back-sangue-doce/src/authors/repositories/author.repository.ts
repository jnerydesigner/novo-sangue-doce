import type { AuthorEntity } from "../entities/author.entity";

export class AuthorAlreadyExistsError extends Error {
  constructor() {
    super("Author already exists.");
    this.name = "AuthorAlreadyExistsError";
  }
}

export class AuthorUserNotFoundError extends Error {
  constructor() {
    super("Author user not found.");
    this.name = "AuthorUserNotFoundError";
  }
}

export abstract class AuthorRepository {
  abstract create(author: AuthorEntity): Promise<AuthorEntity>;
  abstract findAll(): Promise<AuthorEntity[]>;
  abstract findById(id: string): Promise<AuthorEntity | null>;
  abstract findByUserId(userId: string): Promise<AuthorEntity | null>;
  abstract findBySlug(slug: string): Promise<AuthorEntity | null>;
  abstract findByEmail(email: string): Promise<AuthorEntity | null>;
  abstract updateProfileByUserId(
    userId: string,
    data: { bio: string | null; role: string },
  ): Promise<AuthorEntity | null>;
}
