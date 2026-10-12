import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined;
};

function getPrismaInstance(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.trim() === "") {
    return null;
  }

  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  } catch (err) {
    console.warn("Prisma PostgreSQL adapter initialization warning:", err);
    return null;
  }
}

export const prisma =
  globalForPrisma.prisma !== undefined
    ? globalForPrisma.prisma
    : getPrismaInstance();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
