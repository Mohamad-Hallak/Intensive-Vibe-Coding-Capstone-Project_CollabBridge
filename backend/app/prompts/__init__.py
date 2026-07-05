"""
prompts/__init__.py — CollabBridge Prompt Library
==================================================
Central registry of all prompts used by CollabBridge AI agents.

Design rationale:
- Centralizing prompts prevents duplication and drift between agents.
- Each module exposes a small set of well-documented prompt builder functions
  that take structured arguments and return formatted strings.
- Prompts are versioned via module docstrings.
- All prompt modules support multilingual output (English/Arabic).

Modules:
    researcher_prompts   Interview + extraction prompts for researcher onboarding
    project_prompts      Interview + extraction prompts for project onboarding
    matching_prompts     Explanation prompts for the 4-layer matching engine
    proposal_prompts     Proposal generation prompts
    impact_prompts       Impact assessment prompts
    funding_prompts      Funding opportunity search prompts
"""

from app.prompts.researcher_prompts import (
    RESEARCHER_SYSTEM_INSTRUCTION,
    build_researcher_question_prompt,
    build_researcher_extraction_prompt,
    build_researcher_summary_prompt,
)
from app.prompts.project_prompts import (
    PROJECT_OWNER_SYSTEM_INSTRUCTION,
    build_project_question_prompt,
    build_project_extraction_prompt,
    build_project_summary_prompt,
)
from app.prompts.matching_prompts import build_match_explanation_prompt
from app.prompts.proposal_prompts import build_proposal_prompt
from app.prompts.impact_prompts import build_impact_prompt
from app.prompts.funding_prompts import build_funding_prompt

__all__ = [
    "RESEARCHER_SYSTEM_INSTRUCTION",
    "build_researcher_question_prompt",
    "build_researcher_extraction_prompt",
    "build_researcher_summary_prompt",
    "PROJECT_OWNER_SYSTEM_INSTRUCTION",
    "build_project_question_prompt",
    "build_project_extraction_prompt",
    "build_project_summary_prompt",
    "build_match_explanation_prompt",
    "build_proposal_prompt",
    "build_impact_prompt",
    "build_funding_prompt",
]
