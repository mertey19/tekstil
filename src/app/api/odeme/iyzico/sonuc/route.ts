import { NextResponse } from "next/server";
import {
  completePayment,
  getPaymentOrderByPublicToken,
  markPaymentFailed,
} from "@/server/order-store";
import { retrieveIyzicoCheckout } from "@/server/iyzico";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function destination(request: Request, token: string, result: string) {
  return new URL(`/siparis/${token}?odeme=${result}`, new URL(request.url).origin);
}

export async function POST(request: Request) {
  const publicToken = new URL(request.url).searchParams.get("siparis") || "";
  const order = await getPaymentOrderByPublicToken(publicToken);
  if (!order)
    return NextResponse.redirect(new URL("/odeme?odeme=gecersiz", request.url), 303);
  if (order.paymentStatus === "paid")
    return NextResponse.redirect(destination(request, publicToken, "basarili"), 303);
  try {
    const contentType = request.headers.get("content-type") || "";
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 8_192 || !contentType.includes("application/x-www-form-urlencoded"))
      throw new Error("Invalid callback body");
    const form = await request.formData();
    const token = String(form.get("token") || "");
    if (
      order.paymentProvider !== "iyzico" ||
      !token ||
      order.paymentReference !== `token:${token}`
    )
      throw new Error("Payment token mismatch");
    const result = await retrieveIyzicoCheckout(token, order.id);
    const matchesOrder =
      result.validSignature &&
      result.token === token &&
      result.conversationId === order.id &&
      result.basketId === order.id &&
      result.currency === order.currency &&
      result.paidCents === order.totalCents;
    if (result.successful && matchesOrder && result.paymentId) {
      await completePayment(order.id, "iyzico", `iyzico:${result.paymentId}`);
      return NextResponse.redirect(destination(request, publicToken, "basarili"), 303);
    }
    if (result.validSignature && result.status === "failure") {
      await markPaymentFailed(order.id, "iyzico");
      return NextResponse.redirect(destination(request, publicToken, "basarisiz"), 303);
    }
    return NextResponse.redirect(destination(request, publicToken, "kontrol"), 303);
  } catch (error) {
    console.error(
      "iyzico callback failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.redirect(destination(request, publicToken, "kontrol"), 303);
  }
}
