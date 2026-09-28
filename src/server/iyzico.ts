import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { CheckoutInput } from "@/lib/order-model";

const initializePath = "/payment/iyzipos/checkoutform/initialize/auth/ecom";
const retrievePath = "/payment/iyzipos/checkoutform/auth/ecom/detail";

type PendingOrder = {
  id: string;
  publicToken: string;
  totalCents: number;
  shippingCents: number;
  items: { productId: string; name: string; lineTotalCents: number }[];
};

type IyzicoResponse = Record<string, unknown> & {
  status?: string;
  errorMessage?: string;
  signature?: string;
};

export class IyzicoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IyzicoError";
  }
}

function configuration() {
  const apiKey = process.env.IYZICO_API_KEY?.trim();
  const secretKey = process.env.IYZICO_SECRET_KEY?.trim();
  const environment = process.env.IYZICO_ENVIRONMENT?.trim() || "sandbox";
  if (!apiKey || !secretKey)
    throw new IyzicoError("iyzico API anahtarları yapılandırılmadı.");
  if (environment !== "sandbox" && environment !== "production")
    throw new IyzicoError("IYZICO_ENVIRONMENT sandbox veya production olmalıdır.");
  return {
    apiKey,
    secretKey,
    baseUrl:
      environment === "production"
        ? "https://api.iyzipay.com"
        : "https://sandbox-api.iyzipay.com",
  };
}

export function isIyzicoConfigured() {
  return Boolean(
    process.env.IYZICO_API_KEY?.trim() &&
      process.env.IYZICO_SECRET_KEY?.trim() &&
      ["sandbox", "production"].includes(
        process.env.IYZICO_ENVIRONMENT?.trim() || "sandbox",
      ),
  );
}

export function createIyzicoAuthorization(
  apiKey: string,
  secretKey: string,
  randomKey: string,
  path: string,
  body: string,
) {
  const signature = createHmac("sha256", secretKey)
    .update(`${randomKey}${path}${body}`, "utf8")
    .digest("hex");
  const value = `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`;
  return `IYZWSv2 ${Buffer.from(value, "utf8").toString("base64")}`;
}

function normalizePrice(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!/^\d+(?:\.\d+)?$/.test(raw)) return "";
  return raw.includes(".") ? raw.replace(/0+$/, "").replace(/\.$/, "") : raw;
}

function matchesSignature(signature: unknown, values: unknown[], secretKey: string) {
  if (typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature))
    return false;
  const expected = createHmac("sha256", secretKey)
    .update(values.map(String).join(":"), "utf8")
    .digest("hex");
  const actualBuffer = Buffer.from(signature.toLowerCase(), "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

async function request(path: string, payload: Record<string, unknown>) {
  const config = configuration();
  const body = JSON.stringify(payload);
  const randomKey = `${Date.now()}${randomBytes(12).toString("hex")}`;
  const response = await fetch(`${config.baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: createIyzicoAuthorization(
        config.apiKey,
        config.secretKey,
        randomKey,
        path,
        body,
      ),
      "Content-Type": "application/json",
      "x-iyzi-rnd": randomKey,
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const result = (await response.json().catch(() => null)) as IyzicoResponse | null;
  if (!response.ok || !result)
    throw new IyzicoError("iyzico servisine ulaşılamadı.");
  return { result, secretKey: config.secretKey };
}

const money = (cents: number) => Number((cents / 100).toFixed(2));

function splitCustomerName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { name: parts[0], surname: parts[0] };
  return { name: parts.slice(0, -1).join(" "), surname: parts.at(-1)! };
}

export async function initializeIyzicoCheckout(
  order: PendingOrder,
  checkout: CheckoutInput,
  callbackUrl: string,
) {
  const customer = splitCustomerName(checkout.customerName);
  const address = `${checkout.address}, ${checkout.postalCode} ${checkout.district} / ${checkout.city}`;
  const basketItems = order.items.map((item) => ({
    id: item.productId,
    price: money(item.lineTotalCents),
    name: item.name,
    category1: "Mikrofiber ve tekstil ürünleri",
    itemType: "PHYSICAL",
  }));
  if (order.shippingCents > 0)
    basketItems.push({
      id: `kargo-${order.id}`,
      price: money(order.shippingCents),
      name: "Kargo",
      category1: "Teslimat",
      itemType: "PHYSICAL",
    });
  const payload = {
    locale: "tr",
    conversationId: order.id,
    price: money(order.totalCents),
    paidPrice: money(order.totalCents),
    currency: "TRY",
    basketId: order.id,
    paymentGroup: "PRODUCT",
    callbackUrl,
    buyer: {
      id: `misafir-${order.id}`,
      ...customer,
      identityNumber: checkout.identityNumber,
      email: checkout.email,
      gsmNumber: checkout.phone,
      registrationAddress: address,
      city: checkout.city,
      country: "Turkey",
      zipCode: checkout.postalCode,
    },
    shippingAddress: {
      address,
      zipCode: checkout.postalCode,
      contactName: checkout.customerName,
      city: checkout.city,
      country: "Turkey",
    },
    billingAddress: {
      address,
      zipCode: checkout.postalCode,
      contactName:
        checkout.invoiceType === "corporate"
          ? checkout.company
          : checkout.customerName,
      city: checkout.city,
      country: "Turkey",
    },
    basketItems,
  };
  const { result, secretKey } = await request(initializePath, payload);
  if (
    result.status !== "success" ||
    typeof result.token !== "string" ||
    typeof result.paymentPageUrl !== "string" ||
    result.conversationId !== order.id ||
    !matchesSignature(
      result.signature,
      [result.conversationId, result.token],
      secretKey,
    )
  )
    throw new IyzicoError(
      result.errorMessage || "iyzico ödeme sayfası oluşturulamadı.",
    );
  const paymentUrl = new URL(result.paymentPageUrl);
  if (
    paymentUrl.protocol !== "https:" ||
    !(
      paymentUrl.hostname === "iyzipay.com" ||
      paymentUrl.hostname.endsWith(".iyzipay.com")
    )
  )
    throw new IyzicoError("iyzico ödeme adresi doğrulanamadı.");
  return { token: result.token, paymentPageUrl: paymentUrl.toString() };
}

export async function retrieveIyzicoCheckout(token: string, orderId: string) {
  const { result, secretKey } = await request(retrievePath, {
    locale: "tr",
    conversationId: orderId,
    token,
  });
  const signed = matchesSignature(
    result.signature,
    [
      result.paymentStatus,
      result.paymentId,
      result.currency,
      result.basketId,
      result.conversationId,
      normalizePrice(result.paidPrice),
      normalizePrice(result.price),
      result.token,
    ],
    secretKey,
  );
  return {
    validSignature: signed,
    successful:
      signed &&
      result.status === "success" &&
      result.paymentStatus === "SUCCESS" &&
      result.fraudStatus === 1,
    status: result.status,
    paymentId: typeof result.paymentId === "string" ? result.paymentId : "",
    conversationId:
      typeof result.conversationId === "string" ? result.conversationId : "",
    basketId: typeof result.basketId === "string" ? result.basketId : "",
    currency: typeof result.currency === "string" ? result.currency : "",
    paidCents: Math.round(Number(result.paidPrice) * 100),
    token: typeof result.token === "string" ? result.token : "",
  };
}

export function verifyIyzicoWebhookSignature(
  payload: {
    iyziEventType: string;
    iyziPaymentId: string;
    token: string;
    paymentConversationId: string;
    status: string;
  },
  signature: string,
) {
  const { secretKey } = configuration();
  return verifyWebhookMessage(payload, signature, secretKey);
}

function verifyWebhookMessage(
  payload: {
    iyziEventType: string;
    iyziPaymentId: string;
    token: string;
    paymentConversationId: string;
    status: string;
  },
  signature: string,
  secretKey: string,
) {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const message =
    secretKey +
    payload.iyziEventType +
    payload.iyziPaymentId +
    payload.token +
    payload.paymentConversationId +
    payload.status;
  const expected = createHmac("sha256", secretKey)
    .update(message, "utf8")
    .digest("hex");
  const actualBuffer = Buffer.from(signature.toLowerCase(), "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return timingSafeEqual(actualBuffer, expectedBuffer);
}
