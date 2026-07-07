"""Data schemas for LegalyzeAI backend."""

# Document schemas
from .document import DocumentInsights, DocumentCheckOutput

# Analysis schemas
from .analysis import (
    RiskLevel,
    RiskCategory,
    RiskItem,
    SummaryOutput,
    RiskOutput,
    FinalOutput,
    AnalysisResult,
)

# Agent schemas
from .agent import SharedContext, AgentDecision, ProcessingStatus

# Security schemas
from .security import SensitiveCheckOutput, APIResponse

__all__ = [
    # Document
    "DocumentInsights",
    "DocumentCheckOutput",
    # Analysis
    "RiskLevel",
    "RiskCategory",
    "RiskItem",
    "SummaryOutput",
    "RiskOutput",
    "FinalOutput",
    "AnalysisResult",
    # Agent
    "SharedContext",
    "AgentDecision",
    "ProcessingStatus",
    # Security
    "SensitiveCheckOutput",
    "APIResponse",
]
