import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync } from "node:fs";
import path from "node:path";
import {
  registerCustomer,
  loginCustomer,
  customerFromToken,
  changeCustomerPassword,
  recoverCustomer,
  deleteCustomer,
  updateCustomerProfile,
  createCustomerSession,
} from "../../src/server/customer-auth";
import { adminFromToken } from "../../src/server/admin-auth";
import { database } from "../../src/server/cms-store";
import { customerReturnPath } from "../../src/lib/customer-model";

test("Müşteri hesapları ve oturumları ayrıdır; şifre ve tek kullanımlık kurtarma kodu eski oturumları iptal eder", async () => {
  const previous = {
    directory: process.env.CMS_DATA_DIR,
    database: process.env.DATABASE_URL,
    cms: process.env.CMS_DATABASE_URL,
    vercel: process.env.VERCEL,
  };
  mkdirSync("artifacts/customer-unit", { recursive: true });
  process.env.CMS_DATA_DIR = mkdtempSync(
    path.join(process.cwd(), "artifacts/customer-unit/run-"),
  );
  delete process.env.DATABASE_URL;
  delete process.env.CMS_DATABASE_URL;
  delete process.env.VERCEL;
  try {
    const first = await registerCustomer({
      username: "customer-a",
      name: "Müşteri A",
      company: "Firma A",
      password: "First-password-123!",
    });
    const second = await registerCustomer({
      username: "customer-b",
      name: "Müşteri B",
      company: "",
      password: "Second-password-123!",
    });
    const a = (await customerFromToken(first.token))!,
      b = (await customerFromToken(second.token))!;
    assert.notEqual(a.id, b.id);
    assert.equal(await adminFromToken(first.token), null);
    await assert.rejects(
      () =>
        registerCustomer({
          username: "CUSTOMER-A",
          name: "Çakışan",
          password: "First-password-123!",
        }),
      /kullanılıyor/,
    );
    await updateCustomerProfile(a.id, {
      name: "Yeni İsim",
      company: "Yeni Firma",
    });
    assert.equal((await customerFromToken(first.token))!.company, "Yeni Firma");
    assert.equal((await customerFromToken(second.token))!.name, "Müşteri B");
    const recovery = await changeCustomerPassword(
      a.id,
      "First-password-123!",
      "Changed-password-123!",
    );
    assert.equal(await customerFromToken(first.token), null);
    await assert.rejects(() => createCustomerSession(a.id, 1), /değişti/);
    await assert.rejects(
      () => loginCustomer("customer-a", "First-password-123!"),
      /hatalı/,
    );
    const session = await loginCustomer("customer-a", "Changed-password-123!");
    await assert.rejects(
      () =>
        recoverCustomer(
          "customer-a",
          first.recoveryCode,
          "Recovery-password-123!",
        ),
      /geçersiz/,
    );
    const attempts = await Promise.allSettled([
      recoverCustomer("customer-a", recovery, "Recovery-password-123!"),
      recoverCustomer("customer-a", recovery, "Recovery-password-123!"),
    ]);
    assert.equal(attempts.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(await customerFromToken(session), null);
    await deleteCustomer(a.id, "Recovery-password-123!");
    assert.equal(
      Number(
        (await database()
          .prepare(
            "SELECT count(*) AS n FROM customer_sessions WHERE customer_id=?",
          )
          .get(a.id))!.n,
      ),
      0,
    );
    assert.ok(await customerFromToken(second.token));
  } finally {
    for (const [key, value] of Object.entries({
      CMS_DATA_DIR: previous.directory,
      DATABASE_URL: previous.database,
      CMS_DATABASE_URL: previous.cms,
      VERCEL: previous.vercel,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
test("Üyelik yönlendirmesi dış adresleri ve protokol atlamalarını reddeder", () => {
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/giris?devam=loop",
    undefined,
  ])
    assert.equal(customerReturnPath(value), "/hesabim");
  assert.equal(customerReturnPath("/urun/cam-bezi"), "/urun/cam-bezi");
  assert.equal(
    customerReturnPath("/teklif-al?urun=cam-bezi"),
    "/teklif-al?urun=cam-bezi",
  );
});
