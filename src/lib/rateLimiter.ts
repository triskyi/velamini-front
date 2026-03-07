/**
 * Rate limiter — 60 requests per minute per API key.
 *
 * Default: in-memory sliding window (works on a single process, fine for dev
 * and most Vercel serverless deployments where each function is isolated).
 *
 * Production upgrade: swap for Upstash Redis:
 *   npm install @upstash/ratelimit @upstash/redis
 *   UPSTASH_REDIS_REST_URL=...
 *   UPSTASH_REDIS_REST_TOKEN=...
 */

// ── In-memory store ───────────────────────────────────────────────────────────
// Key → array of request timestamps in the current window
const store = new Map<string, number[]>();
const WINDOW_MS   = 60_000; // 1 minute
const MAX_PER_MIN = 60;

// Prune old entries every 5 minutes so the map doesn't grow forever
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - WINDOW_MS;
    for (const [key, timestamps] of store) {
      const fresh = timestamps.filter(t => t > cutoff);
      if (fresh.length === 0) store.delete(key);
      else store.set(key, fresh);
    }
  }, 5 * 60_000);
}

export interface RateLimitResult {
  limited:   boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * Check rate limit for an identifier (use apiKeyHash, NOT the plaintext key).
 * Sliding window: tracks exact request timestamps in the last 60 seconds.
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now    = Date.now();
  const cutoff = now - WINDOW_MS;

  const timestamps = (store.get(identifier) ?? []).filter(t => t > cutoff);
  timestamps.push(now);
  store.set(identifier, timestamps);

  const count    = timestamps.length;
  const limited  = count > MAX_PER_MIN;
  const oldest   = timestamps[0] ?? now;
  const resetInMs = Math.max(0, oldest + WINDOW_MS - now);

  return {
    limited,
    remaining: Math.max(0, MAX_PER_MIN - count),
    resetInMs,
  };
}
