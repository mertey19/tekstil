import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ reducedMotion: "reduce" });

for (const width of [390, 1440]) {
  test(`Blog keşfi, üç yazı ve okuma akışı — ${width}px`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(page.locator(".home-blog .blog-card")).toHaveCount(3);
    if (width < 850) {
      await page.getByRole("button", { name: "Menüyü aç" }).click();
      await page.getByRole("navigation", { name: "Mobil menü" }).getByRole("link", { name: "Blog", exact: true }).click();
      await expect(page.getByRole("button", { name: "Menüyü aç" })).toHaveAttribute("aria-expanded", "false");
    } else {
      await page.getByRole("navigation", { name: "Ana menü", exact: true }).getByRole("link", { name: "Blog", exact: true }).click();
    }
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.locator(".blog-card")).toHaveCount(3);
    await expect(page.locator("h1")).toHaveCount(1);
    const links = await page.locator(".blog-card h3 a").evaluateAll((items) => items.map((item) => ({
      href: item.getAttribute("href")!, title: item.textContent!,
    })));
    expect(new Set(links.map((item) => item.href)).size).toBe(3);
    await expect(page.locator(".site-footer").getByRole("link", { name: "Blog", exact: true })).toHaveAttribute("href", "/blog");
    await page.screenshot({ path: `artifacts/screenshots/blog-${width}.png`, fullPage: true });

    for (const [index, link] of links.entries()) {
      await page.locator(".blog-card h3 a").filter({ hasText: link.title }).click();
      await expect(page).toHaveURL(new RegExp(`${link.href}$`));
      await expect(page.locator("h1")).toHaveText(link.title);
      await expect(page).toHaveTitle(`${link.title} | Mikrofiber Deposu`);
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator(".blog-prose > section")).toHaveCount(4);
      expect((await page.locator(".blog-prose").innerText()).length).toBeGreaterThan(1500);
      await expect(page.locator(".blog-related .blog-card")).toHaveCount(2);
      await expect(page.getByRole("link", { name: "WhatsApp sohbetini aç (yeni sekmede)" })).toHaveAttribute("href", /^https:\/\/wa\.me\/905305482660\?/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const anchor of await page.locator(".blog-contents ol a").all()) {
        const hash = await anchor.getAttribute("href");
        await anchor.click();
        await expect(page.locator(hash!)).toBeInViewport();
      }
      if (index === 0) {
        await page.screenshot({ path: `artifacts/screenshots/blog-article-${width}.png`, fullPage: true });
      }
      await page.getByRole("navigation", { name: "Gezinme yolu" }).getByRole("link", { name: "Blog", exact: true }).click();
      await expect(page).toHaveURL(/\/blog$/);
    }
    expect((await request.get("/blog/olmayan-yazi")).status()).toBe(404);
  });
}

test("Blog listesi ve yazılar erişilebilir", async ({ page }) => {
  await page.goto("/blog");
  const paths = await page.locator(".blog-card h3 a").evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
  for (const path of ["/blog", ...paths]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  }
});
