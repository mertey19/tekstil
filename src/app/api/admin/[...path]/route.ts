import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import {
  CmsError,
  database,
  listMedia,
  readContent,
  saveContent,
} from "@/server/cms-store";
import {
  assertSameOrigin,
  credentialsSchema,
  createSession,
  currentAdmin,
  hashPassword,
  isConfigured,
  limitAttempt,
  login,
  requireAdmin,
  sessionCookie,
  sessionLifetime,
  setupAdmin,
  tokenHash,
  verifyPassword,
} from "@/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
async function limitedBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit)
    throw new CmsError("Dosya veya içerik boyutu çok büyük.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new CmsError("İstek içeriği boş.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      throw new CmsError("Dosya veya içerik boyutu çok büyük.", 413);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
async function bodyJson(request: Request, limit = 20_000) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new CmsError("JSON içerik bekleniyor.", 415);
  try {
    return JSON.parse((await limitedBody(request, limit)).toString("utf8"));
  } catch (error) {
    if (error instanceof CmsError) throw error;
    throw new CmsError("İstek içeriği okunamadı.");
  }
}
async function handle(request: Request, context: Context) {
  try {
    const route = (await context.params).path.join("/");
    if (request.method === "GET") {
      if (route === "session")
        return json({ configured: await isConfigured(), user: await currentAdmin() });
      await requireAdmin();
      if (route === "content") return json(await readContent());
      if (route === "media") return json({ media: await listMedia() });
      throw new CmsError("İşlem bulunamadı.", 404);
    }
    const secure = assertSameOrigin(request);
    if (request.method === "POST" && ["login", "setup"].includes(route)) {
      const body = await bodyJson(request);
      const parsed = credentialsSchema.safeParse(body);
      if (!parsed.success) throw new CmsError(parsed.error.issues[0].message);
      if (route === "setup")
        await setupAdmin(
          parsed.data.username,
          parsed.data.password,
          z.string().max(128).parse(body.token),
        );
      else await login(parsed.data.username, parsed.data.password);
      const response = json({ ok: true });
      response.cookies.set(sessionCookie, await createSession(), {
        httpOnly: true,
        secure,
        sameSite: "strict",
        path: "/",
        maxAge: sessionLifetime,
      });
      return response;
    }
    await requireAdmin();
    if (request.method === "POST" && route === "logout") {
      const token = (await cookies()).get(sessionCookie)?.value;
      if (token)
        await database()
          .prepare("DELETE FROM sessions WHERE token_hash=?")
          .run(tokenHash(token));
      const response = json({ ok: true });
      response.cookies.set(sessionCookie, "", {
        httpOnly: true,
        secure,
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      });
      return response;
    }
    if (request.method === "POST" && route === "password") {
      await limitAttempt("password", 8);
      const body = z
        .object({
          current: z.string().min(1).max(128),
          password: credentialsSchema.shape.password,
        })
        .parse(await bodyJson(request));
      const admin = (await database()
        .prepare("SELECT password_hash FROM admin WHERE id=1")
        .get())!;
      if (!(await verifyPassword(body.current, String(admin.password_hash))))
        throw new CmsError("Mevcut şifre hatalı.", 400);
      const passwordHash = await hashPassword(body.password);
      await database().batch([
        { sql: "UPDATE admin SET password_hash=? WHERE id=1", params: [passwordHash] },
        { sql: "DELETE FROM sessions" },
      ]);
      const response = json({ ok: true });
      response.cookies.set(sessionCookie, await createSession(), {
        httpOnly: true,
        secure,
        sameSite: "strict",
        path: "/",
        maxAge: sessionLifetime,
      });
      return response;
    }
    if (request.method === "PUT" && route === "content") {
      const body = z
        .object({ content: z.unknown(), revision: z.number().int().positive() })
        .parse(await bodyJson(request, 4 * 1024 * 1024));
      return json(await saveContent(body.content, body.revision));
    }
    if (request.method === "POST" && route === "media") {
      limitAttempt("upload", 120, 60);
      const bytes = await limitedBody(request, 4 * 1024 * 1024);
      let result;
      try {
        const input = sharp(bytes, {
          limitInputPixels: 25_000_000,
          animated: false,
          failOn: "warning",
        });
        const metadata = await input.metadata();
        if (
          !metadata.format ||
          !["jpeg", "png", "webp"].includes(metadata.format) ||
          (metadata.pages ?? 1) > 1
        )
          throw new Error("format");
        result = await input
          .rotate()
          .resize({
            width: 2400,
            height: 2400,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 86 })
          .toBuffer({ resolveWithObject: true });
      } catch {
        throw new CmsError(
          "Görsel okunamadı. En fazla 4 MB, 25 megapiksel boyutunda JPG, PNG veya WebP seçin. Hareketli görseller desteklenmiyor.",
          415,
        );
      }
      const src = `/images/uploads/${randomUUID()}.webp`;
      let name = "Görsel";
      try {
        name = decodeURIComponent(
          request.headers.get("x-file-name") || "Görsel",
        )
          .replace(/[\x00-\x1f]/g, "")
          .slice(0, 160);
      } catch {
        /* Safe display name. */
      }
      const item = {
        src,
        name,
        width: result.info.width,
        height: result.info.height,
        size: result.data.length,
        createdAt: new Date().toISOString(),
      };
      await database()
        .prepare("INSERT INTO media VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(
          src,
          name,
          item.width,
          item.height,
          item.size,
          item.createdAt,
          result.data,
        );
      return json(item, 201);
    }
    throw new CmsError("İşlem bulunamadı.", 404);
  } catch (error) {
    if (error instanceof CmsError)
      return json({ error: error.message }, error.status);
    if (error instanceof z.ZodError)
      return json(
        { error: error.issues[0]?.message || "Alanları kontrol edin." },
        400,
      );
    console.error(
      "CMS operation failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return json({ error: "İşlem tamamlanamadı. Lütfen yeniden deneyin." }, 500);
  }
}
export const GET = handle;
export const POST = handle;
export const PUT = handle;
