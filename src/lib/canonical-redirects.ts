import { isPublicSiteUrl } from "./site-origin";

export function canonicalRedirects(
  siteUrl: string | undefined,
  hosts: string | undefined,
  environment: string | undefined,
) {
  if (environment !== "production" || !siteUrl || !isPublicSiteUrl(siteUrl))
    return [];
  const origin = new URL(siteUrl).origin;
  const primaryHost = new URL(origin).hostname;
  const aliases = [
    ...new Set(
      (hosts || "")
        .split(",")
        .map((host) => host.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
  return aliases
    .filter(
      (host) =>
        host !== primaryHost && /^[a-z0-9]+(?:[.-][a-z0-9]+)+$/.test(host),
    )
    .map((host) => ({
      // Preserve domain verification and never redirect API POST requests.
      source: "/:path((?!api(?:/|$)|_next(?:/|$)|google[^/]*\\.html$).*)",
      has: [{ type: "host" as const, value: host.replace(/\./g, "\\.") }],
      destination: `${origin}/:path`,
      permanent: true,
    }));
}
