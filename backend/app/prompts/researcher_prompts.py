"""
researcher_prompts.py — Researcher Interview & Extraction Prompts
=================================================================
All prompts used by the Researcher Interview Agent (Agent 2) and the
Researcher Information Extraction Agent (Agent 4).

Prompt versioning:
    v1.0 — Initial implementation
    v1.1 — Added Arabic support, extended field coverage
    v1.2 — Structured JSON response_schema for option generation
    v2.0 — Centralized into prompt library (this module)

Design notes:
- System instructions are defined as module-level constants.
- Question prompts are built by functions so dynamic context (missing fields,
  conversation history, language) is always injected correctly.
- All prompts explicitly request only one question at a time to avoid
  overwhelming users during the interview flow.
"""

import json


# ---------------------------------------------------------------------------
# System Instruction (injected as system role in Gemini API calls)
# ---------------------------------------------------------------------------

RESEARCHER_SYSTEM_INSTRUCTION = (
    "You are an expert AI intake interviewer for academic researchers registering "
    "on CollabBridge — a platform connecting researchers with post-war Syrian "
    "reconstruction projects. "
    "Your style should feel exactly like talking with a warm, friendly, professional, "
    "encouraging human collaborator (like ChatGPT). "
    "Acknowledge the user's answers naturally and show genuine interest/encouragement "
    "before asking the next question. "
    "Ask only one question at a time. Adapt dynamically to avoid asking details already provided. "
    "Gently encourage elaboration if answers are very short, or give examples if the user "
    "seems uncertain. "
    "Besides basic details, proactively extract: motivation, novelty of research, "
    "technical approach, datasets, target beneficiaries, scalability potential, "
    "future vision, and collaboration opportunities."
)


# ---------------------------------------------------------------------------
# Question Generation Prompt
# ---------------------------------------------------------------------------

def build_researcher_question_prompt(
    history: list,
    extracted: dict,
    missing: list,
    lang: str = "en",
) -> str:
    """
    Build the prompt used to generate the next warm follow-up question
    for a researcher interview.

    Args:
        history:   Last N conversation turns as list of {role, content} dicts
        extracted: Already-extracted profile fields
        missing:   List of field names still needed
        lang:      'en' or 'ar'

    Returns:
        Formatted prompt string ready for the Gemini API.
    """
    lang_note = (
        "IMPORTANT: The user is speaking Arabic. Write your question and options "
        "in natural, warm Arabic."
        if lang == "ar"
        else "Write your question and options in natural, warm English."
    )

    history_text = "\n".join(
        f"{'User' if m.get('role') == 'user' else 'Assistant'}: {m.get('content', '')}"
        for m in history[-10:]
        if isinstance(m, dict)
    )

    clean_extracted = {k: v for k, v in extracted.items() if k != "__confirming__"}

    return (
        f"{lang_note}\n\n"
        f"Already extracted profile data: {json.dumps(clean_extracted, ensure_ascii=False)}\n"
        f"Missing fields still needed: {missing}\n\n"
        f"Recent conversation:\n{history_text}\n\n"
        f"Ask the next warm follow-up question to fill in the missing information. "
        f"If the question suits a multiple-choice reply (e.g., availability, funding expectations, "
        f"collaboration type, SDG alignment), include 2-6 short option strings. "
        f"Otherwise set options to null."
    )


# ---------------------------------------------------------------------------
# Information Extraction Prompt
# ---------------------------------------------------------------------------

def build_researcher_extraction_prompt(history: list, lang: str = "en") -> str:
    """
    Build the prompt used to extract structured profile data from the
    conversation transcript (Agent 4).

    Args:
        history: Full conversation history as list of {role, content} dicts
        lang:    'en' or 'ar'

    Returns:
        Formatted prompt string ready for the Gemini API.
    """
    conversation_text = "\n".join(
        f"{'User' if m.get('role') == 'user' else 'CollabBridge'}: {m.get('content', '')}"
        for m in history
        if isinstance(m, dict)
    )

    return (
        f"You are a precise data extraction agent for CollabBridge.\n"
        f"Extract ALL researcher profile information from the conversation below.\n"
        f"Return ONLY a valid JSON object with the researcher's profile fields.\n"
        f"If a field is not mentioned, use null or an empty array [].\n"
        f"Language of conversation: {lang}\n\n"
        f"Conversation:\n{conversation_text}\n\n"
        f"Extract into this structure: name, institution, country, nationality, "
        f"residing_country, is_syrian_diaspora, department, position, expertise, "
        f"skills (array), languages (array), publications (array), previous_projects (array), "
        f"availability, sdgs (array of ints), motivation, novelty_innovation, "
        f"technical_approach, target_beneficiaries, future_vision, collaboration_opportunities."
    )


# ---------------------------------------------------------------------------
# Profile Summary Prompt
# ---------------------------------------------------------------------------

def build_researcher_summary_prompt(extracted: dict, lang: str = "en") -> str:
    """
    Build the prompt used to generate a friendly markdown summary of the
    collected researcher profile, asking for final confirmation.

    Args:
        extracted: The extracted profile dict (without __confirming__ flag)
        lang:      'en' or 'ar'

    Returns:
        Formatted prompt string ready for the Gemini API.
    """
    lang_instruction = (
        "IMPORTANT: Write the entire summary and confirmation prompt in natural, "
        "warm, professional Arabic."
        if lang == "ar"
        else "Write in warm, professional English."
    )

    return (
        f"Generate a friendly, structured markdown summary of the following compiled "
        f"researcher profile data. Format it beautifully and clearly using bullet points "
        f"and categories. At the end, ask the user in a very warm manner to confirm if "
        f"this summary looks correct and complete, or if they would like to make any "
        f"adjustments.\n\n"
        f"Profile data: {json.dumps(extracted, ensure_ascii=False)}\n\n"
        f"{lang_instruction}"
    )
