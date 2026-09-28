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
  "CREATE TABLE IF NOT EXISTS admin_users (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('owner','editor')), active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS admin_user_sessions (token_hash TEXT PRIMARY KEY, admin_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE, expires_at BIGINT NOT NULL)",
  "CREATE INDEX IF NOT EXISTS admin_user_sessions_owner ON admin_user_sessions(admin_id)",
  "INSERT INTO admin_users (id, username, password_hash, role, active, created_at) SELECT 'owner', username, password_hash, 'owner', 1, CURRENT_TIMESTAMP FROM admin WHERE id=1 ON CONFLICT(id) DO NOTHING",
  "CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at BIGINT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS setup (id INTEGER PRIMARY KEY CHECK(id=1), token_hash TEXT NOT NULL, expires_at BIGINT NOT NULL)",
  `CREATE TABLE IF NOT EXISTS media (src TEXT PRIMARY KEY, name TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL, bytes ${remote ? "BYTEA" : "BLOB"} NOT NULL)`,
  "CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, name TEXT NOT NULL, company TEXT NOT NULL, password_hash TEXT NOT NULL, recovery_hash TEXT NOT NULL, auth_version INTEGER NOT NULL DEFAULT 1, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS customer_sessions (token_hash TEXT PRIMARY KEY, customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE, auth_version INTEGER NOT NULL, expires_at BIGINT NOT NULL)",
  "CREATE INDEX IF NOT EXISTS customer_sessions_owner ON customer_sessions(customer_id)",
  "CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, order_number TEXT NOT NULL UNIQUE, public_token_hash TEXT NOT NULL UNIQUE, status TEXT NOT NULL, payment_status TEXT NOT NULL, payment_provider TEXT NOT NULL, payment_reference TEXT NOT NULL, subtotal_cents INTEGER NOT NULL, shipping_cents INTEGER NOT NULL, total_cents INTEGER NOT NULL, currency TEXT NOT NULL, customer_name TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, district TEXT NOT NULL, city TEXT NOT NULL, postal_code TEXT NOT NULL, invoice_type TEXT NOT NULL, company TEXT NOT NULL, tax_office TEXT NOT NULL, tax_number TEXT NOT NULL, notes TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS order_items (order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, product_id TEXT NOT NULL, slug TEXT NOT NULL, name TEXT NOT NULL, sku TEXT NOT NULL, image TEXT NOT NULL, unit_price_cents INTEGER NOT NULL, vat_rate INTEGER NOT NULL, quantity INTEGER NOT NULL, line_total_cents INTEGER NOT NULL, PRIMARY KEY(order_id, product_id))",
  "CREATE TABLE IF NOT EXISTS order_consents (order_id TEXT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE, accepted_at TEXT NOT NULL, document_version TEXT NOT NULL, document_snapshot TEXT NOT NULL)",
  "CREATE INDEX IF NOT EXISTS orders_created_at ON orders(created_at)",
  "CREATE INDEX IF NOT EXISTS orders_phone ON orders(phone)",
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
