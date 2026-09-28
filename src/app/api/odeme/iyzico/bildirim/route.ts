import { NextResponse } from "next/server";
import {
  completePayment,
  getPaymentOrderById,
  markPaymentFailed,
} from "@/server/order-store";
import {
  retrieveIyzicoCheckout,
  verifyIyzicoWebhookSignature,
} from "@/server/iyzico";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });

const value = (input: unknown) => (typeof input === "string" ? input : String(input ?? ""));

export async function POST(request: Request) {
  try {
    if (!request.headers.get("content-type")?.includes("application/json"))
      return json({ error: "JSON required" }, 415);
    if (Number(request.headers.get("content-length") || 0) > 16_384)
      return json({ error: "Payload too large" }, 413);
    const raw = (await request.json()) as Record<string, unknown>;
    const payload = {
      iyziEventType: value(raw.iyziEventType),
      iyziPaymentId: value(raw.iyziPaymentId),
      token: value(raw.token),
      paymentConversationId: value(raw.paymentConversationId),
      status: value(raw.status),
    };
    const signature = request.headers.get("x-iyz-signature-v3") || "";
    if (!verifyIyzicoWebhookSignature(payload, signature))
      return json({ error: "Invalid signature" }, 401);
    if (!payload.token || !["SUCCESS", "FAILURE"].includes(payload.status))
      return json({ received: true });
    const order = await getPaymentOrderById(payload.paymentConversationId);
    if (
      !order ||
      order.paymentProvider !== "iyzico" ||
      (order.paymentStatus !== "paid" &&
        order.paymentReference !== `token:${payload.token}`)
    )
      return json({ error: "Order not found" }, 404);
    if (order.paymentStatus === "paid") return json({ received: true });
    if (payload.status === "FAILURE") {
      await markPaymentFailed(order.id, "iyzico");
      return json({ received: true });
    }
    const result = await retrieveIyzicoCheckout(payload.token, order.id);
    const matchesOrder =
      result.validSignature &&
      result.successful &&
      result.token === payload.token &&
      result.conversationId === order.id &&
      result.basketId === order.id &&
      result.currency === order.currency &&
      result.paidCents === order.totalCents &&
      (!payload.iyziPaymentId || result.paymentId === payload.iyziPaymentId);
    if (!matchesOrder || !result.paymentId)
      return json({ error: "Payment could not be verified" }, 409);
    await completePayment(order.id, "iyzico", `iyzico:${result.paymentId}`);
    return json({ received: true });
  } catch (error) {
    console.error(
      "iyzico webhook failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return json({ error: "Webhook could not be processed" }, 500);
  }
}
