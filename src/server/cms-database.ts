import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { initialContent } from "./cms-seed";

type Row = Record<string, unknown>;
type Query = { sql: string; params?: SQLInputValue[] };
type Result = { rows: Row[]; changes: number };
export interface CmsDatabase {
  prepare(sql: string): {
    get(...params: SQLInputValue[]): Promise<Row | undefined>;
    all(...params: SQLInputValue[]): Promise<Row[]>;
    run(...params: SQLInputValue[]): Promise<{ changes: number }>;
  };
  batch(queries: Query[]): Promise<Result[]>;
}

export const dataDirectory = () => path.resolve(
  /* turbopackIgnore: true */ process.env.CMS_DATA_DIR || path.join(process.cwd(), "data"),
);
const schema = (remote: boolean) => [
  "CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY CHECK(id=1), body TEXT NOT NULL, revision INTEGER NOT NULL, updated_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS admin (id INTEGER PRIMARY KEY CHECK(id=1), username TEXT NOT NULL, password_hash TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires_at BIGINT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at BIGINT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS setup (id INTEGER PRIMARY KEY CHECK(id=1), token_hash TEXT NOT NULL, expires_at BIGINT NOT NULL)",
  `CREATE TABLE IF NOT EXISTS media (src TEXT PRIMARY KEY, name TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL, bytes ${remote ? "BYTEA" : "BLOB"} NOT NULL)`,
  "CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, name TEXT NOT NULL, company TEXT NOT NULL, password_hash TEXT NOT NULL, recovery_hash TEXT NOT NULL, auth_version INTEGER NOT NULL DEFAULT 1, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS customer_sessions (token_hash TEXT PRIMARY KEY, customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE, auth_version INTEGER NOT NULL, expires_at BIGINT NOT NULL)",
  "CREATE INDEX IF NOT EXISTS customer_sessions_owner ON customer_sessions(customer_id)",
];
const seed = (): Query => ({
  sql: "INSERT INTO content VALUES (1, ?, 1, ?) ON CONFLICT(id) DO NOTHING",
  params: [JSON.stringify(initialContent()), new Date().toISOString()],
});
const cached = globalThis as typeof globalThis & { cmsConnectionsV3?: Map<string, CmsDatabase> };

export function database(): CmsDatabase {
  const url = process.env.CMS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url && process.env.VERCEL)
    throw new Error("Vercel için CMS_DATABASE_URL veya DATABASE_URL ayarlanmalıdır.");
  const key = url || dataDirectory();
  cached.cmsConnectionsV3 ??= new Map();
  const existing = cached.cmsConnectionsV3.get(key);
  if (existing) return existing;
  let execute: (query: Query) => Promise<Result>;
  let batch: CmsDatabase["batch"];
  if (url) {
    const sql = neon(url, { fullResults: true, fetchOptions: { cache: "no-store" } });
    // Queries are application-owned SQL; values always remain bound parameters.
    const query = ({ sql: text, params = [] }: Query) => {
      let index = 0;
      return sql.query(text.replace(/\?/g, () => `$${++index}`), params);
    };
    execute = async (input) => {
      const result = await query(input);
      return { rows: result.rows, changes: result.rowCount ?? 0 };
    };
    batch = async (queries) => (await sql.transaction(queries.map(query))).map(
      (result) => ({ rows: result.rows, changes: result.rowCount ?? 0 }),
    );
  } else {
    const directory = dataDirectory();
    const publicDirectory = path.resolve(process.cwd(), "public").toLowerCase();
    if (directory.toLowerCase() === publicDirectory || directory.toLowerCase().startsWith(publicDirectory + path.sep))
      throw new Error("CMS_DATA_DIR public dizini içinde olamaz.");
    mkdirSync(directory, { recursive: true });
    const db = new DatabaseSync(path.join(directory, "cms.sqlite"), { timeout: 5000 });
    db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");
    schema(false).forEach((statement) => db.exec(statement));
    const initial = seed();
    db.prepare(initial.sql).run(...initial.params!);
    const local = ({ sql, params = [] }: Query): Result => {
      const statement = db.prepare(sql);
      const rows = statement.all(...params);
      return { rows, changes: Number(db.prepare("SELECT changes() AS n").get()!.n) };
    };
    execute = async (input) => local(input);
    batch = async (queries) => {
      db.exec("BEGIN IMMEDIATE");
      try {
        const result = queries.map(local);
        db.exec("COMMIT");
        return result;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    };
  }
  const adapter: CmsDatabase = {
    prepare: (sql) => ({
      get: async (...params) => (await execute({ sql, params })).rows[0],
      all: async (...params) => (await execute({ sql, params })).rows,
      run: async (...params) => ({ changes: (await execute({ sql, params })).changes }),
    }),
    batch,
  };
  cached.cmsConnectionsV3.set(key, adapter);
  return adapter;
}

// Run explicitly before a remote deployment; never run DDL on a public request.
export async function initializeDatabase() {
  const remote = !!(process.env.CMS_DATABASE_URL || process.env.DATABASE_URL);
  await database().batch([...schema(remote).map((sql) => ({ sql })), seed()]);
}
