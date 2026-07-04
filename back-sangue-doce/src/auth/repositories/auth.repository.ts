export type EmailLoginCodeRecord = {
  id: string;
  email: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
  createdAt: Date;
};

export abstract class AuthRepository {
  abstract createEmailCodeHash(email: string, codeHash: string, expiresAt: Date): Promise<void>;
  abstract findLatestEmailCode(email: string): Promise<EmailLoginCodeRecord | null>;
  abstract incrementEmailCodeAttempts(id: string): Promise<void>;
  abstract consumeEmailCode(id: string): Promise<void>;
}
