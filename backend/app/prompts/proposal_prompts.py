"""
proposal_prompts.py — Collaboration Proposal Generation Prompts
===============================================================
Prompts used by the Proposal Generator Agent (Agent 7).
"""


def build_proposal_prompt(
    project_title: str,
    sector: str,
    description: str,
    location: str,
    budget: str,
    timeline: str,
    sdgs: str,
    team_members_str: str,
) -> str:
    """
    Build the prompt for generating a professional collaboration proposal.

    Args:
        project_title:    Title of the project
        sector:           Project sector
        description:      Problem description
        location:         Target location
        budget:           Budget estimate
        timeline:         Project timeline
        sdgs:             Target UN SDGs
        team_members_str: Markdown-formatted team member list

    Returns:
        Formatted prompt string for the Gemini API.
    """
    return (
        f"You are the CollabBridge Proposal Generator (Agent 7).\n"
        f"Generate a professional, detailed, and highly persuasive project proposal "
        f"markdown document for the following Syrian reconstruction project:\n\n"
        f"Project Title: {project_title}\n"
        f"Sector: {sector}\n"
        f"Description/Problem: {description}\n"
        f"Location: {location}\n"
        f"Estimated Budget: {budget}\n"
        f"Timeline: {timeline}\n"
        f"Target SDGs: {sdgs}\n\n"
        f"Assembled Team:\n{team_members_str}\n\n"
        f"Generate a document with sections: Executive Summary, Objectives & Deliverables, "
        f"Team Alignment, Resource & Budget Allocation, Risk Assessment & Mitigation, "
        f"SDGs Alignment, and Specific Funding Sources suited for post-war Syria "
        f"(UN agencies, bilateral aid, NGOs, diaspora funds). "
        f"Write in a professional academic tone. Do NOT include placeholders — "
        f"generate realistic, specific details."
    )
