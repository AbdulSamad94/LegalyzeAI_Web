"""Redis-backed fixed-window rate limiting for public endpoints."""

from typing import Optional, Tuple
import redis.asyncio as redis
from config import settings


class RateLimiter:
    """Per-key fixed-window rate limiter.

    Fails open (allows the request) if Redis is unavailable, matching the
    degraded-mode convention used by CacheManager.
    """

    def __init__(self):
        self.config = settings.redis
        self.client: Optional[redis.Redis] = None

    async def connect(self) -> bool:
        """Connect to Redis"""
        if not self.config.is_configured:
            return False

        try:
            self.client = redis.Redis(
                host=self.config.host,
                port=self.config.port,
                password=self.config.password,
                ssl=self.config.ssl,
                decode_responses=False,
            )
            await self.client.ping()
            return True
        except Exception as e:
            print(f"[RATE_LIMIT] Failed to connect: {e}")
            return False

    async def check(self, key: str, limit: int, window_seconds: int) -> Tuple[bool, int]:
        """
        Check and consume one request against a fixed window.

        Returns (allowed, retry_after_seconds). If Redis is unreachable,
        allows the request rather than blocking legitimate traffic.
        """
        if not self.client:
            return True, 0

        try:
            redis_key = f"ratelimit:{key}"
            count = await self.client.incr(redis_key)
            if count == 1:
                await self.client.expire(redis_key, window_seconds)

            if count > limit:
                ttl = await self.client.ttl(redis_key)
                return False, ttl if ttl > 0 else window_seconds

            return True, 0
        except Exception as e:
            print(f"[RATE_LIMIT] Check failed: {e}")
            return True, 0

    async def close(self):
        """Close Redis connection"""
        if self.client:
            await self.client.close()


# Global rate limiter instance
rate_limiter = RateLimiter()
