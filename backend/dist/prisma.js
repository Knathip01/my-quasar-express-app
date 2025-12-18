"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const crypto_1 = require("crypto");
function createInMemoryStore() {
    const store = new Map();
    return {
        task: {
            create: async ({ data }) => {
                const id = data.id ?? (0, crypto_1.randomUUID)();
                const now = new Date().toISOString();
                const task = {
                    id,
                    title: data.title ?? '',
                    description: data.description ?? null,
                    createdAt: now,
                    updatedAt: null,
                };
                store.set(id, task);
                return task;
            },
            findMany: async ({ orderBy } = {}) => {
                // return array sorted by createdAt desc by default
                const arr = Array.from(store.values());
                arr.sort((a, b) => (b.createdAt.localeCompare(a.createdAt)));
                return arr;
            },
            findUnique: async ({ where }) => {
                if (!where || !where.id)
                    return null;
                return store.get(where.id) ?? null;
            },
            update: async ({ where, data }) => {
                const t = store.get(where.id);
                if (!t) {
                    const err = new Error('Not found');
                    err.code = 'P2025';
                    throw err;
                }
                const updated = {
                    ...t,
                    title: data.title ?? t.title,
                    description: ('description' in data) ? data.description : t.description,
                    updatedAt: new Date().toISOString(),
                };
                store.set(where.id, updated);
                return updated;
            },
            delete: async ({ where }) => {
                const t = store.get(where.id);
                if (!t) {
                    const err = new Error('Not found');
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
let prisma = null;
exports.prisma = prisma;
if (databaseUrl) {
    try {
        const adapter = new adapter_pg_1.PrismaPg({ connectionString: databaseUrl });
        // global singleton to avoid multiple clients in dev reloads
        const globalForPrisma = globalThis;
        exports.prisma = prisma =
            globalForPrisma.prisma ??
                new client_1.PrismaClient({
                    adapter,
                    log: ['query', 'info', 'warn', 'error'],
                });
        if (process.env.NODE_ENV !== 'production') {
            globalForPrisma.prisma = prisma;
        }
        // Note: we purposely do not await $connect here to avoid top-level await issues.
        // Errors connecting will be thrown on first DB call; you can monitor logs.
    }
    catch (err) {
        console.error('Prisma initialization failed, falling back to in-memory store:', err);
        exports.prisma = prisma = createInMemoryStore();
    }
}
else {
    console.warn('DATABASE_URL not set — using in-memory stub for prisma.task');
    exports.prisma = prisma = createInMemoryStore();
}
