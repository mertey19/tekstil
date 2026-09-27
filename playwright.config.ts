import { defineConfig } from "@playwright/test";
import path from "node:path";
process.env.CMS_TEST_DIR ||= path.join(
  process.cwd(),
  "artifacts",
  `cms-e2e-${Date.now()}`,
);
const testOrigin = "http://127.0.0.1:3101";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: testOrigin,
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3101",
    url: testOrigin,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      CMS_DATABASE_URL: "",
      DATABASE_URL: "",
      VERCEL: "",
      CMS_DATA_DIR: process.env.CMS_TEST_DIR,
      SITE_MODE: "demo",
      SITE_PREVIEW: "true",
      SITE_URL: "",
      ADMIN_ORIGIN: testOrigin,
      SITE_WHATSAPP: "+905305482660",
      PAYMENT_PROVIDER: "mock",
      PAYMENT_TEST_MODE: "true",
    },
  },
});
