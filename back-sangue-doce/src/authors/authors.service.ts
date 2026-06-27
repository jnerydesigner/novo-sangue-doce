import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { type CreateAuthorDto, createAuthorSchema } from "./dto/create-author.dto";
import {
  type UpdateAuthorProfileDto,
  updateAuthorProfileSchema,
} from "./dto/update-author-profile.dto";
import { AuthorEntity, type PublicAuthor } from "./entities/author.entity";
import {
  AuthorAlreadyExistsError,
  AuthorRepository,
  AuthorUserNotFoundError,
} from "./repositories/author.repository";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class AuthorsService {
  constructor(private readonly authorRepository: AuthorRepository) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<PublicAuthor> {
    const payload = this.parseCreateAuthor(createAuthorDto);
    const authorEntity = AuthorEntity.create(payload);

    try {
      const author = await this.authorRepository.create(authorEntity);

      return author.toPublic();
    } catch (error) {
      if (error instanceof AuthorAlreadyExistsError) {
        throw new ConflictException("Author slug or e-mail already exists.");
      }

      if (error instanceof AuthorUserNotFoundError) {
        throw new BadRequestException("Author user not found.");
      }

      throw error;
    }
  }

  async findAll(): Promise<PublicAuthor[]> {
    const authors = await this.authorRepository.findAll();

    return authors.map((author) => author.toPublic());
  }

  async findOne(id: string): Promise<PublicAuthor> {
    if (!this.isValidUuid(id)) {
      throw new BadRequestException("Invalid author id.");
    }

    const author = await this.authorRepository.findById(id);

    if (!author) {
      throw new BadRequestException("Author not found.");
    }

    return author.toPublic();
  }

  async findMe(userId: string): Promise<PublicAuthor> {
    const author = await this.authorRepository.findByUserId(userId);

    if (!author) {
      throw new NotFoundException("Author profile not found.");
    }

    return author.toPublic();
  }

  async updateMe(
    userId: string,
    updateAuthorProfileDto: UpdateAuthorProfileDto,
  ): Promise<PublicAuthor> {
    const payload = this.parseUpdateAuthorProfile(updateAuthorProfileDto);
    const author = await this.authorRepository.updateProfileByUserId(userId, {
      bio: payload.bio ?? null,
      role: payload.role,
    });

    if (!author) {
      throw new NotFoundException("Author profile not found.");
    }

    return author.toPublic();
  }

  async findSlug(slug: string): Promise<PublicAuthor | null> {
    const author = await this.authorRepository.findBySlug(slug.trim().toLowerCase());

    return author ? author.toPublic() : null;
  }

  async findEmail(email: string): Promise<PublicAuthor | null> {
    const author = await this.authorRepository.findByEmail(email.trim().toLowerCase());

    return author ? author.toPublic() : null;
  }

  private parseCreateAuthor(createAuthorDto: CreateAuthorDto): CreateAuthorDto {
    const result = createAuthorSchema.safeParse(createAuthorDto);

    if (!result.success) {
      throw new BadRequestException(result.error.issues.map((issue) => issue.message));
    }

    return result.data;
  }

  private parseUpdateAuthorProfile(
    updateAuthorProfileDto: UpdateAuthorProfileDto,
  ): UpdateAuthorProfileDto {
    const result = updateAuthorProfileSchema.safeParse(updateAuthorProfileDto);

    if (!result.success) {
      throw new BadRequestException(result.error.issues.map((issue) => issue.message));
    }

    return result.data;
  }

  private isValidUuid(id: string): boolean {
    return UUID_REGEX.test(id);
  }
}
