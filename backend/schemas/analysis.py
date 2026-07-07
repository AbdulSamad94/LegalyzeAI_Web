"""Analysis result data schemas."""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    """Risk severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RiskCategory(str, Enum):
    """Risk categories"""
    FINANCIAL = "financial"
    LEGAL = "legal"
    OPERATIONAL = "operational"
    REPUTATIONAL = "reputational"
    STRATEGIC = "strategic"


class RiskItem(BaseModel):
    """A single identified risk"""
    description: str
    level: str
    category: str
    recommendation: str
    clause_reference: str = ""


class SummaryOutput(BaseModel):
    """Document summary"""
    summary: str
    key_points: List[str] = Field(default_factory=list)


class RiskOutput(BaseModel):
    """Risk assessment results"""
    risks: List[RiskItem] = Field(default_factory=list)
    overall_risk_level: str = "low"


class FinalOutput(BaseModel):
    """Complete analysis output"""
    summary: str
    risks: List[RiskItem] = Field(default_factory=list)
    verdict: str
    disclaimer: str = (
        "This analysis is for informational purposes only and does not constitute "
        "legal advice. Please consult with a qualified attorney."
    )
    confidence_score: float = 0.8
    processed_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class AnalysisResult(BaseModel):
    """Complete analysis session result"""
    type: str
    document_info: Dict[str, Any] = Field(default_factory=dict)
    analysis: Optional[FinalOutput] = None
    friendly_message: Optional[str] = None
    session_id: str
    processed_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    cached: bool = False
