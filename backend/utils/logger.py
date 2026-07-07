"""Structured logging for the application."""

import logging
from datetime import datetime


class StructuredLogger:
    """Structured logging with consistent formatting"""

    def __init__(self, name: str):
        """Initialize structured logger"""
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)

        # Setup handler if not already configured
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)

    def analysis_started(self, session_id: str, doc_size: int, doc_type: str = "unknown"):
        """Log analysis start"""
        self.logger.info(
            f"[ANALYSIS_STARTED] session={session_id}, "
            f"doc_size={doc_size}, doc_type={doc_type}"
        )

    def cache_hit(self, session_id: str):
        """Log cache hit"""
        self.logger.info(f"[CACHE_HIT] session={session_id}")

    def cache_miss(self, session_id: str):
        """Log cache miss"""
        self.logger.info(f"[CACHE_MISS] session={session_id}")

    def analysis_completed(
        self,
        session_id: str,
        processing_time: float,
        risks_found: int,
        cached: bool = False
    ):
        """Log analysis completion"""
        self.logger.info(
            f"[ANALYSIS_COMPLETED] session={session_id}, "
            f"time={processing_time:.2f}s, risks={risks_found}, cached={cached}"
        )

    def analysis_error(self, session_id: str, error: str, step: str = "unknown"):
        """Log analysis error"""
        self.logger.error(
            f"[ANALYSIS_ERROR] session={session_id}, step={step}, error={error}"
        )

    def pipeline_step(self, session_id: str, step: str, status: str):
        """Log pipeline step"""
        self.logger.info(
            f"[PIPELINE] session={session_id}, step={step}, status={status}"
        )

    def guardrail_triggered(self, session_id: str, guardrail_type: str, reason: str):
        """Log guardrail trigger"""
        self.logger.warning(
            f"[GUARDRAIL] session={session_id}, type={guardrail_type}, reason={reason}"
        )


# Global logger instance
logger = StructuredLogger("legalyze-ai")
