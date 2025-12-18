import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID } from 'crypto';

type Task = {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

function createInMemoryStore() {
  const store = new Map<string, Task>();

  return {
    task: {
      create: async ({ data }: { data: Partial<Task> }) => {
        const id = data.id ?? randomUUID();
        const now = new Date().toISOString();
        const task: Task = {
          id,
          title: (data as any).title ?? '',
          description: (data as any).description ?? null,
          createdAt: now,
          updatedAt: null,
        };
        store.set(id, task);
        return task;
      },
      findMany: async ({ orderBy }: any = {}) => {
        // return array sorted by createdAt desc by default
        const arr = Array.from(store.values());
        arr.sort((a, b) => (b.createdAt.localeCompare(a.createdAt)));
        return arr;
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        if (!where || !where.id) return null;
        return store.get(where.id) ?? null;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<Task> }) => {
        const t = store.get(where.id);
        if (!t) {
          const err: any = new Error('Not found');
          err.code = 'P2025';
          throw err;
        }
        const updated: Task = {
          ...t,
          title: data.title ?? t.title,
          description: ('description' in data) ? (data.description as any) : t.description,
          updatedAt: new Date().toISOString(),
        };
        store.set(where.id, updated);
        return updated;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const t = store.get(where.id);
        if (!t) {
          const err: any = new Error('Not found');
          err.code = 'P2025';
          throw err;
        }
        store.delete(where.id);
        return t;
      },
    },
  };
}

// Try to initialize real Prisma if DATABASE_URL present
const databaseUrl = process.env.DATABASE_URL?.trim();
let prisma: any = null;

if (databaseUrl) {
  try {
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    // global singleton to avoid multiple clients in dev reloads
    const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
    prisma =
      globalForPrisma.prisma ??
      new PrismaClient({
        adapter,
        log: ['query', 'info', 'warn', 'error'],
      });
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
    }
    // Note: we purposely do not await $connect here to avoid top-level await issues.
    // Errors connecting will be thrown on first DB call; you can monitor logs.
  } catch (err) {
    console.error('Prisma initialization failed, falling back to in-memory store:', err);
    prisma = createInMemoryStore();
  }
} else {
  console.warn('DATABASE_URL not set — using in-memory stub for prisma.task');
  prisma = createInMemoryStore();
}

export { prisma };
export type { Task };