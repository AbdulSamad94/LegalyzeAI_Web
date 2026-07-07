"""Agent definitions for specialized analysis tasks."""

from agents import Agent, ModelSettings
from infrastructure import model_manager
from schemas import RiskOutput, SummaryOutput, DocumentCheckOutput
from .agent_prompts import (
    SUMMARIZER_AGENT_PROMPT,
    RISK_AGENT_PROMPT,
    CLAUSE_AGENT_PROMPT,
    DOCUMENT_DETECTOR_PROMPT,
)

# `settings.openai.max_tokens` (1000) is tuned for short, fixed-size structured
# decisions. It silently truncates larger JSON outputs mid-generation, which
# then fails Pydantic validation and looks like a random "invalid JSON" model
# failure — confirmed live on real documents (see agent_factory.py). Content
# agents below need a much larger budget since their output size scales with
# document complexity (a summary, or a list of N risk items, or a detailed
# clause analysis, cannot be bounded to a fixed small token count).
classification_settings = model_manager.get_model_settings()
CONTENT_MAX_OUTPUT_TOKENS = 4096
content_settings = model_manager.get_model_settings(max_tokens=CONTENT_MAX_OUTPUT_TOKENS)

# Document detector agent - classifies if input is a legal document.
# Output (bool + short type string + short reasoning) is small and fixed-size.
document_detector_agent = Agent(
    name="DocumentDetector",
    instructions=DOCUMENT_DETECTOR_PROMPT,
    output_type=DocumentCheckOutput,
    model_settings=classification_settings,
)

# Summarizer agent - creates executive summary of documents
summarizer_agent = Agent(
    name="SummarizerAgent",
    instructions=SUMMARIZER_AGENT_PROMPT,
    output_type=SummaryOutput,
    model_settings=content_settings,
)

# Risk detector agent - identifies legal risks and concerns (output size scales
# with the number of risks found, most likely of the three to need the larger budget)
risk_detector_agent = Agent(
    name="RiskDetectorAgent",
    instructions=RISK_AGENT_PROMPT,
    output_type=RiskOutput,
    model_settings=content_settings,
)

# Clause checker agent - analyzes specific contract clauses
clause_checker_agent = Agent(
    name="ClauseCheckerAgent",
    instructions=CLAUSE_AGENT_PROMPT,
    output_type=str,
    model_settings=content_settings,
)
