import { loadEnvConfig } from "@next/env";

async function main() {
  loadEnvConfig(process.cwd());
  const { initializeDatabase } = await import("../src/server/cms-database");
  await initializeDatabase();
  console.log("CMS tabloları ve başlangıç içeriği hazır. Mevcut içerik korundu.");
}
void main();
