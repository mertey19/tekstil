import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { CmsError, database } from "./cms-store";

export const sessionCookie = "tekstil_admin";
export const sessionLifetime = 12 * 60 * 60;
export const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(50)
    .regex(
      /^[a-z0-9._-]+$/,
      "Kullanıcı adı küçük harf, rakam, nokta, tire içerebilir.",
    ),
  password: z.string().min(12, "Şifreniz en az 12 karakter olmalı.").max(128),
});
export const tokenHash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const derive = (password: string, salt: string) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(
      password,
      salt,
      64,
      { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    ),
  );
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt);
  return `${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, saved: string) {
  const [salt, hex] = saved.split(":");
  const key = await derive(password, salt);
  const expected = Buffer.from(hex, "hex");
  return key.length === expected.length && timingSafeEqual(key, expected);
}
export const isConfigured = async () =>
  !!(await database().prepare("SELECT id FROM admin WHERE id=1").get());
export async function adminFromToken(token: string | undefined) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const row = await database()
    .prepare(
      "SELECT admin.username FROM sessions CROSS JOIN admin WHERE sessions.token_hash=? AND sessions.expires_at>? AND admin.id=1",
    )
    .get(tokenHash(token), Date.now());
  return row ? { username: String(row.username) } : null;
}
export async function currentAdmin() {
  return adminFromToken((await cookies()).get(sessionCookie)?.value);
}
export async function requireAdmin() {
  const admin = await currentAdmin();
  if (!admin)
    throw new CmsError(
      "Oturumunuz sona erdi. Çalışmanızı korumak için yeni bir sekmede /admin sayfasına giriş yapıp tekrar deneyin.",
      401,
    );
  return admin;
}
export async function limitAttempt(key: string, maximum: number, minutes = 15) {
  const db = database();
  const now = Date.now();
  const row = (await db.prepare(
    "INSERT INTO attempts VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN attempts.reset_at<=? THEN 1 ELSE attempts.count+1 END, reset_at=CASE WHEN attempts.reset_at<=? THEN excluded.reset_at ELSE attempts.reset_at END RETURNING count",
  ).get(key, now + minutes * 60_000, now, now))!;
  if (Number(row.count) > maximum)
    throw new CmsError(
      `Çok fazla deneme yapıldı. ${minutes} dakika sonra tekrar deneyin.`,
      429,
    );
}
export function assertSameOrigin(request: Request) {
  let origin: URL;
  try {
    origin = new URL(request.headers.get("origin") || "");
  } catch {
    throw new CmsError("İstek kaynağı doğrulanamadı.", 403);
  }
  const configured = process.env.ADMIN_ORIGIN || process.env.SITE_URL;
  const local =
    ["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname) &&
    origin.protocol === "http:" &&
    origin.host === request.headers.get("host");
  const trusted = configured
    ? origin.origin === new URL(configured).origin
    : local;
  if (
    !trusted ||
    (!local && origin.protocol !== "https:") ||
    request.headers.get("x-cms-request") !== "1" ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new CmsError(
      "Bu kaynaktan işlem yapılamaz. Paneli sitenin kendi adresinden açın.",
      403,
    );
  return origin.protocol === "https:";
}
export async function createSession() {
  const token = randomBytes(32).toString("hex");
  const db = database();
  await db.batch([
    { sql: "DELETE FROM sessions WHERE expires_at<=?", params: [Date.now()] },
    { sql: "INSERT INTO sessions VALUES (?, ?)", params: [tokenHash(token), Date.now() + sessionLifetime * 1000] },
  ]);
  return token;
}
export async function login(username: string, password: string) {
  await limitAttempt("login:global", 100);
  await limitAttempt(`login:${username}`, 8);
  const saved = await database()
    .prepare("SELECT username, password_hash FROM admin WHERE id=1")
    .get();
  // Match the password cost even when the username does not exist.
  const dummy = `${"0".repeat(32)}:${"0".repeat(128)}`;
  const matches = await verifyPassword(
    password,
    saved ? String(saved.password_hash) : dummy,
  );
  if (!saved || saved.username !== username || !matches)
    throw new CmsError("Kullanıcı adı veya şifre hatalı.", 401);
  await database()
    .prepare("DELETE FROM attempts WHERE key=?")
    .run(`login:${username}`);
}
export async function setupAdmin(
  username: string,
  password: string,
  token: string,
) {
  await limitAttempt("setup", 10);
  if (await isConfigured())
    throw new CmsError("Yönetici hesabı zaten oluşturulmuş.", 409);
  const hash = tokenHash(token);
  const valid = await database()
    .prepare(
      "SELECT id FROM setup WHERE id=1 AND token_hash=? AND expires_at>?",
    )
    .get(hash, Date.now());
  if (!valid)
    throw new CmsError(
      "Kurulum anahtarı geçersiz veya süresi dolmuş. Sunucuda npm run admin:setup komutuyla yeni bir anahtar oluşturun.",
      403,
    );
  const passwordHash = await hashPassword(password);
  const db = database();
  // The single conditional INSERT resolves concurrent setup requests atomically.
  const created = await db.prepare(
    "INSERT INTO admin (id, username, password_hash) SELECT 1, ?, ? FROM setup WHERE id=1 AND token_hash=? AND expires_at>? ON CONFLICT(id) DO NOTHING RETURNING id",
  ).get(username, passwordHash, hash, Date.now());
  if (!created) throw new CmsError("Kurulum anahtarı artık geçerli değil.", 409);
  await db.prepare("DELETE FROM setup WHERE token_hash=?").run(hash);
}
