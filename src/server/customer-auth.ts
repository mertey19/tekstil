import { randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { CmsError, database } from "./cms-store";
import {
  hashPassword,
  verifyPassword,
  tokenHash,
  limitAttempt,
} from "./admin-auth";
import {
  customerRegistration,
  customerProfile,
  type Customer,
} from "@/lib/customer-model";

export const customerCookie = "tekstil_customer";
export const customerLifetime = 7 * 24 * 60 * 60;
const invalidCredentials = () =>
  new CmsError("Kullanıcı adı veya şifre hatalı.", 401);
const toCustomer = (row: Record<string, unknown>): Customer => ({
  id: String(row.id),
  username: String(row.username),
  name: String(row.name),
  company: String(row.company),
  createdAt: String(row.created_at),
});

export async function customerFromToken(token: string | undefined) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const row = await database()
    .prepare(
      "SELECT c.id, c.username, c.name, c.company, c.created_at FROM customer_sessions s JOIN customers c ON c.id=s.customer_id WHERE s.token_hash=? AND s.expires_at>? AND s.auth_version=c.auth_version AND c.active=1",
    )
    .get(tokenHash(token), Date.now());
  return row ? toCustomer(row) : null;
}
export const currentCustomer = cache(async () =>
  customerFromToken((await cookies()).get(customerCookie)?.value),
);
export async function requireCustomer() {
  const customer = await currentCustomer();
  if (!customer)
    throw new CmsError("Devam etmek için müşteri hesabınıza giriş yapın.", 401);
  return customer;
}
export async function createCustomerSession(id: string, version: number) {
  const token = randomBytes(32).toString("hex");
  const created = await database()
    .prepare(
      "INSERT INTO customer_sessions (token_hash, customer_id, auth_version, expires_at) SELECT ?, id, auth_version, ? FROM customers WHERE id=? AND auth_version=? AND active=1 RETURNING customer_id",
    )
    .get(tokenHash(token), Date.now() + customerLifetime * 1000, id, version);
  if (!created)
    throw new CmsError("Hesap bilgileriniz değişti. Yeniden giriş yapın.", 401);
  await database()
    .prepare(
      "DELETE FROM customer_sessions WHERE customer_id=? AND expires_at<=?",
    )
    .run(id, Date.now());
  return token;
}
export async function registerCustomer(input: unknown) {
  const data = customerRegistration.parse(input);
  if (data.website) throw new CmsError("Kayıt tamamlanamadı.");
  const id = randomUUID(),
    recoveryCode = randomBytes(24).toString("hex");
  const hash = await hashPassword(data.password);
  const row = await database()
    .prepare(
      "INSERT INTO customers (id, username, name, company, password_hash, recovery_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(username) DO NOTHING RETURNING id",
    )
    .get(
      id,
      data.username,
      data.name,
      data.company,
      hash,
      tokenHash(recoveryCode),
      new Date().toISOString(),
    );
  if (!row)
    throw new CmsError(
      "Bu kullanıcı adı kullanılıyor. Başka bir kullanıcı adı seçin.",
      409,
    );
  return { token: await createCustomerSession(id, 1), recoveryCode };
}
export async function loginCustomer(username: string, password: string) {
  await limitAttempt(`customer:login:${tokenHash(username)}`, 10);
  const row = await database()
    .prepare(
      "SELECT id, password_hash, auth_version, active FROM customers WHERE username=?",
    )
    .get(username);
  const matches = await verifyPassword(
    password,
    row ? String(row.password_hash) : `${"0".repeat(32)}:${"0".repeat(128)}`,
  );
  if (!row || Number(row.active) !== 1 || !matches) throw invalidCredentials();
  await database()
    .prepare("DELETE FROM attempts WHERE key=?")
    .run(`customer:login:${tokenHash(username)}`);
  return createCustomerSession(String(row.id), Number(row.auth_version));
}
export async function updateCustomerProfile(id: string, input: unknown) {
  const data = customerProfile.strict().parse(input);
  await database()
    .prepare("UPDATE customers SET name=?, company=? WHERE id=? AND active=1")
    .run(data.name, data.company, id);
}
export async function changeCustomerPassword(
  id: string,
  current: string,
  password: string,
) {
  await limitAttempt(`customer:password:${id}`, 8);
  const row = await database()
    .prepare(
      "SELECT password_hash, auth_version FROM customers WHERE id=? AND active=1",
    )
    .get(id);
  if (!row || !(await verifyPassword(current, String(row.password_hash))))
    throw new CmsError("Mevcut şifre hatalı.", 400);
  const recoveryCode = randomBytes(24).toString("hex");
  const updated = await database()
    .prepare(
      "UPDATE customers SET password_hash=?, recovery_hash=?, auth_version=auth_version+1 WHERE id=? AND auth_version=? AND active=1 RETURNING id",
    )
    .get(
      await hashPassword(password),
      tokenHash(recoveryCode),
      id,
      Number(row.auth_version),
    );
  if (!updated)
    throw new CmsError("Hesap bilgileri değişti. Yeniden giriş yapın.", 409);
  await database()
    .prepare(
      "DELETE FROM customer_sessions WHERE customer_id=? AND auth_version<=?",
    )
    .run(id, Number(row.auth_version));
  return recoveryCode;
}
export async function recoverCustomer(
  username: string,
  code: string,
  password: string,
) {
  await limitAttempt(`customer:recovery:${tokenHash(username)}`, 8);
  const row = await database()
    .prepare(
      "SELECT id, auth_version FROM customers WHERE username=? AND recovery_hash=? AND active=1",
    )
    .get(username, tokenHash(code));
  if (!row)
    throw new CmsError("Kullanıcı adı veya kurtarma kodu geçersiz.", 400);
  const recoveryCode = randomBytes(24).toString("hex");
  const updated = await database()
    .prepare(
      "UPDATE customers SET password_hash=?, recovery_hash=?, auth_version=auth_version+1 WHERE id=? AND recovery_hash=? AND auth_version=? AND active=1 RETURNING id",
    )
    .get(
      await hashPassword(password),
      tokenHash(recoveryCode),
      String(row.id),
      tokenHash(code),
      Number(row.auth_version),
    );
  if (!updated) throw new CmsError("Kurtarma kodu artık geçerli değil.", 409);
  await database()
    .prepare(
      "DELETE FROM customer_sessions WHERE customer_id=? AND auth_version<=?",
    )
    .run(String(row.id), Number(row.auth_version));
  return recoveryCode;
}
export async function deleteCustomer(id: string, password: string) {
  await limitAttempt(`customer:delete:${id}`, 5);
  const row = await database()
    .prepare(
      "SELECT password_hash, auth_version FROM customers WHERE id=? AND active=1",
    )
    .get(id);
  if (!row || !(await verifyPassword(password, String(row.password_hash))))
    throw new CmsError("Şifre hatalı.");
  const deleted = await database()
    .prepare("DELETE FROM customers WHERE id=? AND auth_version=? RETURNING id")
    .get(id, Number(row.auth_version));
  if (!deleted)
    throw new CmsError("Hesap bilgileri değişti. Yeniden giriş yapın.", 409);
}
