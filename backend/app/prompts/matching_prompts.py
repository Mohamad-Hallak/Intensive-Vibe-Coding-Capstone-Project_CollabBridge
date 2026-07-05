"""
matching_prompts.py — Match Explanation Prompts
================================================
Prompts used by the Matching Agent (Agent 5) to generate human-readable
explanations of why a project and researcher are matched.
"""

import json
from typing import List


def build_match_explanation_prompt(
    project_title: str,
    project_sector: str,
    project_skills: List[str],
    researcher_name: str,
    researcher_expertise: str,
    researcher_skills: List[str],
    researcher_country: str,
    score: float,
    layers: dict,
) -> str:
    """
    Build the prompt used to explain a project-researcher match (Layer 4).

    The explanation includes specific strengths, weaknesses, and a confidence
    rating, returned as structured JSON.

    Args:
        project_title:        Title of the project
        project_sector:       Project sector (e.g., Water, Energy)
        project_skills:       Required skills list
        researcher_name:      Researcher's full name
        researcher_expertise: Researcher's expertise summary
        researcher_skills:    Researcher's skill list
        researcher_country:   Researcher's country
        score:                Final match score (0-100)
        layers:               Dict with semantic, metadata, adjustments sub-scores

    Returns:
        Formatted prompt string. Expected response is a JSON object with:
            overall_match, reasons (list), weaknesses (list), confidence
    """
    return (
        f"Write an explanation of the match between a reconstruction project "
        f"and a researcher.\n\n"
        f"Project: {project_title}\n"
        f"Project Sector: {project_sector}\n"
        f"Project Requirements: {', '.join(project_skills)}\n\n"
        f"Researcher: {researcher_name}\n"
        f"Researcher Expertise: {researcher_expertise}\n"
        f"Researcher Skills: {', '.join(researcher_skills)}\n"
        f"Researcher Country: {researcher_country}\n\n"
        f"Calculated Match Score: {score}%\n"
        f"Semantic similarity (embedding): {layers.get('semantic', 0)}%\n"
        f"Metadata alignment (weighted): {layers.get('metadata', 0)}%\n"
        f"Rule-based adjustments: {layers.get('adjustments', 0)} points\n\n"
        f"Respond with a JSON object matching this schema:\n"
        f'{{\n'
        f'  "overall_match": "92%",\n'
        f'  "reasons": ["✅ List of 3-4 specific bullet points explaining why they match"],\n'
        f'  "weaknesses": ["⚠️ List of 1-2 potential gaps or challenges"],\n'
        f'  "confidence": "High/Medium/Low"\n'
        f'}}\n'
        f"Ensure the response is ONLY valid JSON. Keep bullet points concise and professional."
    )
