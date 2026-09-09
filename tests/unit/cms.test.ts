import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { initialContent } from "../../src/server/cms-seed";
import { contentSchema } from "../../src/lib/cms-model";
import { database, readContent, saveContent } from "../../src/server/cms-store";
import { setupAdmin, tokenHash, limitAttempt } from "../../src/server/admin-auth";
import { randomBytes } from "node:crypto";

test("CMS kayıtları ve görseller yeni Node sürecinde kalıcıdır; eski revizyon kaydı ezemez", async () => {
  const base = path.join(process.cwd(), "artifacts", "unit-cms");
  mkdirSync(base, { recursive: true });
  const previous = process.env.CMS_DATA_DIR;
  const remote = process.env.CMS_DATABASE_URL, remoteDefault = process.env.DATABASE_URL;
  delete process.env.CMS_DATABASE_URL; delete process.env.DATABASE_URL;
  process.env.CMS_DATA_DIR = mkdtempSync(path.join(base, "run-"));
  try {
    const first = await readContent();
    first.content.settings.name = "Kalıcı içerik testi";
    first.content.settings.support.order.title = "Kalıcı sipariş bilgisi";
    const saved = await saveContent(first.content, first.revision);
    await database()
      .prepare("INSERT INTO media VALUES (?, ?, 1, 1, 3, ?, ?)")
      .run(
        "/images/uploads/test.webp",
        "Test dosyası",
        new Date().toISOString(),
        Buffer.from([1, 2, 3]),
      );
    const result = execFileSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "-e",
        "const {readContent,database}=require('./src/server/cms-store.ts'); (async()=>{const c=await readContent(); console.log(JSON.stringify({name:c.content.settings.name,support:c.content.settings.support.order.title,revision:c.revision,media:Number((await database().prepare('SELECT count(*) AS n FROM media').get()).n)}));})();",
      ],
      { cwd: process.cwd(), env: process.env, encoding: "utf8" },
    );
    assert.deepEqual(JSON.parse(result), {
      name: "Kalıcı içerik testi",
      support: "Kalıcı sipariş bilgisi",
      revision: saved.revision,
      media: 1,
    });
    await assert.rejects(
      () => saveContent(first.content, first.revision),
      /başka bir sekmede/,
    );
    const token = randomBytes(32).toString("hex");
    await database().prepare("INSERT INTO setup VALUES (1, ?, ?)").run(tokenHash(token), Date.now() + 60_000);
    const setup = await Promise.allSettled([
      setupAdmin("first", "Test-password-only-123!", token),
      setupAdmin("second", "Test-password-only-123!", token),
    ]);
    assert.equal(setup.filter((item) => item.status === "fulfilled").length, 1);
    assert.equal(Number((await database().prepare("SELECT count(*) AS n FROM admin").get())!.n), 1);
    const attempts = await Promise.allSettled(Array.from({ length: 12 }, () => limitAttempt("parallel-test", 5)));
    assert.equal(attempts.filter((item) => item.status === "fulfilled").length, 5);
  } finally {
    if (remote !== undefined) process.env.CMS_DATABASE_URL = remote;
    if (remoteDefault !== undefined) process.env.DATABASE_URL = remoteDefault;
    if (previous === undefined) delete process.env.CMS_DATA_DIR;
    else process.env.CMS_DATA_DIR = previous;
  }
});

test("CMS şeması yinelenen adresleri, kopuk ilişkileri ve güvensiz bağlantıları reddeder", () => {
  const content = initialContent();
  assert.equal(contentSchema.safeParse(content).success, true);
  content.posts[1].slug = content.posts[0].slug;
  assert.equal(contentSchema.safeParse(content).success, false);
  const links = initialContent();
  links.pages.home.sections.push({
    id: "unsafe",
    title: "Başlık",
    text: "Açıklama",
    image: "",
    imageAlt: "",
    buttonLabel: "Bağlantı",
    buttonHref: "javascript:alert(1)",
    status: "published",
  });
  assert.equal(contentSchema.safeParse(links).success, false);
  const relation = initialContent();
  relation.categories = [];
  assert.equal(contentSchema.safeParse(relation).success, false);
});
