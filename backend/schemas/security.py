"""Security-related data schemas."""

from pydantic import BaseModel
from typing import List


class SensitiveCheckOutput(BaseModel):
    """Result of sensitive information check"""
    contains_sensitive_info: bool
    reasoning: str
    flagged_content_types: List[str] = []


class APIResponse(BaseModel):
    """Standard API response format"""
    success: bool
    message: str
    data: dict = None
    error: str = None
    timestamp: str = None
