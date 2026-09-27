import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin, limitAttempt, tokenHash } from "@/server/admin-auth";
import { CmsError } from "@/server/cms-store";
import { checkoutSchema } from "@/lib/order-model";
import { completeMockPayment, createPendingOrder } from "@/server/order-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new CmsError("JSON içerik bekleniyor.", 415);
  if (Number(request.headers.get("content-length")) > 32_768) throw new CmsError("İstek çok büyük.", 413);
  return request.json().catch(() => { throw new CmsError("İstek içeriği okunamadı."); });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request, "x-shop-request");
    const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "shared" : "local";
    await limitAttempt(`shop:checkout:${tokenHash(ip)}`, 20, 15);
    const provider = process.env.PAYMENT_PROVIDER || "";
    const mockAllowed = provider === "mock" && process.env.PAYMENT_TEST_MODE === "true";
    if (!mockAllowed)
      throw new CmsError("Sanal POS hesabı henüz bağlanmadı. Sepetiniz korunuyor; ödeme sağlayıcısı bağlandıktan sonra tekrar deneyin.", 503);
    const input = checkoutSchema.parse(await readBody(request));
    const order = await createPendingOrder(input);
    await completeMockPayment(order.id);
    return json({ redirectUrl: `/siparis/${order.publicToken}?odeme=basarili` }, 201);
  } catch (error) {
    if (error instanceof CmsError) return json({ error: error.message }, error.status);
    if (error instanceof z.ZodError) return json({ error: error.issues[0]?.message || "Alanları kontrol edin." }, 400);
    console.error("Checkout failed", error instanceof Error ? error.name : "UnknownError");
    return json({ error: "Ödeme başlatılamadı. Lütfen yeniden deneyin." }, 500);
  }
}
