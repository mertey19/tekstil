import { test, expect } from "@playwright/test";

test("müşteri üyeliği adresleri yönetici girişine yönlenir", async ({ page }) => {
  for (const path of ["/giris", "/uye-ol", "/sifremi-unuttum", "/hesabim"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.locator(".admin-login, .admin-shell")).toBeVisible();
  }
  expect((await page.request.get("/api/uyelik/session")).status()).toBe(410);
});
