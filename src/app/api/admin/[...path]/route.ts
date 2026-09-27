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
  adminRoleSchema,
  createAdminUser,
  credentialsSchema,
  createSession,
  currentAdmin,
  hashPassword,
  isConfigured,
  limitAttempt,
  login,
  requireAdmin,
  requireOwner,
  sessionCookie,
  sessionLifetime,
  setupAdmin,
  tokenHash,
  verifyPassword,
} from "@/server/admin-auth";
import { listOrders, updateOrderStatus } from "@/server/order-store";
import { orderStatusSchema } from "@/lib/order-model";
import { productSchema } from "@/lib/cms-model";

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
      const admin = await requireAdmin();
      if (route === "users") {
        await requireOwner(admin);
        const users = await database().prepare(
          'SELECT id, username, role, active, created_at AS "createdAt" FROM admin_users ORDER BY CASE role WHEN \'owner\' THEN 0 ELSE 1 END, created_at',
        ).all();
        return json({ users, currentId: admin.id });
      }
      if (route === "customers") {
        const query = (new URL(request.url).searchParams.get("q") || "").trim().slice(0,100).toLowerCase();
        const pattern = `%${query}%`;
        const customers = await database().prepare('SELECT c.id, c.username, c.name, c.company, c.active, c.created_at AS "createdAt" FROM customers c WHERE lower(c.username) LIKE ? OR lower(c.name) LIKE ? OR lower(c.company) LIKE ? ORDER BY c.created_at DESC LIMIT 200').all(pattern, pattern, pattern);
        return json({customers});
      }
      if (route === "orders") {
        const query = new URL(request.url).searchParams.get("q") || "";
        return json({ orders: await listOrders(query) });
      }
      if (route === "content") return json(await readContent());
      if (route === "media") return json({ media: await listMedia() });
      throw new CmsError("İşlem bulunamadı.", 404);
    }
    const secure = assertSameOrigin(request);
    if (request.method === "POST" && ["login", "setup"].includes(route)) {
      const body = await bodyJson(request);
      const parsed = credentialsSchema.safeParse(body);
      if (!parsed.success) throw new CmsError(parsed.error.issues[0].message);
      const admin = route === "setup"
        ? await setupAdmin(
          parsed.data.username,
          parsed.data.password,
          z.string().max(128).parse(body.token),
        )
        : await login(parsed.data.username, parsed.data.password);
      const response = json({ ok: true });
      response.cookies.set(sessionCookie, await createSession(admin.id), {
        httpOnly: true,
        secure,
        sameSite: "strict",
        path: "/",
        maxAge: sessionLifetime,
      });
      return response;
    }
    const current = await requireAdmin();
    if (request.method === "POST" && route === "users") {
      await requireOwner(current);
      const data = credentialsSchema.extend({ role: adminRoleSchema }).strict().parse(await bodyJson(request));
      await createAdminUser(data.username, data.password, data.role);
      return json({ ok: true }, 201);
    }
    if (request.method === "POST" && route === "users/status") {
      await requireOwner(current);
      const data = z.object({ id: z.uuid(), active: z.boolean() }).strict().parse(await bodyJson(request));
      if (data.id === current.id)
        throw new CmsError("Kendi hesabınızı buradan duraklatamazsınız.");
      const result = await database().batch([
        { sql: "UPDATE admin_users SET active=? WHERE id=? RETURNING id", params: [data.active ? 1 : 0, data.id] },
        { sql: "DELETE FROM admin_user_sessions WHERE admin_id=?", params: [data.id] },
      ]);
      if (!result[0].rows.length) throw new CmsError("Yetkili bulunamadı.", 404);
      return json({ ok: true });
    }
    if (request.method === "POST" && route === "users/delete") {
      await requireOwner(current);
      const data = z.object({ id: z.uuid() }).strict().parse(await bodyJson(request));
      if (data.id === current.id)
        throw new CmsError("Kendi hesabınızı silemezsiniz.");
      const deleted = await database().prepare("DELETE FROM admin_users WHERE id=? RETURNING id").get(data.id);
      if (!deleted) throw new CmsError("Yetkili bulunamadı.", 404);
      return json({ ok: true });
    }
    if (request.method === "POST" && route === "customers/status") {
      const data = z.object({id:z.uuid(), active:z.boolean()}).strict().parse(await bodyJson(request));
      const updated = await database().batch([
        {sql:"UPDATE customers SET active=?, auth_version=auth_version+1 WHERE id=? RETURNING id", params:[data.active ? 1 : 0, data.id]},
        {sql:"DELETE FROM customer_sessions WHERE customer_id=?", params:[data.id]},
      ]);
      if (!updated[0].rows.length) throw new CmsError("Müşteri bulunamadı.", 404);
      return json({ok:true});
    }
    if (request.method === "POST" && route === "orders/status") {
      const data = z.object({ id: z.uuid(), status: orderStatusSchema }).strict().parse(await bodyJson(request));
      await updateOrderStatus(data.id, data.status);
      return json({ ok: true });
    }
    if (request.method === "POST" && route === "logout") {
      const token = (await cookies()).get(sessionCookie)?.value;
      if (token)
        await database().batch([
          { sql: "DELETE FROM admin_user_sessions WHERE token_hash=?", params: [tokenHash(token)] },
          { sql: "DELETE FROM sessions WHERE token_hash=?", params: [tokenHash(token)] },
        ]);
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
        .prepare("SELECT password_hash FROM admin_users WHERE id=?")
        .get(current.id))!;
      if (!(await verifyPassword(body.current, String(admin.password_hash))))
        throw new CmsError("Mevcut şifre hatalı.", 400);
      const passwordHash = await hashPassword(body.password);
      await database().batch([
        { sql: "UPDATE admin_users SET password_hash=? WHERE id=?", params: [passwordHash, current.id] },
        { sql: "DELETE FROM admin_user_sessions WHERE admin_id=?", params: [current.id] },
        ...(current.id === "owner"
          ? [{ sql: "UPDATE admin SET password_hash=? WHERE id=1", params: [passwordHash] }]
          : []),
      ]);
      const response = json({ ok: true });
      response.cookies.set(sessionCookie, await createSession(current.id), {
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
    if (request.method === "PUT" && route === "content/product") {
      const body = z
        .object({ product: productSchema })
        .strict()
        .parse(await bodyJson(request, 1024 * 1024));
      const snapshot = await readContent();
      const next = structuredClone(snapshot.content);
      const index = next.products.findIndex(
        (product) => product.id === body.product.id,
      );
      const product = structuredClone(body.product);
      if (index === -1) {
        const usedSlugs = new Set(next.products.map((item) => item.slug));
        const baseSlug = product.slug;
        let suffix = 2;
        while (usedSlugs.has(product.slug)) {
          product.slug = `${baseSlug}-${suffix}`;
          suffix += 1;
        }
        next.products.unshift(product);
      } else next.products[index] = product;
      return json(await saveContent(next, snapshot.revision));
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
          "Görsel okunamadı. JPG, PNG veya WebP biçiminde başka bir fotoğraf deneyin.",
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
