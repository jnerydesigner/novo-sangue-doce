export type CreateAuthorEntityProps = {
  name: string;
  slug: string;
  role: string;
  userId: string;
  bio?: string | null;
  email?: string | null;
};

export type AuthorPersistence = {
  name: string;
  slug: string;
  role: string;
  bio: string | null;
  email: string | null;
  userId: string;
};

export type AuthorEntityProps = AuthorPersistence & {
  avatarUrl?: string | null;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PersistedAuthorEntityProps = AuthorPersistence & {
  avatarUrl?: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicAuthor = {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
  email?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class AuthorEntity {
  private constructor(private readonly props: AuthorEntityProps) {}

  static create(props: CreateAuthorEntityProps): AuthorEntity {
    return new AuthorEntity({
      name: props.name.trim(),
      slug: props.slug.trim().toLowerCase(),
      role: props.role.trim(),
      bio: props.bio?.trim() || null,
      email: props.email?.trim().toLowerCase() || null,
      userId: props.userId,
    });
  }

  static fromPersistence(props: PersistedAuthorEntityProps): AuthorEntity {
    return new AuthorEntity(props);
  }

  toPersistence(): AuthorPersistence {
    return {
      name: this.props.name,
      slug: this.props.slug,
      role: this.props.role,
      bio: this.props.bio,
      email: this.props.email,
      userId: this.props.userId,
    };
  }

  toPublic(): PublicAuthor {
    return {
      id: this.props.id as string,
      name: this.props.name,
      slug: this.props.slug,
      role: this.props.role,
      bio: this.props.bio ?? undefined,
      avatarUrl: this.props.avatarUrl ?? undefined,
      email: this.props.email ?? undefined,
      userId: this.props.userId,
      createdAt: this.props.createdAt as Date,
      updatedAt: this.props.updatedAt as Date,
    };
  }
}
