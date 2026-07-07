"""Retry logic with exponential backoff for resilient operations."""

import asyncio
import random
from typing import TypeVar, Callable, Any, Optional, Tuple, Type
from dataclasses import dataclass, field

from .logger import logger

T = TypeVar('T')


@dataclass
class RetryConfig:
    """Configuration for retry behavior"""
    max_attempts: int = 3
    initial_delay: float = 1.0
    max_delay: float = 30.0
    exponential_base: float = 2.0
    jitter: bool = True
    # Exception types that indicate a deterministic failure (bad input, config,
    # or validation error) rather than a transient one. Retrying these wastes
    # calls/turns without changing the outcome, so they're raised immediately
    # on first occurrence instead of being retried.
    non_retryable: Tuple[Type[BaseException], ...] = field(default_factory=tuple)

    def get_delay(self, attempt: int) -> float:
        """Calculate delay using exponential backoff with optional jitter"""
        delay = self.initial_delay * (self.exponential_base ** attempt)
        delay = min(delay, self.max_delay)

        if self.jitter:
            jitter_amount = delay * 0.1
            delay += random.uniform(-jitter_amount, jitter_amount)

        return max(0, delay)


class RetryHandler:
    """Handles retry logic for async operations"""

    @staticmethod
    async def execute(
        func: Callable[..., Any],
        *args,
        config: Optional[RetryConfig] = None,
        op_name: str = "operation",
        **kwargs
    ) -> Any:
        """
        Execute async function with exponential backoff retry.

        Args:
            func: Async function to execute
            config: Retry configuration
            op_name: Human-readable name for log messages (e.g. "main_agent classification")
            *args, **kwargs: Arguments for function

        Returns:
            Result of function call

        Raises:
            Exception: Immediately for any exception type listed in
                config.non_retryable; otherwise the last exception once all
                retries are exhausted.
        """
        if config is None:
            config = RetryConfig()

        last_exception = None

        for attempt in range(config.max_attempts):
            attempt_label = "initial attempt" if attempt == 0 else f"retry {attempt}"
            try:
                result = await func(*args, **kwargs)
                if attempt > 0:
                    logger.logger.info(
                        f"[RETRY] {op_name} succeeded on {attempt_label} "
                        f"({attempt + 1}/{config.max_attempts})"
                    )
                return result
            except config.non_retryable as e:
                logger.logger.error(
                    f"[RETRY] {op_name} failed on {attempt_label} with a "
                    f"non-retryable error ({type(e).__name__}): {str(e)} — "
                    f"not retrying, this input will not succeed on retry."
                )
                raise
            except Exception as e:
                last_exception = e

                if attempt < config.max_attempts - 1:
                    delay = config.get_delay(attempt)
                    logger.logger.warning(
                        f"[RETRY] {op_name} failed on {attempt_label} "
                        f"({attempt + 1}/{config.max_attempts}), "
                        f"retrying in {delay:.2f}s: {str(e)}"
                    )
                    await asyncio.sleep(delay)
                else:
                    logger.logger.error(
                        f"[RETRY] {op_name} failed on all {config.max_attempts} attempts: {str(e)}"
                    )

        raise last_exception


# Predefined retry configurations
AGGRESSIVE_RETRY = RetryConfig(
    max_attempts=5,
    initial_delay=0.5,
    max_delay=60.0
)

MODERATE_RETRY = RetryConfig(
    max_attempts=3,
    initial_delay=1.0,
    max_delay=30.0
)

GENTLE_RETRY = RetryConfig(
    max_attempts=2,
    initial_delay=2.0,
    max_delay=10.0
)
