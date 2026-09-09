import test from "node:test";
import assert from "node:assert/strict";
import { settingsSchema } from "../../src/lib/cms-model";
import { socialSchema, supportSchema } from "../../src/lib/support-model";
import { initialContent } from "../../src/server/cms-seed";

test("Eski CMS ayarları destek sayfalarıyla açılır; mevcut içerikler korunur", () => {
  const old: Record<string, unknown> = initialContent().settings;
  delete old.support;
  delete old.social;
  delete old.merchant;
  old.name = "Mevcut işletme adı";
  const parsed = settingsSchema.parse(old);
  assert.equal(parsed.name, old.name);
  assert.equal(parsed.social.instagram, "");
  assert.equal(Object.keys(parsed.support).length, 5);
  parsed.support.faq.sections[0].title = "Özel soru";
  assert.notEqual(
    settingsSchema.parse(old).support.faq.sections[0].title,
    "Özel soru",
  );
  assert.equal(
    supportSchema.safeParse({
      ...parsed.support,
      faq: { ...parsed.support.faq, sections: [] },
    }).success,
    false,
  );
});

test("Sosyal bağlantılar yalnızca doğru platformun HTTPS adreslerine izin verir", () => {
  for (const facebook of [
    "javascript:alert(1)",
    "http://facebook.com/a",
    "https://facebook.com.evil.test/a",
    "https://facebook.com@evil.test",
    "https://evil@facebook.com/a",
  ]) {
    assert.equal(
      socialSchema.safeParse({ facebook, instagram: "", linkedin: "" }).success,
      false,
      facebook,
    );
  }
  assert.equal(
    socialSchema.safeParse({
      facebook: "https://www.facebook.com/company",
      instagram: "https://instagram.com/company",
      linkedin: "https://www.linkedin.com/company/test",
    }).success,
    true,
  );
});
