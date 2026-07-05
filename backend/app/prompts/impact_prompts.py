"""
impact_prompts.py — Impact Assessment Prompts
=============================================
Prompts used by the Impact Assessment Agent (Agent 8).
"""


def build_impact_prompt(
    project_title: str,
    sector: str,
    description: str,
    sdgs: str,
) -> str:
    """
    Build the prompt for assessing multi-dimensional societal impact.

    Args:
        project_title: Title of the project
        sector:        Project sector
        description:   Project description
        sdgs:          Target UN SDGs

    Returns:
        Formatted prompt string expecting a JSON response with scores and summary.
    """
    return (
        f"You are the CollabBridge Impact Assessment Agent (Agent 8).\n"
        f"Estimate the societal impact of this post-war Syrian reconstruction project:\n"
        f"Title: {project_title}\n"
        f"Sector: {sector}\n"
        f"Description: {description}\n"
        f"Target SDGs: {sdgs}\n\n"
        f"Estimate a score from 0.0 to 10.0 for each dimension: "
        f"Social, Environmental, Economic, Innovation, Feasibility, Scalability.\n"
        f"Write a 3-4 sentence 'summary' explaining the scores and how the project "
        f"aligns with the relevant UN Sustainable Development Goals.\n\n"
        f"Respond with a JSON object matching this schema:\n"
        f'{{\n'
        f'  "scores": {{\n'
        f'    "Social": 8.5,\n'
        f'    "Environmental": 9.2,\n'
        f'    "Economic": 7.0,\n'
        f'    "Innovation": 8.0,\n'
        f'    "Feasibility": 6.5,\n'
        f'    "Scalability": 7.5\n'
        f'  }},\n'
        f'  "summary": "Detailed textual summary explaining impact and SDG alignment..."\n'
        f'}}\n'
        f"Ensure the output is ONLY valid JSON."
    )
