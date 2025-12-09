import 'dotenv/config'; // โหลด .env ให้ process.env ใช้งานได้
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// ใช้ DATABASE_URL จาก .env
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// ทำ global singleton ป้องกัน new PrismaClient บ่อย ๆ ตอน dev (nodemon reload)
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // 👈 สำคัญสำหรับ Prisma 7 + Postgres
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
