import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
async function main() {
  const { getSiteConfig, getProducts, getAllCategories } = await import(
    "../src/lib/content"
  );
  const siteConfig = (await getSiteConfig()),
    products = (await getProducts()),
    categories = (await getAllCategories());
  const { releaseIssues } = await import("../src/lib/release");
  const issues = releaseIssues(siteConfig, products, categories, process.env);
  if (issues.length) {
    console.error(
      "YAYIN ENGELLENDİ — yerel build başarılı olsa bile canlıya hazır değil:\n" +
        issues.map((issue) => `- ${issue}`).join("\n"),
    );
    process.exitCode = 1;
  } else
    console.log(
      "İçerik ve yapılandırma yayın kontrolü başarılı. DNS, sağlayıcı ve proxy doğrulamasını dağıtım ortamında ayrıca tamamlayın.",
    );
}
void main();
