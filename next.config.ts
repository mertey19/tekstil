import type { NextConfig } from "next";
import { canonicalRedirects } from "./src/lib/canonical-redirects";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Runtime content, accounts and test databases belong on the persistent disk,
  // never in a deployment bundle assembled from this checkout.
  outputFileTracingExcludes: {
    "/*": [
      "./data/**/*",
      "./artifacts/**/*",
      "./tests/**/*",
      "./.env*",
      "./.vercel/**/*",
      "**/*.sqlite",
      "**/*.sqlite-wal",
      "**/*.sqlite-shm",
    ],
  },
  images: { formats: ["image/avif", "image/webp"] },
  // Wait for metadata before flushing so unknown dynamic routes retain an HTTP 404.
  htmlLimitedBots: /.*/,
  redirects: () =>
    canonicalRedirects(
      process.env.SITE_URL,
      process.env.SITE_REDIRECT_HOSTS,
      process.env.VERCEL_ENV,
    ),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
