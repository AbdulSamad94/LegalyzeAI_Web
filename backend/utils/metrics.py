"""Metrics and performance tracking for analysis operations."""

import logging
from typing import Optional


class MetricsLogger:
    """Structured logging for analysis metrics and performance tracking"""

    def __init__(self, name: str = "legalyze"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)

        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)

    def log_analysis_started(self, session_id: str, doc_size: int, doc_type: str = "unknown"):
        """Log when analysis starts"""
        self.logger.info(
            f"[ANALYSIS_STARTED] session={session_id}, "
            f"doc_size={doc_size}, doc_type={doc_type}"
        )

    def log_cache_hit(self, session_id: str):
        """Log when cache result is used"""
        self.logger.info(f"[CACHE_HIT] session={session_id}")

    def log_cache_miss(self, session_id: str):
        """Log when cache miss occurs"""
        self.logger.info(f"[CACHE_MISS] session={session_id}")

    def log_analysis_completed(
        self,
        session_id: str,
        processing_time: float,
        risks_found: int,
        tokens_used: Optional[int] = None,
        cost_usd: Optional[float] = None,
        cache_hit: bool = False
    ):
        """Log when analysis completes with metrics"""
        cost_str = f"${cost_usd:.4f}" if cost_usd is not None else "N/A"
        tokens_str = f"{tokens_used}" if tokens_used is not None else "N/A"
        self.logger.info(
            f"[ANALYSIS_COMPLETED] session={session_id}, "
            f"time={processing_time:.2f}s, risks={risks_found}, "
            f"tokens={tokens_str}, "
            f"cost={cost_str}, "
            f"cached={cache_hit}"
        )

    def log_analysis_error(self, session_id: str, error: str, step: str = "unknown"):
        """Log analysis errors"""
        self.logger.error(
            f"[ANALYSIS_ERROR] session={session_id}, step={step}, "
            f"error={error}"
        )

    def log_api_call(self, model: str, tokens_in: int, tokens_out: int, cost: float):
        """Log API calls for cost tracking"""
        self.logger.info(
            f"[API_CALL] model={model}, "
            f"tokens_in={tokens_in}, tokens_out={tokens_out}, "
            f"cost=${cost:.6f}"
        )

    def log_pipeline_step(self, session_id: str, step: str, status: str):
        """Log pipeline step completion"""
        self.logger.info(f"[PIPELINE] session={session_id}, step={step}, status={status}")

    def log_guardrail_triggered(self, session_id: str, guardrail_type: str, reason: str):
        """Log when guardrails are triggered"""
        self.logger.warning(
            f"[GUARDRAIL] session={session_id}, type={guardrail_type}, "
            f"reason={reason}"
        )


# Global metrics instance
metrics = MetricsLogger("legalyze-ai")
