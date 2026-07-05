import json
import logging
from sqlalchemy.orm import Session
from app.database import ChatSession, Project, Researcher, get_db
from app.config import settings
from google import genai
from app.agents.project_agent import run_project_interview
from app.agents.researcher_agent import run_researcher_interview

logger = logging.getLogger(__name__)

async def handle_message(session_id: str, message: str, db: Session) -> dict:
    """
    Conversation Manager: Fetches/creates the session, handles interruptions,
    then delegates to run_collabbridge_interview for all interview logic.
    """
    # 1. Fetch or create session
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        session = ChatSession(
            session_id=session_id,
            user_id=None,
            user_type=None,
            active_agent="manager",
            chat_history=json.dumps([]),
            extracted_profile=json.dumps({}),
            completed=False
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    history = session.get_history()

    # 2. Check for meta/interruption questions first (only if user type already known)
    if session.user_type:
        is_interruption, interruption_reply = handle_interruptions(message, history)
        if is_interruption:
            history.append({"role": "user", "content": message})
            history.append({"role": "assistant", "content": interruption_reply})
            session.set_history(history)
            db.commit()
            return {
                "session_id": session_id,
                "response": interruption_reply,
                "active_agent": session.active_agent,
                "completed": session.completed,
                "profile": session.get_profile()
            }

    # 3. Route to the interview engine
    #    run_collabbridge_interview appends messages to history itself, no pre-append needed.
    from app.agents.adk_agents import run_collabbridge_interview
    result = await run_collabbridge_interview(session, message, db)
    return result

def detect_user_type(text: str) -> str:
    """
    Heuristics & LLM classification to identify if user is a researcher or project owner.
    """
    text_lower = text.lower()
    
    # Quick heuristics
    researcher_keywords = ["researcher", "professor", "phd", "academic", "student", "engineer", "scientist", "study", "expert", "teach"]
    owner_keywords = ["project", "ngo", "organization", "ministry", "municipality", "startup", "challenge", "need help", "problem", "solve"]
    
    researcher_hits = sum(1 for kw in researcher_keywords if kw in text_lower)
    owner_hits = sum(1 for kw in owner_keywords if kw in text_lower)
    
    if researcher_hits > owner_hits and researcher_hits > 0:
        return "researcher"
    if owner_hits > researcher_hits and owner_hits > 0:
        return "project_owner"

    if not settings.GEMINI_API_KEY or not settings.GEMINI_AVAILABLE:
        # Fallback to defaults or simple heuristics
        if "research" in text_lower or "expert" in text_lower or "cv" in text_lower:
            return "researcher"
        return "project_owner" # Default fallback for ambiguous cases

    # Use LLM classification
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=(
                f"Classify the following user input into either 'researcher' or 'project_owner'. "
                f"A researcher is someone who wants to share their research background, publications, or skills. "
                f"A project owner represents an NGO, university, or company that has a challenge/project they need help with. "
                f"Return ONLY the word 'researcher' or 'project_owner'. If highly uncertain, return 'unknown'.\n\n"
                f"User input: {text}"
            )
        )
        result = response.text.strip().lower()
        if "researcher" in result:
            return "researcher"
        elif "project" in result or "owner" in result:
            return "project_owner"
    except Exception as e:
        logger.error(f"Error detecting user type: {e}. Disabling Gemini for this session.")
        settings.GEMINI_AVAILABLE = False
        if "research" in text_lower or "expert" in text_lower or "cv" in text_lower:
            return "researcher"
        return "project_owner"

    return "unknown"

def handle_interruptions(message: str, history: list) -> tuple[bool, str]:
    """
    Detects if the user is asking an out-of-scope/interruption question (e.g. "what is this tool?", "who made you?", "tell me about Syria")
    and answers it, then routes them back.
    """
    text_lower = message.lower()
    
    # Interruption triggers
    triggers = [
        "what is this", "how does it work", "who are you", "what is collabbridge",
        "tell me about syria", "why syria", "help", "who made you", "what agents do you have"
    ]
    
    is_trigger = any(trig in text_lower for trig in triggers)
    if not is_trigger:
        return False, ""

    mock_reply = (
        "CollabBridge AI is a multi-agent system matching researchers with reconstruction projects in Syria. "
        "Let's get back to setting up your profile! Could you please answer the last question I asked?"
    )

    if not settings.GEMINI_API_KEY or not settings.GEMINI_AVAILABLE:
        return True, mock_reply

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=(
                f"The user has interrupted an intake interview with this message: '{message}'. "
                f"CollabBridge AI is a multi-agent platform connecting researchers with post-war Syrian reconstruction challenges. "
                f"Answer the user's question briefly and politely in 2-3 sentences. "
                f"Then, gently guide them back to completing their registration profile."
            )
        )
        return True, response.text
    except Exception as e:
        logger.error(f"Error handling interruption: {e}. Disabling Gemini for this session.")
        settings.GEMINI_AVAILABLE = False
        return True, mock_reply
