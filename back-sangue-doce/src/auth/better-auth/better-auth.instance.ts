import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { config } from "dotenv";
import { hashPasswordWithScrypt, verifyScryptPassword } from "./password-hash";

config({ path: ".env" });

function getDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to initialize Better Auth.");
  }

  return process.env.DATABASE_URL;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: getDatabaseUrl(),
  }),
});

export const auth = betterAuth({
  appName: "Sangue Doce",
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.FRONTEND_URL ?? "http://localhost:3010"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 100,
    password: {
      hash: async (password) => {
        return hashPasswordWithScrypt(password);
      },
      verify: async ({ hash, password }) => {
        return verifyScryptPassword(password, hash);
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      birthDate: { type: "date", required: false, input: false },
      diabetesType: { type: "string", required: false, input: false },
      role: { type: "string", required: false, input: false },
      avatarUrl: { type: "string", required: false, input: false },
    },
  },
  hooks: {},
  databaseHooks: {},
});
