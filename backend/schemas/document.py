"""Document-related data schemas."""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class DocumentInsights(BaseModel):
    """Insights extracted from a document"""
    word_count: int
    character_count: int
    estimated_pages: int
    estimated_read_time: int
    document_type: str = ""
    confidence_score: float = 0.0


class DocumentCheckOutput(BaseModel):
    """Result of document classification"""
    is_legal_document: bool
    document_type: str
    reasoning: str
    confidence_score: float
