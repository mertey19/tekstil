import fs from "node:fs/promises";
import lighthouse from "lighthouse";
import { chromium } from "@playwright/test";

const baseUrl = process.env.PERF_URL || "http://127.0.0.1:3002";
await fs.mkdir("artifacts/lighthouse", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: [
    "--remote-debugging-port=9223",
    "--remote-debugging-address=127.0.0.1",
  ],
});
try {
  for (const [path, name] of [
    ["/", "home"],
    ["/kategori/arac-temizlik-bezleri", "category"],
    ["/urun/arac-bakim-bezi", "product"],
  ]) {
    const result = await lighthouse(`${baseUrl}${path}`, {
      port: 9223,
      output: ["html", "json"],
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    });
    if (!result) throw new Error("Lighthouse returned no result");
    await fs.writeFile(`artifacts/lighthouse/${name}.html`, result.report[0]);
    await fs.writeFile(`artifacts/lighthouse/${name}.json`, result.report[1]);
    console.log(
      JSON.stringify({
        page: path,
        scores: Object.fromEntries(
          Object.entries(result.lhr.categories).map(([key, category]) => [
            key,
            Math.round((category.score ?? 0) * 100),
          ]),
        ),
        metrics: {
          fcp: result.lhr.audits["first-contentful-paint"].displayValue,
          lcp: result.lhr.audits["largest-contentful-paint"].displayValue,
          cls: result.lhr.audits["cumulative-layout-shift"].displayValue,
          tbt: result.lhr.audits["total-blocking-time"].displayValue,
        },
      }),
    );
  }
} finally {
  await browser.close();
}
