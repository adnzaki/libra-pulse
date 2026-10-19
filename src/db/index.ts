import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    try {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 10,
        connectionTimeoutMillis: 15000,
      });

      // Prevent unhandled pool-level errors from crashing the application
      global._postgresPool.on('error', (err) => {
        console.error('Unexpected error on idle SQL pool client:', err);
      });
    } catch {
      console.warn('[AI Studio] PostgreSQL pool connection failed — using mock pool');
      global._postgresPool = {
        query: async () => ({ rows: [] }),
        connect: async () => ({ query: async () => ({ rows: [] }), release: () => {} }),
        on: () => {},
      } as any;
    }
  }
  return global._postgresPool;
};

// Initialize Drizzle with the pool and schema with safe fallback
let db: any;
try {
  if (process.env.SQL_HOST && process.env.SQL_USER) {
    const pool = createPool();
    db = drizzle(pool, { schema });
  } else {
    throw new Error('Database not configured');
  }
} catch {
  console.warn('[AI Studio] Database not connected — using mock');
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  db = new Proxy({}, {
    get: (_, prop) => {
      if (prop === 'query') {
        return new Proxy({}, { get: () => noOp });
      }
      return () => ({
        values: () => ({
          onConflictDoUpdate: () => ({
            returning: async () => [{ uid: 'mock-user', email: 'user@example.com' }],
          }),
          returning: async () => [{}],
        }),
        from: () => [],
        select: () => ({ from: async () => [] }),
      });
    },
  });
}

export { db };
