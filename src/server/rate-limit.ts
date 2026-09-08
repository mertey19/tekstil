// Soft per-process abuse guard for a stateless message-preparation endpoint.
// This does not send messages and is not a distributed rate-limit guarantee.
export function createMemoryLimiter(limit = 15, windowMs = 900_000) {
  const entries = new Map<string, { count: number; end: number }>();
  return async (key: string) => {
    const now = Date.now();
    for (const [id, entry] of entries) if (entry.end <= now) entries.delete(id);
    if (entries.size > 10_000 && !entries.has(key)) return false;
    const entry = entries.get(key) ?? { count: 0, end: now + windowMs };
    entry.count++;
    entries.set(key, entry);
    return entry.count <= limit;
  };
}
export const rateLimit = createMemoryLimiter(60);
