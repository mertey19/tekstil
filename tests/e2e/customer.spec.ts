import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { DatabaseSync } from "node:sqlite";
import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
const headers = { origin: "http://127.0.0.1:3001", "x-customer-request": "1" };
const account = {
  username: "browser-customer",
  password: "Customer-password-123!",
  name: "Mert Müşteri",
  company: "Örnek Tekstil",
};
let recoveryCode = "";
test.describe.configure({ mode: "serial" });
async function login(page: Page, password = account.password) {
  await page.goto("/giris");
  await page
    .getByLabel("Kullanıcı adı", { exact: true })
    .fill(account.username);
  await page.getByLabel("Şifre", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await expect(page).toHaveURL(/\/hesabim$/);
}

test("Üyelik kaydı, kurtarma kodu ve müşteriye özel oturum", async ({
  page,
  request,
}) => {
  await page.goto("/hesabim");
  await expect(page).toHaveURL(/\/giris/);
  await page.goto("/uye-ol");
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
  await page.getByLabel("Ad soyad", { exact: true }).fill(account.name);
  await page.getByLabel("Firma adı").fill(account.company);
  await page
    .getByLabel("Kullanıcı adı", { exact: true })
    .fill(account.username);
  await page.getByLabel("Şifre", { exact: true }).fill(account.password);
  await page.getByLabel("Şifre tekrar", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Üye ol", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Kurtarma kodunuzu saklayın." }),
  ).toBeVisible();
  recoveryCode = (await page.locator(".recovery-box code").textContent())!;
  expect(recoveryCode).toMatch(/^[a-f0-9]{48}$/);
  await page.getByRole("link", { name: "Hesabıma devam et" }).click();
  await expect(
    page.getByRole("heading", { name: `Merhaba, ${account.name}.` }),
  ).toBeVisible();
  const cookie = (await page.context().cookies()).find(
    (c) => c.name === "tekstil_customer",
  )!;
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe("Strict");
  expect((await page.request.get("/api/admin/content")).status()).toBe(401);
  expect((await request.get("/api/uyelik/session")).status()).toBe(200);
  expect(
    (await (await request.get("/api/uyelik/session")).json()).customer,
  ).toBeNull();
  expect(
    (
      await page.request.post("/api/uyelik/register", {
        headers,
        data: account,
      })
    ).status(),
  ).toBe(409);
});
test("Profil kalıcıdır; teklif formu üyeden doldurulur", async ({ page }) => {
  await login(page);
  await page.getByLabel("Ad soyad", { exact: true }).fill("Mert Güncel");
  await page.getByRole("button", { name: "Bilgilerimi kaydet" }).click();
  await expect(page.getByRole("status")).toContainText("kaydedildi");
  await page.reload();
  await expect(page.getByLabel("Ad soyad", { exact: true })).toHaveValue(
    "Mert Güncel",
  );
  await page.goto("/teklif-al?urun=cam-bezi");
  await expect(page.getByLabel("Ad soyad")).toHaveValue("Mert Güncel");
  await expect(page.getByLabel("Firma adı")).toHaveValue(account.company);
});
test("Müşteriler birbirinin profiline ve yönetici işlemlerine erişemez", async ({
  page,
  request,
}) => {
  await login(page);
  const own = (await (await page.request.get("/api/uyelik/session")).json())
    .customer;
  const other = {
    ...account,
    username: "browser-other",
    name: "Başka Müşteri",
  };
  expect(
    (
      await request.post("/api/uyelik/register", { headers, data: other })
    ).status(),
  ).toBe(201);
  expect(
    (
      await request.patch("/api/uyelik/profile", {
        headers,
        data: { id: own.id, name: "Değiştir", company: "" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await page.request.patch("/api/uyelik/profile", {
        headers: { ...headers, origin: "https://wrong.example" },
        data: { name: "Değiştir", company: "" },
      })
    ).status(),
  ).toBe(403);
  expect((await request.get("/api/admin/customers")).status()).toBe(401);
  expect(
    (await (await request.get("/api/uyelik/session")).json()).customer.name,
  ).toBe("Başka Müşteri");
  expect(
    (await (await page.request.get("/api/uyelik/session")).json()).customer
      .name,
  ).toBe("Mert Güncel");
});
test("Şifre kurtarma kodu bir kez kullanılır ve eski oturum kapanır", async ({
  page,
  request,
}) => {
  await login(page);
  const changed = "Recovered-password-123!";
  const response = await request.post("/api/uyelik/recover", {
    headers,
    data: { username: account.username, password: changed, code: recoveryCode },
  });
  expect(response.status()).toBe(200);
  expect(
    (await (await page.request.get("/api/uyelik/session")).json()).customer,
  ).toBeNull();
  expect(
    (await (await request.get("/api/uyelik/session")).json()).customer,
  ).toBeNull();
  expect(
    (
      await request.post("/api/uyelik/recover", {
        headers,
        data: {
          username: account.username,
          password: changed,
          code: recoveryCode,
        },
      })
    ).status(),
  ).toBe(400);
  account.password = changed;
  await login(page);
  await page.getByRole("button", { name: "Çıkış yap", exact: true }).click();
  await expect(page).toHaveURL(/\/giris$/);
});
test("Üyelik ve hesap ekranları mobilde taşmaz; erişilebilirlik kontrolü", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/giris");
    await expect(
      page.getByRole("heading", { name: "Tekrar hoş geldiniz." }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `artifacts/screenshots/customer-login-${width}.png`,
      fullPage: true,
    });
  }
  await page.goto("/uye-ol");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/screenshots/customer-account-390.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
test("Yönetici üyeleri görür ve duraklatma tüm müşteri oturumlarını kapatır", async ({
  page,
  browser,
}) => {
  await login(page);
  const token = randomBytes(32).toString("hex");
  const db = new DatabaseSync(
    path.join(process.env.CMS_TEST_DIR!, "cms.sqlite"),
  );
  // Isolated test database: create an admin session without changing existing credentials.
  db.prepare(
    "INSERT OR IGNORE INTO admin (id,username,password_hash) VALUES (1,?,?)",
  ).run("moderation-admin", "unused-test-fixture");
  db.prepare("INSERT INTO sessions VALUES (?,?)").run(
    createHash("sha256").update(token).digest("hex"),
    Date.now() + 60_000,
  );
  db.close();
  const admin = await browser.newContext();
  try {
    await admin.addCookies([
      {
        name: "tekstil_admin",
        value: token,
        url: "http://127.0.0.1:3001",
        httpOnly: true,
        sameSite: "Strict",
      },
    ]);
    const panel = await admin.newPage();
    await panel.goto("/admin");
    await panel
      .getByRole("button", { name: "Müşteri üyelikleri", exact: true })
      .click();
    await panel.getByLabel("Müşteri ara").fill(account.username);
    await panel.getByRole("button", { name: "Ara", exact: true }).click();
    await expect(
      panel.getByRole("heading", { name: "Mert Güncel", exact: true }),
    ).toBeVisible();
    await expect(panel.locator("form form")).toHaveCount(0);
    await panel.setViewportSize({ width: 390, height: 844 });
    expect(
      await panel.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page: panel })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await panel
      .getByRole("button", {
        name: `${account.username} — Üyeliği duraklat`,
        exact: true,
      })
      .click();
    await expect(
      panel.getByRole("button", {
        name: `${account.username} — Üyeliği etkinleştir`,
        exact: true,
      }),
    ).toBeVisible();
    expect(
      (await (await page.request.get("/api/uyelik/session")).json()).customer,
    ).toBeNull();
    expect(
      (
        await page.request.post("/api/uyelik/login", {
          headers,
          data: { username: account.username, password: account.password },
        })
      ).status(),
    ).toBe(401);
    await panel
      .getByRole("button", {
        name: `${account.username} — Üyeliği etkinleştir`,
        exact: true,
      })
      .click();
    await expect(
      panel.getByRole("button", {
        name: `${account.username} — Üyeliği duraklat`,
        exact: true,
      }),
    ).toBeVisible();
    expect(
      (await (await page.request.get("/api/uyelik/session")).json()).customer,
    ).toBeNull();
    await login(page);
  } finally {
    await admin.close();
  }
});

test("Üye hesabını silince profil ve oturum kaldırılır", async ({ page }) => {
  await login(page);
  await page.goto("/hesabim");
  await page.getByText("Hesabımı sil", { exact: true }).click();
  await page.getByLabel("Silmek için şifreniz").fill(account.password);
  await page.getByLabel("Hesabımı silmek istiyorum.").check();
  await page
    .getByRole("button", { name: "Hesabımı kalıcı olarak sil" })
    .click();
  await expect(page).toHaveURL(/\/giris\?silindi=1/);
  expect(
    (await (await page.request.get("/api/uyelik/session")).json()).customer,
  ).toBeNull();
});
