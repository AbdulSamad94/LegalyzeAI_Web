type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Above this many tracked keys, opportunistically drop expired ones so a
// long-lived serverless instance doesn't accumulate an unbounded map.
const PRUNE_THRESHOLD = 500;

function pruneExpired(now: number) {
    if (buckets.size < PRUNE_THRESHOLD) return;
    for (const [key, bucket] of buckets) {
        if (now > bucket.resetAt) buckets.delete(key);
    }
}

/**
 * In-memory fixed-window rate limiter, scoped to a single Next.js server
 * instance. There's no shared store (Redis/DB) wired up on this side of the
 * app, so this resets on cold start and isn't shared across instances - it's
 * a best-effort throttle for low-volume, non-LLM endpoints. The LLM-backed
 * /api/demo path is rate limited server-side instead, via the backend's
 * Redis-backed limiter (see backend/infrastructure/rate_limiter.py).
 */
export function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    pruneExpired(now);

    const bucket = buckets.get(key);
    if (!bucket || now > bucket.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSeconds: 0 };
    }

    bucket.count += 1;
    if (bucket.count > limit) {
        return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
    }

    return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIp(req: Request): string {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0].trim();
    return req.headers.get("x-real-ip") || "unknown";
}
