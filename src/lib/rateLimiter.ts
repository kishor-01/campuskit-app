import { Redis } from '@upstash/redis';

// Minimal Redis-backed rate limiter using Upstash Redis (or compatible Redis URL).
// If REDIS_URL / REDIS_TOKEN are not provided, we gracefully fall back to an in-memory limiter
// suitable only for single-process development.

type RateLimitResult = { limited: boolean; remaining: number; resetIn: number };

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const inMemoryMap = new Map<string, { count: number; expiresAt: number }>();

export async function rateLimit(key: string, limit = 5, windowSeconds = 60): Promise<RateLimitResult> {
  // Key should be namespaced by endpoint and identifier (email or IP)
  const now = Math.floor(Date.now() / 1000);

  if (redis) {
    try {
      // Perform INCR and set EXPIRE if first
      const fullKey = `rate:${key}`;
      const val = await redis.incr(fullKey);
      if (val === 1) {
        await redis.expire(fullKey, windowSeconds);
      }
      const ttl = (await redis.ttl(fullKey)) ?? windowSeconds;

      return {
        limited: val > limit,
        remaining: Math.max(0, limit - val),
        resetIn: ttl,
      };
    } catch (e) {
      console.error('Redis rateLimit error, falling back to memory limiter', e);
    }
  }

  // In-memory fallback (single process only)
  const current = inMemoryMap.get(key);
  if (!current || current.expiresAt <= now) {
    inMemoryMap.set(key, { count: 1, expiresAt: now + windowSeconds });
    return { limited: false, remaining: limit - 1, resetIn: windowSeconds };
  }

  current.count++;
  inMemoryMap.set(key, current);
  return { limited: current.count > limit, remaining: Math.max(0, limit - current.count), resetIn: current.expiresAt - now };
}

export default rateLimit;
