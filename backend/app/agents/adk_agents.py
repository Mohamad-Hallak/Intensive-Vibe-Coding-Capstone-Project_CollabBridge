import json
import logging
from app.config import settings
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helper: direct Gemini call for approval detection
# ---------------------------------------------------------------------------
def _heuristic_approval(user_message: str) -> bool:
    user_msg_lower = user_message.lower()
    return any(ok in user_msg_lower for ok in ["yes", "looks good", "correct", "confirm", "approve", "ok", "\u0646\u0639\u0645", "\u0645\u0648\u0627\u0641\u0642", "\u0635\u062d\u064a\u062d"])


def check_user_approval(user_message: str) -> bool:
    if not settings.GEMINI_API_KEY or not settings.GEMINI_AVAILABLE:
        return _heuristic_approval(user_message)
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        res = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=(
                f"Check if the user is confirming or approving a summary they just read. "
                f"User message: '{user_message}'\n"
                f"If they say yes, looks good, it is correct, confirm, approve, or similar positive response in English or Arabic (e.g., \u0646\u0639\u0645, \u0635\u062d\u064a\u062d, \u0645\u0645\u062a\u0627\u0632, \u0645\u0648\u0627\u0641\u0642, \u0645\u0627\u0634\u064a), return 'yes'. "
                f"If they want to change, edit, correct something, or ask to modify details, return 'no'.\n"
                f"Return ONLY the word 'yes' or 'no'."
            )
        )
        return "yes" in res.text.strip().lower()
    except Exception as e:
        logger.error(f"check_user_approval error: {e}. Disabling Gemini for this session.")
        settings.GEMINI_AVAILABLE = False
        return _heuristic_approval(user_message)


# ---------------------------------------------------------------------------
# Helper: direct Gemini call for profile summary generation
# ---------------------------------------------------------------------------
def generate_profile_summary(extracted: dict, user_type: str, lang: str) -> str:
    # Remove internal flag before summarizing
    clean = {k: v for k, v in extracted.items() if k != "__confirming__"}
    if not settings.GEMINI_API_KEY or not settings.GEMINI_AVAILABLE:
        lines = [f"- **{k.replace('_', ' ').title()}**: {v}" for k, v in clean.items() if v]
        return "\n".join(lines)
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        prompt = (
            f"Generate a friendly, structured markdown summary of the following compiled {user_type} profile data. "
            f"Format it beautifully and clearly using bullet points and categories. "
            f"At the end, ask the user in a very warm manner to confirm if this summary looks correct and complete, or if they would like to make any adjustments.\n\n"
            f"Profile data: {json.dumps(clean, ensure_ascii=False)}\n\n"
            f"{'IMPORTANT: Write the entire summary and confirmation prompt in natural, warm, professional Arabic.' if lang == 'ar' else 'Write in warm, professional English.'}"
        )
        res = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt
        )
        return res.text
    except Exception as e:
        logger.error(f"generate_profile_summary error: {e}. Disabling Gemini for this session.")
        settings.GEMINI_AVAILABLE = False
        lines = [f"- **{k.replace('_', ' ').title()}**: {v}" for k, v in clean.items() if v]
        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Helper: direct Gemini call for next interview question (structured JSON)
# ---------------------------------------------------------------------------
def ask_next_question(history: list, extracted: dict, missing: list, user_type: str, lang: str) -> dict:
    """
    Calls Gemini with response_schema to produce the next warm interview question
    and optionally a list of quick-reply options.
    Returns a dict with keys 'question' and 'options'.
    """
    if not settings.GEMINI_API_KEY or not settings.GEMINI_AVAILABLE:
        return _fallback_next_question(history, extracted, missing, user_type, lang)

    if user_type == "researcher":
        system_instruction = (
            "You are an expert AI intake interviewer for academic researchers registering on CollabBridge. "
            "Your style should feel exactly like talking with a warm, friendly, professional, encouraging human collaborator (like ChatGPT). "
            "Acknowledge the user's answers naturally and show genuine interest/encouragement before asking the next question. "
            "Ask only one question at a time. Adapt dynamically to avoid asking details already provided. "
            "Gently encourage them to elaborate if they give very short replies, or give examples if they seem uncertain. "
            "Besides the basic details, seek to proactively extract their motivation, novelty of their research, technical approach, "
            "datasets, target beneficiaries, scalability potential, future vision, and collaboration opportunities."
        )
    else:
        system_instruction = (
            "You are an expert AI intake interviewer for project owners registering reconstruction challenges in Syria on CollabBridge. "
            "Your style should feel exactly like talking with a warm, friendly, professional, encouraging human collaborator (like ChatGPT) passionate about societal reconstruction. "
            "Acknowledge the user's answers naturally and show genuine interest/encouragement before asking the next question. "
            "Ask only one question at a time. Adapt dynamically to avoid asking details already provided. "
            "Gently encourage them to elaborate if they give very short replies, or give examples if they seem uncertain. "
            "Besides basic details, seek to proactively extract the motivation behind the project, novelty/innovation, current stage, "
            "technical approach, required equipment/facilities, funding/budget details, milestones, risks/mitigation, existing collaborators, "
            "datasets, software/hardware involved, target beneficiaries, scalability, and long-term future vision."
        )

    lang_note = (
        "IMPORTANT: The user is speaking Arabic. Write your question and options in natural, warm Arabic."
        if lang == "ar" else
        "Write your question and options in natural, warm English."
    )

    # Safe history text - handle both dicts and any unexpected types
    history_text = ""
    for m in history[-10:]:
        if isinstance(m, dict):
            role_label = "User" if m.get("role") == "user" else "Assistant"
            content = m.get("content", "")
            history_text += f"{role_label}: {content}\n"

    # Remove internal flags from extracted before passing to Gemini
    clean_extracted = {k: v for k, v in extracted.items() if k != "__confirming__"}

    user_prompt = (
        f"{lang_note}\n\n"
        f"Already extracted profile data: {json.dumps(clean_extracted, ensure_ascii=False)}\n"
        f"Missing fields still needed: {missing}\n\n"
        f"Recent conversation:\n{history_text}\n"
        f"Ask the next warm follow-up question to fill in the missing information. "
        f"If the question suits a multiple-choice reply (e.g. sector, SDG, collaboration style, availability, budget range), "
        f"include 2-6 short option strings. Otherwise set options to null."
    )

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
                response_mime_type="application/json",
                response_schema={
                    "type": "object",
                    "properties": {
                        "question": {"type": "string"},
                        "options": {
                            "type": "array",
                            "items": {"type": "string"},
                        }
                    },
                    "required": ["question", "options"]
                }
            )
        )
        data = json.loads(response.text)
        opts = data.get("options") or None  # convert empty list [] to None
        return {"question": data.get("question", ""), "options": opts}
    except Exception as e:
        print(f"[adk_agents] ask_next_question structured error: {e}", flush=True)
        logger.error(f"ask_next_question error: {e}")
        # Fallback: plain Gemini call without schema
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            fallback_prompt = (
                f"{system_instruction}\n\n{lang_note}\n\n"
                f"Conversation so far:\n{history_text}\n"
                f"Ask the next warm follow-up question to help complete the profile. Missing fields: {missing}\n"
                f"Reply with ONLY the question text, nothing else."
            )
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=fallback_prompt,
            )
            return {"question": response.text.strip(), "options": None}
        except Exception as e2:
            print(f"[adk_agents] ask_next_question fallback error: {e2}", flush=True)
            logger.error(f"ask_next_question fallback error: {e2}. Disabling Gemini for this session.")
            settings.GEMINI_AVAILABLE = False
            return _fallback_next_question(history, extracted, missing, user_type, lang)


def _fallback_next_question(history: list, extracted: dict, missing: list, user_type: str, lang: str) -> dict:
    """
    Deterministic fallback used when Gemini is unavailable (no key, or the key
    is failing/restricted). Delegates to the per-agent canned question sequences
    so the interview still progresses through all required fields.
    """
    clean_extracted = {k: v for k, v in extracted.items() if k != "__confirming__"}
    if user_type == "researcher":
        from app.agents.researcher_agent import generate_next_question as _gen_q
    else:
        from app.agents.project_agent import generate_next_question as _gen_q
    question, options = _gen_q(history, clean_extracted, missing, lang)
    return {"question": question, "options": options}


# ---------------------------------------------------------------------------
# Core conversation handler - replaces the broken ADK Workflow/Event/Runner
# Called directly by orchestrator.handle_message
# No ADK involved - avoids all Event content-type bugs ('str has no attr role')
# ---------------------------------------------------------------------------
async def run_collabbridge_interview(session, user_message: str, db) -> dict:
    """
    Stateless conversation engine. Reads/writes state via the DB ChatSession.
    Returns a response dict compatible with ChatResponse schema.
    """
    history = session.get_history()
    user_type = session.user_type
    lang = session.lang or "en"

    # Add the incoming user message to working history
    history.append({"role": "user", "content": user_message})

    # -----------------------------------------------------------------------
    # Phase 1: Detect user type if unknown
    # -----------------------------------------------------------------------
    if not user_type:
        from app.agents.orchestrator import detect_user_type
        detected = detect_user_type(user_message)
        if detected and detected != "unknown":
            session.user_type = detected
            session.active_agent = f"{detected}_interview"
            user_type = detected
            if detected == "researcher":
                if lang == "ar":
                    reply = (
                        "\u0623\u0647\u0644\u0627\u064b \u0648\u0633\u0647\u0644\u0627\u064b! \U0001f393 \u064a\u0633\u0639\u062f\u0646\u064a \u0644\u0642\u0627\u0624\u0643! \u0623\u0646\u0627 \u0647\u0646\u0627 \u0644\u0645\u0633\u0627\u0639\u062f\u062a\u0643 \u0641\u064a \u0628\u0646\u0627\u0621 \u0645\u0644\u0641\u0643 \u0627\u0644\u062a\u0639\u0631\u064a\u0641\u064a.\n\n"
                        "\u062f\u0639\u0646\u0627 \u0646\u0628\u062f\u0623! **\u0645\u0627 \u0647\u0648 \u0627\u0633\u0645\u0643 \u0627\u0644\u0643\u0627\u0645\u0644 \u0648\u0645\u0627 \u0647\u0648 \u0645\u0646\u0635\u0628\u0643 \u0627\u0644\u0623\u0643\u0627\u062f\u064a\u0645\u064a \u0623\u0648 \u0627\u0644\u0645\u0647\u0646\u064a \u0627\u0644\u062d\u0627\u0644\u064a\u061f**"
                    )
                else:
                    reply = (
                        "Welcome, **Researcher**! \U0001f393 Wonderful to have you here!\n\n"
                        "I'll ask you a few friendly questions to build your expert profile.\n\n"
                        "Let's start: **What is your full name and your current academic or professional position?**"
                    )
            else:
                if lang == "ar":
                    reply = (
                        "\u0623\u0647\u0644\u0627\u064b \u0648\u0633\u0647\u0644\u0627\u064b! \U0001f3d7\ufe0f \u064a\u0633\u0639\u062f\u0646\u064a \u062c\u062f\u0627\u064b \u0623\u0646\u0643 \u0647\u0646\u0627! \u0633\u0623\u0633\u0627\u0639\u062f\u0643 \u0641\u064a \u062a\u0633\u062c\u064a\u0644 \u0645\u0634\u0631\u0648\u0639\u0643.\n\n"
                        "**\u0645\u0627 \u0647\u0648 \u0639\u0646\u0648\u0627\u0646 \u0645\u0634\u0631\u0648\u0639\u0643 \u0648\u0645\u0627 \u0647\u0648 \u0627\u0644\u0642\u0637\u0627\u0639 \u0627\u0644\u0630\u064a \u064a\u063a\u0637\u064a\u0647\u061f**"
                    )
                else:
                    reply = (
                        "Welcome, **Project Owner**! \U0001f3d7\ufe0f Excited to help register your reconstruction project!\n\n"
                        "**What is the title of your project and which sector does it cover?** (e.g., Infrastructure, Water, Energy, Agriculture)"
                    )
            history.append({"role": "assistant", "content": reply})
            session.set_history(history)
            db.commit()
            return {
                "session_id": session.session_id,
                "response": reply,
                "active_agent": session.active_agent,
                "completed": False,
                "profile": session.get_profile() or {},
                "options": None
            }
        else:
            clarification = (
                "I want to make sure I connect you with the right interview. "
                "Could you clarify: are you a **Researcher** who wants to register your expertise, "
                "or a **Project Owner** who needs research support for a project?"
            )
            history.append({"role": "assistant", "content": clarification})
            session.set_history(history)
            db.commit()
            return {
                "session_id": session.session_id,
                "response": clarification,
                "active_agent": "manager",
                "completed": False,
                "profile": session.get_profile() or {},
                "options": ["I am a Researcher", "I am a Project Owner"] if lang != "ar" else ["\u0623\u0646\u0627 \u0628\u0627\u062d\u062b", "\u0623\u0646\u0627 \u0635\u0627\u062d\u0628 \u0645\u0634\u0631\u0648\u0639"]
            }

    # -----------------------------------------------------------------------
    # Phase 2: Interview flow
    # -----------------------------------------------------------------------
    current_profile = session.get_profile() or {}
    confirming = current_profile.get("__confirming__", False)

    if user_type == "researcher":
        from app.agents.researcher_agent import extract_researcher_data, REQUIRED_FIELDS as RES_REQUIRED_FIELDS, save_researcher_to_db
        if confirming:
            # Already summarized and awaiting yes/no — don't re-scan the transcript, since a
            # confirmation reply (or the summary itself) can be misread as new field answers.
            extracted = {k: v for k, v in current_profile.items() if k != "__confirming__"}
        else:
            extracted = extract_researcher_data(history)
        extracted["__confirming__"] = confirming
        session.set_profile(extracted)
        db.commit()

        missing = [f for f in RES_REQUIRED_FIELDS if not extracted.get(f)]
        assistant_q_count = sum(1 for m in history if isinstance(m, dict) and m.get("role") == "assistant")
        is_ready_to_confirm = len(missing) == 0 or assistant_q_count >= 15

        user_msg_lower = user_message.lower()
        if any(term in user_msg_lower for term in ["finish", "complete", "save", "\u0627\u0646\u062a\u0647\u064a\u062a", "\u062d\u0641\u0638"]):
            is_ready_to_confirm = True

        if confirming:
            if check_user_approval(user_message):
                session.completed = True
                save_researcher_to_db(extracted, db)
                extracted["__confirming__"] = False
                session.set_profile(extracted)
                db.commit()
                finish_text = (
                    f"Thank you so much, **{extracted.get('name', 'Researcher')}**! Your academic profile has been registered successfully. \U0001f389\n\n"
                    "Your skills and expertise are now in our expert database. Check the **Dashboard** to see collaboration analytics!"
                )
                if lang == "ar":
                    finish_text = (
                        f"\u0634\u0643\u0631\u0627\u064b \u062c\u0632\u064a\u0644\u0627\u064b \u0644\u0643\u060c **{extracted.get('name', '\u0623\u064a\u0647\u0627 \u0627\u0644\u0628\u0627\u062d\u062b')}**! \u0644\u0642\u062f \u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0645\u0644\u0641\u0643 \u0628\u0646\u062c\u0627\u062d. \U0001f389\n\n"
                        "\u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0622\u0646 \u0631\u0624\u064a\u0629 \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a \u0641\u064a **\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645**!"
                    )
                history.append({"role": "assistant", "content": finish_text})
                session.set_history(history)
                db.commit()
                return {
                    "session_id": session.session_id,
                    "response": finish_text,
                    "active_agent": "researcher_interview",
                    "completed": True,
                    "profile": extracted,
                    "options": None
                }
            else:
                extracted["__confirming__"] = False
                session.set_profile(extracted)
                db.commit()
                confirming = False
                is_ready_to_confirm = False

        if is_ready_to_confirm and not confirming:
            summary = generate_profile_summary(extracted, "researcher", lang)
            extracted["__confirming__"] = True
            session.set_profile(extracted)
            db.commit()
            options = (
                ["Yes, looks good!", "No, I want to edit some details"]
                if lang != "ar" else
                ["\u0646\u0639\u0645\u060c \u0643\u0644 \u0634\u064a\u0621 \u0635\u062d\u064a\u062d", "\u0644\u0627\u060c \u0623\u0631\u064a\u062f \u062a\u0639\u062f\u064a\u0644 \u0628\u0639\u0636 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644"]
            )
            history.append({"role": "assistant", "content": summary})
            session.set_history(history)
            db.commit()
            return {
                "session_id": session.session_id,
                "response": summary,
                "active_agent": "researcher_interview",
                "completed": False,
                "profile": extracted,
                "options": options
            }

        result = ask_next_question(history, extracted, missing, "researcher", lang)
        reply = result["question"]
        options = result.get("options")
        history.append({"role": "assistant", "content": reply})
        session.set_history(history)
        db.commit()
        return {
            "session_id": session.session_id,
            "response": reply,
            "active_agent": "researcher_interview",
            "completed": False,
            "profile": extracted,
            "options": options
        }

    else:  # project_owner
        from app.agents.project_agent import extract_project_data, REQUIRED_FIELDS as PROJ_REQUIRED_FIELDS, save_project_to_db
        if confirming:
            # Already summarized and awaiting yes/no — don't re-scan the transcript, since a
            # confirmation reply (or the summary itself) can be misread as new field answers.
            extracted = {k: v for k, v in current_profile.items() if k != "__confirming__"}
        else:
            extracted = extract_project_data(history)
        extracted["__confirming__"] = confirming
        session.set_profile(extracted)
        db.commit()

        missing = [f for f in PROJ_REQUIRED_FIELDS if not extracted.get(f)]
        assistant_q_count = sum(1 for m in history if isinstance(m, dict) and m.get("role") == "assistant")
        is_ready_to_confirm = len(missing) == 0 or assistant_q_count >= 15

        user_msg_lower = user_message.lower()
        if any(term in user_msg_lower for term in ["finish", "complete", "save", "\u0627\u0646\u062a\u0647\u064a\u062a", "\u062d\u0641\u0638"]):
            is_ready_to_confirm = True

        if confirming:
            if check_user_approval(user_message):
                session.completed = True
                save_project_to_db(extracted, db)
                extracted["__confirming__"] = False
                session.set_profile(extracted)
                db.commit()
                finish_text = (
                    f"Thank you! Your project **{extracted.get('project_title', 'Reconstruction Project')}** has been registered successfully. \U0001f389\n\n"
                    "You can now find matched researchers and experts on the **Match Finder** page!"
                )
                if lang == "ar":
                    finish_text = (
                        f"\u0634\u0643\u0631\u0627\u064b \u0644\u0643! \u0644\u0642\u062f \u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0645\u0634\u0631\u0648\u0639 **{extracted.get('project_title', '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0625\u0639\u0645\u0627\u0631')}** \u0628\u0646\u062c\u0627\u062d. \U0001f389\n\n"
                        "\u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0622\u0646 \u0627\u0644\u0627\u0646\u062a\u0642\u0627\u0644 \u0625\u0644\u0649 **\u0645\u0643\u062a\u0634\u0641 \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0627\u062a** \u0644\u0644\u0628\u062d\u062b \u0639\u0646 \u062e\u0628\u0631\u0627\u0621 \u0645\u0644\u0627\u0626\u0645\u064a\u0646!"
                    )
                history.append({"role": "assistant", "content": finish_text})
                session.set_history(history)
                db.commit()
                return {
                    "session_id": session.session_id,
                    "response": finish_text,
                    "active_agent": "project_interview",
                    "completed": True,
                    "profile": extracted,
                    "options": None
                }
            else:
                extracted["__confirming__"] = False
                session.set_profile(extracted)
                db.commit()
                confirming = False
                is_ready_to_confirm = False

        if is_ready_to_confirm and not confirming:
            summary = generate_profile_summary(extracted, "project owner", lang)
            extracted["__confirming__"] = True
            session.set_profile(extracted)
            db.commit()
            options = (
                ["Yes, looks good!", "No, I want to edit some details"]
                if lang != "ar" else
                ["\u0646\u0639\u0645\u060c \u0643\u0644 \u0634\u064a\u0621 \u0635\u062d\u064a\u062d", "\u0644\u0627\u060c \u0623\u0631\u064a\u062f \u062a\u0639\u062f\u064a\u0644 \u0628\u0639\u0636 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644"]
            )
            history.append({"role": "assistant", "content": summary})
            session.set_history(history)
            db.commit()
            return {
                "session_id": session.session_id,
                "response": summary,
                "active_agent": "project_interview",
                "completed": False,
                "profile": extracted,
                "options": options
            }

        result = ask_next_question(history, extracted, missing, "project_owner", lang)
        reply = result["question"]
        options = result.get("options")
        history.append({"role": "assistant", "content": reply})
        session.set_history(history)
        db.commit()
        return {
            "session_id": session.session_id,
            "response": reply,
            "active_agent": "project_interview",
            "completed": False,
            "profile": extracted,
            "options": options
        }
