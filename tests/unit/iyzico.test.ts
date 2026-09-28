import { createHmac } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createIyzicoAuthorization,
  verifyIyzicoWebhookSignature,
} from "../../src/server/iyzico";

test("iyzico IYZWSv2 başlığı istek yolu ve gövdesini imzalar", () => {
  const apiKey = "sandbox-api-key";
  const secretKey = "sandbox-secret-key";
  const randomKey = "1722246017090123456789";
  const path = "/payment/bin/check";
  const body = '{"binNumber":"589004"}';
  const header = createIyzicoAuthorization(
    apiKey,
    secretKey,
    randomKey,
    path,
    body,
  );
  const decoded = Buffer.from(header.slice("IYZWSv2 ".length), "base64").toString(
    "utf8",
  );
  const signature = createHmac("sha256", secretKey)
    .update(`${randomKey}${path}${body}`)
    .digest("hex");
  assert.equal(
    decoded,
    `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`,
  );
});

test("iyzico webhook yalnızca V3 HPP imzası eşleştiğinde kabul edilir", () => {
  const previousKey = process.env.IYZICO_API_KEY;
  const previousSecret = process.env.IYZICO_SECRET_KEY;
  process.env.IYZICO_API_KEY = "sandbox-api-key";
  process.env.IYZICO_SECRET_KEY = "sandbox-secret-key";
  const payload = {
    iyziEventType: "CHECKOUT_FORM_AUTH",
    iyziPaymentId: "28157797",
    token: "9895e0e6-cd7e-4635-9c33-fe52c337de09",
    paymentConversationId: "123456789",
    status: "SUCCESS",
  };
  try {
    const message =
      process.env.IYZICO_SECRET_KEY +
      payload.iyziEventType +
      payload.iyziPaymentId +
      payload.token +
      payload.paymentConversationId +
      payload.status;
    const signature = createHmac("sha256", process.env.IYZICO_SECRET_KEY)
      .update(message)
      .digest("hex");
    assert.equal(verifyIyzicoWebhookSignature(payload, signature), true);
    assert.equal(verifyIyzicoWebhookSignature(payload, "0".repeat(64)), false);
  } finally {
    if (previousKey === undefined) delete process.env.IYZICO_API_KEY;
    else process.env.IYZICO_API_KEY = previousKey;
    if (previousSecret === undefined) delete process.env.IYZICO_SECRET_KEY;
    else process.env.IYZICO_SECRET_KEY = previousSecret;
  }
});
