// @ts-nocheck
// PrismaClient types are generated at build time via `prisma generate`
// Vercel runs `prisma generate && next build` so types will exist in CI

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis as any;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
