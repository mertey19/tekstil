const DISALLOWED_HOST =
  /(^|\.)(localhost|example|invalid|test|local|vercel\.app)(\.|$)|^127\.|^0\.|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\.|kukuroglu/i;

/** HTTPS apex/www origin suitable for sitemap loc and robots Sitemap. */
export function isPublicSiteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password &&
      !url.port &&
      url.hostname.includes(".") &&
      !DISALLOWED_HOST.test(url.hostname) &&
      !/^[\d.:\[\]]+$/.test(url.hostname)
    );
  } catch {
    return false;
  }
}

export function publicHttpsOrigin(
  value: string | null | undefined,
): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const first = raw.split(",")[0].trim();
    if (/^http:/i.test(first)) return null;
    const host = first.replace(/:\d+$/, "");
    const withProtocol = host.includes("://") ? host : `https://${host}`;
    const url = new URL(withProtocol);
    if (url.protocol !== "https:") return null;
    const origin = `https://${url.hostname}/`;
    return isPublicSiteUrl(origin) ? `https://${url.hostname}` : null;
  } catch {
    return null;
  }
}

export function resolveSitemapOrigin(input: {
  host?: string | null;
  siteUrl?: string | null;
  productionUrl?: string | null;
}): string | null {
  return (
    publicHttpsOrigin(input.siteUrl) ||
    publicHttpsOrigin(input.host) ||
    publicHttpsOrigin(input.productionUrl)
  );
}

export function originFromRequestHeaders(
  requestHeaders: { get(name: string): string | null },
  siteUrl: string | null | undefined,
  productionUrl?: string | null,
): string | null {
  return resolveSitemapOrigin({
    host:
      requestHeaders.get("x-forwarded-host") || requestHeaders.get("host"),
    siteUrl,
    productionUrl,
  });
}
