import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { supportDefinitions, supportKeys } from "../../src/data/support";

test.use({ reducedMotion: "reduce" });
for (const width of [320, 1440]) {
  test(`Üst şerit, SSS ve bilgilendirme sayfaları — ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const shortcuts = page.getByRole("navigation", {
      name: "Hızlı bağlantılar",
    });
    await expect(
      shortcuts.getByRole("link", { name: "Blog", exact: true }),
    ).toHaveAttribute("href", "/blog");
    await expect(page.locator(".utility-whatsapp")).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\/905305482660\?/,
    );
    await expect(
      page.locator(
        '.utility-bar a[href^="tel:"], .utility-bar a[href^="mailto:"]',
      ),
    ).toHaveCount(0);
    await shortcuts.getByRole("link", { name: "SSS", exact: true }).click();
    await expect(page).toHaveURL(/\/sss$/);
    await expect(page.locator(".faq-item")).toHaveCount(8);
    const recovery = page
      .locator("details")
      .filter({ hasText: "Şifremi unuttum; hesabımı nasıl kurtarabilirim?" });
    await recovery.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(recovery).toHaveAttribute("open", "");
    await expect(recovery.locator(".support-prose")).toContainText(
      "kayıt sırasında gösterilir",
    );
    await page.keyboard.press("Enter");
    await expect(recovery).not.toHaveAttribute("open");
    for (const key of supportKeys) {
      const { path, label } = supportDefinitions[key];
      expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(
        page
          .getByRole("navigation", { name: "Bilgilendirme sayfaları" })
          .getByRole("link", { name: label, exact: true }),
      ).toHaveAttribute("aria-current", "page");
      await expect(
        page
          .locator(".site-footer")
          .getByRole("link", { name: label, exact: true }),
      ).toHaveAttribute("href", path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations,
        JSON.stringify(results.violations, null, 2),
      ).toEqual([]);
      if (key === "faq" || key === "cancellation")
        await page.screenshot({
          path: `artifacts/screenshots/support-${key}-${width}.png`,
          fullPage: true,
        });
    }
    await page.goto("/teklif-al");
    await expect(
      page
        .locator(".quote-support-links")
        .getByRole("link", { name: "İptal ve iade" }),
    ).toHaveAttribute("href", "/iptal-ve-iade");
  });
}
