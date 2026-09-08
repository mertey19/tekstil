import { siteConfig } from "@/config/site";
import { getProducts } from "@/lib/content";
import { createQuoteHandler } from "@/server/quote-handler";
import { rateLimit } from "@/server/rate-limit";
export const runtime = "nodejs";
export async function POST(request: Request) {
  let origin = siteConfig.url ? new URL(siteConfig.url).origin : null;
  if (!origin && siteConfig.demo) {
    // Next may normalize request.url to its internal listener. Match the actual
    // browser origin with the incoming Host, restricted to local preview hosts.
    try {
      const candidate = new URL(request.headers.get("origin") || "");
      if (
        candidate.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(candidate.hostname) &&
        candidate.host === request.headers.get("host")
      )
        origin = candidate.origin;
    } catch {
      /* Missing or malformed origin fails closed below. */
    }
  }
  return createQuoteHandler({
    origin,
    whatsapp: siteConfig.whatsapp,
    siteUrl: siteConfig.url,
    products: getProducts(),
    identity: (req) => {
      const header = process.env.TRUSTED_CLIENT_IP_HEADER;
      return header
        ? req.headers.get(header)?.split(",")[0].trim() || "unknown"
        : "shared";
    },
    rateLimit,
  })(request);
}
