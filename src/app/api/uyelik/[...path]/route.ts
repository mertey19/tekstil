import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { customerCredentials } from "@/lib/customer-model";
import { CmsError, database } from "@/server/cms-store";
import { limitAttempt, tokenHash } from "@/server/admin-auth";
import {
  changeCustomerPassword,
  currentCustomer,
  customerCookie,
  customerLifetime,
  deleteCustomer,
  loginCustomer,
  recoverCustomer,
  registerCustomer,
  requireCustomer,
  updateCustomerProfile,
} from "@/server/customer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
function sameOrigin(request: Request) {
  let origin: URL;
  try {
    origin = new URL(request.headers.get("origin") || "");
  } catch {
    throw new CmsError("İstek kaynağı doğrulanamadı.", 403);
  }
  const configured = process.env.SITE_URL || process.env.ADMIN_ORIGIN;
  const local =
    origin.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname) &&
    origin.host === request.headers.get("host");
  if (
    !(configured ? origin.origin === new URL(configured).origin : local) ||
    (!local && origin.protocol !== "https:") ||
    request.headers.get("x-customer-request") !== "1" ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new CmsError(
      "Bu kaynaktan işlem yapılamaz. Sitenin kendi adresini kullanın.",
      403,
    );
  return origin.protocol === "https:";
}
async function body(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new CmsError("JSON içerik bekleniyor.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new CmsError("İstek içeriği boş.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 16_384) {
      await reader.cancel();
      throw new CmsError("İstek çok büyük.", 413);
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new CmsError("İstek içeriği okunamadı.");
  }
}
const cookie = (response: NextResponse, token: string, secure: boolean) => {
  response.cookies.set(customerCookie, token, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: token ? customerLifetime : 0,
  });
  return response;
};
async function handle(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const path = (await context.params).path.join("/");
    if (request.method === "GET" && path === "session") {
      const customer = await currentCustomer();
      return json({ customer });
    }
    const secure = sameOrigin(request);
    if (
      request.method === "POST" &&
      ["register", "login", "recover"].includes(path)
    ) {
      const ip = process.env.VERCEL
        ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ||
          "shared"
        : "local";
      await limitAttempt(
        `customer:${path}:ip:${tokenHash(ip)}`,
        path === "register" ? 10 : 40,
        path === "register" ? 60 : 15,
      );
      const data = await body(request);
      if (path === "register") {
        await limitAttempt("customer:register:global", 200, 60);
        const created = await registerCustomer(data);
        return cookie(
          json({ ok: true, recoveryCode: created.recoveryCode }, 201),
          created.token,
          secure,
        );
      }
      if (path === "login") {
        const credentials = customerCredentials.strict().parse(data);
        return cookie(
          json({ ok: true }),
          await loginCustomer(credentials.username, credentials.password),
          secure,
        );
      }
      const recovery = customerCredentials
        .extend({
          code: z
            .string()
            .trim()
            .toLowerCase()
            .regex(/^[a-f0-9]{48}$/, "Kurtarma kodunu kontrol edin."),
        })
        .strict()
        .parse(data);
      const recoveryCode = await recoverCustomer(
        recovery.username,
        recovery.code,
        recovery.password,
      );
      return cookie(json({ ok: true, recoveryCode }), "", secure);
    }
    const customer = await requireCustomer();
    if (request.method === "POST" && path === "logout") {
      const token = (await cookies()).get(customerCookie)?.value;
      if (token)
        await database()
          .prepare(
            "DELETE FROM customer_sessions WHERE token_hash=? AND customer_id=?",
          )
          .run(tokenHash(token), customer.id);
      return cookie(json({ ok: true }), "", secure);
    }
    await limitAttempt(`customer:write:${customer.id}`, 150, 15);
    if (request.method === "PATCH" && path === "profile") {
      await updateCustomerProfile(customer.id, await body(request));
      return json({ ok: true });
    }
    if (request.method === "POST" && path === "password") {
      const data = z
        .object({
          current: z.string().min(1).max(128),
          password: customerCredentials.shape.password,
        })
        .strict()
        .parse(await body(request));
      const recoveryCode = await changeCustomerPassword(
        customer.id,
        data.current,
        data.password,
      );
      return cookie(json({ ok: true, recoveryCode }), "", secure);
    }
    if (request.method === "DELETE" && path === "profile") {
      const data = z
        .object({ password: z.string().min(1).max(128) })
        .strict()
        .parse(await body(request));
      await deleteCustomer(customer.id, data.password);
      return cookie(json({ ok: true }), "", secure);
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
      "Customer operation failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return json({ error: "İşlem tamamlanamadı. Lütfen yeniden deneyin." }, 500);
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
