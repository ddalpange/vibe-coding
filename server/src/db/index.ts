import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const dbPath = process.env.DATABASE_PATH || './data/sqlite.db';

// Create sqlite connection
const sqlite = new Database(dbPath);

// Create drizzle instance
export const db = drizzle(sqlite, { schema });
