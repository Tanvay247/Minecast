import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

let prisma: PrismaClient | null = null;

export function getPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing at runtime');
  }

  if (!prisma) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);

    prisma = new PrismaClient({ adapter });
  }

  return prisma;
}