import { test } from "node:test";
import assert from "node:assert/strict";
import { districtBlogPosts, districtBlogSlugs } from "../../src/data/district-blog";

const denizliDistricts = [
  "Acıpayam",
  "Babadağ",
  "Baklan",
  "Bekilli",
  "Beyağaç",
  "Bozkurt",
  "Buldan",
  "Çal",
  "Çameli",
  "Çardak",
  "Çivril",
  "Güney",
  "Honaz",
  "Kale",
  "Merkezefendi",
  "Pamukkale",
  "Sarayköy",
  "Serinhisar",
  "Tavas",
] as const;

test("Denizli'nin 19 ilçesinin her biri için benzersiz ve dolu bir rehber bulunur", () => {
  assert.equal(districtBlogPosts.length, denizliDistricts.length);
  assert.equal(new Set(districtBlogSlugs).size, districtBlogSlugs.length);
  assert.equal(
    new Set(districtBlogPosts.map((post) => post.title)).size,
    districtBlogPosts.length,
  );

  for (const district of denizliDistricts) {
    const districtPost = districtBlogPosts.find((post) =>
      post.title.toLocaleLowerCase("tr-TR").includes(district.toLocaleLowerCase("tr-TR")),
    );

    assert.ok(districtPost, `${district} için blog yazısı eksik`);
    assert.equal(districtPost.sections.length, 3);
    assert.ok(districtPost.excerpt.length >= 90);
    assert.ok(districtPost.introduction.length >= 180);
    assert.ok(
      districtPost.sections.every(
        (section) => section.paragraphs.length >= 2 && section.paragraphs.every((paragraph) => paragraph.length >= 90),
      ),
      `${district} yazısında kısa veya eksik bölüm var`,
    );
  }
});
