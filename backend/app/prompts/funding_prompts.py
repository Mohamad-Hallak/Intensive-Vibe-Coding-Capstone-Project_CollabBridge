"""
funding_prompts.py — Funding Opportunity Search Prompts
=======================================================
Prompts used by the Funding Agent (Agent 11).
"""


def build_funding_prompt(
    focus_type: str,
    focus_title: str,
    focus_desc: str,
    lang: str = "en",
) -> str:
    """
    Build the prompt for finding matching international funding opportunities.

    Args:
        focus_type:  'Project: <title>' or 'Researcher: <name>'
        focus_title: Name of the project or researcher
        focus_desc:  Description or expertise summary
        lang:        'en' or 'ar'

    Returns:
        Formatted prompt string expecting a JSON array of opportunity objects.
    """
    return (
        f"You are the CollabBridge AI Funding Agent (Agent 11).\n"
        f"Your task is to find real or highly realistic ACTIVE funding opportunities, "
        f"research grants, or project calls from international bodies "
        f"(IEEE Humanitarian Activities Committee, UN Development Programme, USAID, "
        f"WHO, World Bank, European Commission, Horizon Europe, UNICEF, UNHCR) "
        f"matching this target:\n"
        f"Type: {focus_type}\n"
        f"Target Name: {focus_title}\n"
        f"Description/Expertise: {focus_desc}\n"
        f"Language: {lang}\n\n"
        f"Generate exactly 3 specific matched opportunities. Each MUST contain:\n"
        f"- 'title': The name of the funding call/grant.\n"
        f"- 'source': The funding agency name.\n"
        f"- 'amount': Estimated range (e.g. '$15,000 - $50,000').\n"
        f"- 'description': Short description of the grant criteria.\n"
        f"- 'deadline': ISO Date (YYYY-MM-DD) or clear date string.\n"
        f"- 'url': Official program page or agency homepage URL.\n"
        f"- 'match_reason': 1-2 sentences explaining why this matches this specific target.\n\n"
        f"Return ONLY a valid JSON array of objects. No markdown. "
        f"Ensure translations match the target language ({lang})."
    )
