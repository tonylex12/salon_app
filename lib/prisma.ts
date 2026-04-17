import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "DATABASE_URL environment variable is not set. Prisma will not instantiate.",
  );
}

let prismaInstance: PrismaClient | null = null;

if (connectionString) {
  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  } catch (error) {
    console.error("Failed to initialize Prisma:", error);
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

if (!prismaInstance && connectionString) {
  globalForPrisma.prisma = null;
}

export const prisma: PrismaClient | null =
  prismaInstance || globalForPrisma.prisma || null;

if (process.env.NODE_ENV !== "production" && prismaInstance) {
  globalForPrisma.prisma = prismaInstance;
}
