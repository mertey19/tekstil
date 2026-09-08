import { randomBytes, createHash } from "node:crypto";
import { loadEnvConfig } from "@next/env";

async function main() {
  loadEnvConfig(process.cwd());
  const { database } = await import("../src/server/cms-store");
  const db = database();
  if (await db.prepare("SELECT id FROM admin WHERE id=1").get()) {
    console.log(
      "Yönetici hesabı zaten oluşturulmuş. /admin adresinden giriş yapabilirsiniz.",
    );
  } else {
    const token = randomBytes(32).toString("hex");
    await db.prepare("INSERT INTO setup VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET token_hash=excluded.token_hash, expires_at=excluded.expires_at").run(
      createHash("sha256").update(token).digest("hex"),
      Date.now() + 24 * 60 * 60 * 1000,
    );
    const origin =
      process.env.ADMIN_ORIGIN ||
      process.env.SITE_URL ||
      "http://127.0.0.1:3000";
    console.log(
      `Yönetici kurulum bağlantısı (24 saat geçerli, tek kullanımlık):\n${origin}/admin#setup=${token}\nBu bağlantıyı yalnızca yöneticiyle paylaşın.`,
    );
  }
}
void main();
