import type { PublicUserType } from "@shared/types/user-public.type";

export type UserDiabetesType = "TYPE_1" | "TYPE_2" | "GESTATIONAL" | "OTHER" | "UNKNOWN";

export type UserRole = "ADMIN" | "USER";

export type CreateUserEntityProps = {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string | null;
  birthDate?: string | Date | null;
  diabetesType?: UserDiabetesType;
  role?: UserRole;
};

export type UserPersistence = {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl: string | null;
  birthDate: Date | null;
  diabetesType: UserDiabetesType;
  role: UserRole;
};

export type UserEntityProps = UserPersistence & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PersistedUserEntityProps = UserPersistence & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export class UserEntity {
  private constructor(private readonly props: UserEntityProps) {}

  static create(props: CreateUserEntityProps): UserEntity {
    return new UserEntity({
      name: props.name.trim(),
      email: props.email.trim().toLowerCase(),
      passwordHash: props.passwordHash,
      avatarUrl: props.avatarUrl ?? null,
      birthDate: props.birthDate ? new Date(props.birthDate) : null,
      diabetesType: props.diabetesType ?? "UNKNOWN",
      role: props.role ?? "USER",
    });
  }

  static fromPersistence(props: PersistedUserEntityProps): UserEntity {
    return new UserEntity(props);
  }

  toPersistence(): UserPersistence {
    return {
      name: this.props.name,
      email: this.props.email,
      passwordHash: this.props.passwordHash,
      avatarUrl: this.props.avatarUrl,
      birthDate: this.props.birthDate,
      diabetesType: this.props.diabetesType,
      role: this.props.role,
    };
  }

  getPasswordHash(): string {
    return this.props.passwordHash;
  }

  toPublic(): PublicUserType {
    return {
      id: this.props.id as string,
      name: this.props.name,
      email: this.props.email,
      avatarUrl: this.props.avatarUrl ?? undefined,
      birthDate: this.props.birthDate ?? undefined,
      diabetesType: this.props.diabetesType,
      role: this.props.role,
      createdAt: this.props.createdAt as Date,
      updatedAt: this.props.updatedAt as Date,
    };
  }
}
