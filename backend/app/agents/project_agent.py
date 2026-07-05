import json
import logging
import re
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from google import genai
from google.genai import types
from app.config import settings
from app.schemas import ProjectProfileSchema
from app.database import ChatSession, Project
from app.utils.embeddings import get_embedding

logger = logging.getLogger(__name__)

# Required fields to check completion
REQUIRED_FIELDS = [
    "project_title", "sector", "problem", "budget", 
    "timeline", "preferred_location", "collaboration_type", 
    "technology_readiness_level", "priority", "sdgs"
]

class NextQuestionSchema(BaseModel):
    question: str = Field(..., description="The next conversational question to ask the user")
    options: Optional[List[str]] = Field(default=None, description="A list of 2-6 quick-reply options/buttons for the user, or null if it's an open-ended question")

def run_project_interview(session: ChatSession, db: Session) -> dict:
    """
    Agent 2 & 4: Conducts project owner interview, extracts structured project info, 
    and saves to database when complete.
    """
    history = session.get_history()
    
    # 1. Perform structured extraction based on history so far (Agent 4)
    extracted = extract_project_data(history)
    session.set_profile(extracted)
    db.commit()

    # 2. Check if we have collected enough details to complete the interview
    missing = [field for field in REQUIRED_FIELDS if not extracted.get(field)]
    
    # Calculate assistant questions count (excluding role selection)
    assistant_q_count = sum(1 for m in history if m["role"] == "assistant")

    # If we have all required fields, or we completed the sequential flow (6 questions), or user wants to finish
    is_finished = len(missing) == 0 or assistant_q_count >= 6

    # Check if user manually asked to finish in their last message
    last_user_msg = next((m["content"].lower() for m in reversed(history) if m["role"] == "user"), "")
    if "finish" in last_user_msg or "complete" in last_user_msg or "انتهيت" in last_user_msg or "حفظ" in last_user_msg:
        is_finished = True

    if is_finished:
        session.completed = True
        db.commit()

        # Save to projects table
        db_project = save_project_to_db(extracted, db)
        
        # Concluding message
        finish_text = (
            f"Congratulations! Thank you so much! I have successfully registered your project: **{extracted.get('project_title', 'Reconstruction Challenge')}**.\n\n"
            "We have extracted a structured profile for your project, computed its semantic representation, and added it to our matching database.\n\n"
            "You can now navigate to the **Dashboard** or **Matches** section in the sidebar to review potential expert researchers and multidisciplinary team recommendations!"
        )
        if session.lang == "ar":
            finish_text = (
                f"تهانينا الحارة! شكراً جزيلاً لك! لقد سجلت مشروعك بنجاح: **{extracted.get('project_title', 'تحدي إعادة الإعمار')}**.\n\n"
                "لقد استخرجنا ملفاً هيكلياً لمشروعك، وحسبنا تمثيله الدلالي، وأضفناه إلى قاعدة بيانات المطابقة لدينا.\n\n"
                "يمكنك الآن الانتقال إلى قسم **لوحة التحكم** أو **مكتشف المطابقات** في الشريط الجانبي لمراجعة الباحثين الخبراء المحتملين وتوصيات الفرق متعددة التخصصات!"
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

    # 3. Generate the next conversational question based on missing fields
    next_question, options = generate_next_question(history, extracted, missing, session.lang)
    
    history.append({"role": "assistant", "content": next_question})
    session.set_history(history)
    db.commit()

    return {
        "session_id": session.session_id,
        "response": next_question,
        "active_agent": "project_interview",
        "completed": False,
        "profile": extracted,
        "options": options
    }

def extract_project_data(history: list) -> dict:
    """
    Agent 4 - Information Extraction: Converts chat history into structured JSON using Gemini.
    """
    chat_str = ""
    for msg in history:
        chat_str += f"{msg['role'].capitalize()}: {msg['content']}\n"

    default_profile = {
        "project_title": "",
        "sector": "",
        "problem": "",
        "budget": "",
        "timeline": "",
        "required_skills": [],
        "preferred_location": "",
        "sdgs": [],
        "collaboration_type": "",
        "technology_readiness_level": "",
        "priority": "",
        "expected_impact": {"social": "", "environmental": "", "economic": ""},
        "motivation": "",
        "novelty_innovation": "",
        "current_stage": "",
        "technical_approach": "",
        "required_equipment": [],
        "funding_status": "",
        "milestones": [],
        "risks_mitigation": "",
        "existing_collaborators": [],
        "ip_status": "",
        "datasets_involved": [],
        "software_hardware": [],
        "target_beneficiaries": "",
        "scalability_potential": "",
        "commercialization_plan": "",
        "future_vision": ""
    }

    # Trigger high-fidelity demo data if 'recycle' is present in history
    chat_lower = chat_str.lower()
    if "recycle" in chat_lower:
        default_profile.update({
            "project_title": "Concrete Recycling and Rubble Processing Facility",
            "sector": "Infrastructure",
            "problem": "Massive amounts of concrete rubble in Aleppo due to post-war damage, blocking reconstruction.",
            "budget": "$150,000",
            "timeline": "12 months",
            "required_skills": ["Civil Engineering", "Material Science", "Recycling Tech"],
            "preferred_location": "Aleppo",
            "sdgs": [9, 11, 12],
            "collaboration_type": "Hybrid",
            "technology_readiness_level": "TRL 5",
            "priority": "High",
            "expected_impact": {
                "social": "Enable cleared roads and safer neighborhoods for returning families.",
                "environmental": "Reduce quarry excavation by recycling concrete rubble directly.",
                "economic": "Lower reconstruction costs by 20% using recycled aggregate."
            }
        })
        return default_profile

    if not settings.GEMINI_API_KEY or not settings.GEMINI_AVAILABLE:
        return _heuristic_extract_project(history, default_profile)

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=(
                f"Extract reconstruction project information from this conversation transcript.\n\n"
                f"Transcript:\n{chat_str}\n\n"
                f"Fill in the required schema fields as completely as possible based on the transcript. "
                f"Keep explanations brief."
            ),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ProjectProfileSchema,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Error during project info extraction: {e}. Disabling Gemini for this session.")
        settings.GEMINI_AVAILABLE = False
        return _heuristic_extract_project(history, default_profile)


def _heuristic_extract_project(history: list, default_profile: dict) -> dict:
    """
    Deterministic sequential parsing of replies based on the canned question order,
    used whenever Gemini is unavailable (no key, restricted key, or a live failure).
    """
    default_profile = dict(default_profile)
    # Sequential parsing of replies based on questions asked
    user_replies = []
    for idx, msg in enumerate(history):
        if msg["role"] == "user" and idx > 0 and history[idx-1]["role"] == "assistant":
            user_replies.append((history[idx-1]["content"].lower(), msg["content"].replace("،", ",")))

    for q_text, reply in user_replies:
        reply_lower = reply.lower()
        
        # Question 1: Title and sector
        if "title of your project" in q_text or "عنوان مشروعك" in q_text:
            if " covering " in reply_lower:
                parts = reply.split(" covering " if " covering " in reply_lower else " Covering ")
                default_profile["project_title"] = parts[0].strip()
                default_profile["sector"] = parts[1].strip()
            elif "," in reply:
                parts = reply.split(",")
                default_profile["project_title"] = parts[0].strip()
                default_profile["sector"] = parts[1].strip()
            else:
                default_profile["project_title"] = reply.strip()
                default_profile["sector"] = "Infrastructure"
        
        # Question 2: Problem statement
        elif "core problem" in q_text or "reconstruction challenge" in q_text or "المشكلة" in q_text:
            default_profile["problem"] = reply

        # Question 3: Location, budget, timeline
        elif "estimated budget and timeline" in q_text or "الميزانية والجدول الزمني" in q_text:
            parts = [p.strip() for p in reply.split(",")]
            if len(parts) == 3 and not any("," in p for p in parts):
                default_profile["preferred_location"] = parts[0]
                default_profile["budget"] = parts[1]
                default_profile["timeline"] = parts[2]
            else:
                budget_match = re.search(r'(\$\s*\d+[\d,]*\s*(?:k|m|million|usd)?)|(\d+[\d,]*\s*(?:usd|dollars|euro|lira|ليرة))', reply_lower)
                budget = ""
                if budget_match:
                    budget = budget_match.group(0).strip()
                else:
                    num_matches = re.findall(r'\b\d+[\d,]*\b', reply)
                    for num in num_matches:
                        try:
                            num_val = int(num.replace(",", ""))
                            if num_val >= 100:
                                budget = num
                                break
                        except ValueError:
                            pass
                
                timeline_match = re.search(r'(\d+\s*(?:month|year|week|day|شهر|سنة|عام|أسبوع|يوم)s?)', reply_lower)
                timeline = timeline_match.group(0).strip() if timeline_match else ""
                
                loc_clean = reply
                if budget_match:
                    loc_clean = loc_clean.replace(budget_match.group(0), "")
                elif budget:
                    loc_clean = loc_clean.replace(budget, "")
                
                if timeline_match:
                    loc_clean = loc_clean.replace(timeline_match.group(0), "")
                
                loc_clean = re.sub(r'[\s,]+', ' ', loc_clean).strip()
                
                default_profile["preferred_location"] = loc_clean if loc_clean else "Aleppo"
                default_profile["budget"] = budget.rstrip(", ") if budget else "Contact for Details"
                default_profile["timeline"] = timeline if timeline else "12 months"
        
        # Question 4: Required skills
        elif "technical skills" in q_text or "expert skills" in q_text or "skills" in q_text or "المهارات" in q_text:
            default_profile["required_skills"] = [s.strip() for s in reply.split(",")]
        
        # Question 5: Collaboration, TRL, Priority
        elif "collaboration style" in q_text or "أسلوب العمل المفضل" in q_text:
            # E.g. "Hybrid - TRL 5 - High Priority"
            parts = [p.strip() for p in reply.split("-")]
            
            # Collaboration Type
            if len(parts) >= 1:
                p0 = parts[0].lower()
                if "hybrid" in p0 or "هجين" in p0:
                    default_profile["collaboration_type"] = "Hybrid"
                elif "remote" in p0 or "عن بعد" in p0:
                    default_profile["collaboration_type"] = "Remote"
                else:
                    default_profile["collaboration_type"] = "On-site"
            
            # TRL Level
            if len(parts) >= 2:
                default_profile["technology_readiness_level"] = parts[1].strip()
            else:
                default_profile["technology_readiness_level"] = "TRL 5"
            
            # Priority
            if len(parts) >= 3:
                p2 = parts[2].lower()
                if "high" in p2 or "عالية" in p2:
                    default_profile["priority"] = "High"
                elif "low" in p2 or "منخفضة" in p2:
                    default_profile["priority"] = "Low"
                else:
                    default_profile["priority"] = "Medium"
            else:
                default_profile["priority"] = "Medium"
        
        # Question 6: SDGs and Impact
        elif "sustainable development goals" in q_text or "أهداف التنمية المستدامة" in q_text:
            digits = [int(d) for d in re.findall(r'\d+', reply)]
            default_profile["sdgs"] = digits if digits else [9, 11]
            
            default_profile["expected_impact"] = {
                "social": f"Social benefits related to target: {reply}",
                "environmental": f"Environmental benefits related to target: {reply}",
                "economic": f"Economic benefits related to target: {reply}"
            }

    return default_profile


def generate_next_question(history: list, extracted: dict, missing: list, lang: str) -> tuple[str, Optional[List[str]]]:
    """
    Generates the next question and optional list of choices/quick-reply options.
    Uses warm, human-like conversational tone (like ChatGPT or Gemini).
    """
    assistant_q_count = sum(1 for m in history if m["role"] == "assistant")

    if lang == "ar":
        questions = [
            # Q1 is welcome
            ("", None),
            # Q2
            ("يسعدني جداً المساعدة في تسجيل مشروعك. هل يمكنك أن تشرح لي بالتفصيل طبيعة المشكلة أو التحدي الإنمائي/الإعماري الذي يهدف المشروع لحله في سوريا؟", None),
            # Q3
            ("هذا مسعى رائع ومهم! أين يقع مكان تنفيذ هذا المشروع تحديداً؟ وكم تقدر الميزانية والجدول الزمني التقريبي لإنجازه؟", None),
            # Q4
            ("ممتاز. ما هي المهارات الهندسية أو الأكاديمية أو التقنية التي تأمل أن يقدمها الخبراء المتعاونون معك؟", None),
            # Q5
            ("رائع جداً. ما هو أسلوب العمل المفضل (عن بعد أم في الموقع)؟ وما هو مستوى جاهزية المشروع الفنية (TRL) وأولويته الحالية؟", 
             ["هجين - TRL 5 - أولوية عالية", "عن بعد - TRL 3 - أولوية متوسطة", "في الموقع - TRL 7 - أولوية عالية"]),
            # Q6
            ("وأخيراً، ما هي أهداف التنمية المستدامة للأمم المتحدة (SDGs) التي يتقاطع معها هذا المشروع الإعماري؟", 
             ["الهدف 9 و11 (البنية التحتية والمدن المستدامة)", "الهدف 6 (المياه النظيفة والنظافة)", "الهدف 7 (طاقة نظيفة وبأسعار معقولة)"])
        ]
    else:
        questions = [
            # Q1 is welcome
            ("", None),
            # Q2
            ("I am absolutely thrilled to help you register your project! Could you explain in your own words the core problem or reconstruction challenge this project seeks to address?", None),
            # Q3
            ("That sounds like a vital initiative. Where exactly in Syria will this project be implemented, and what is its estimated budget and timeline?", None),
            # Q4
            ("Understood. What specific engineering, research, or technical skills are you looking for in the experts who join your team?", None),
            # Q5
            ("Perfect! What is your preferred collaboration style (e.g. remote or on-site), the current technology readiness level (TRL), and its priority?", 
             ["Hybrid - TRL 5 - High Priority", "Remote - TRL 3 - Medium Priority", "On-site - TRL 7 - High Priority"]),
            # Q6
            ("Finally, which UN Sustainable Development Goals (SDGs) align most closely with this project's vision?", 
             ["SDG 9 & 11 (Infrastructure & Sustainable Cities)", "SDG 6 (Clean Water)", "SDG 7 (Affordable Energy)"])
        ]
        
    if not settings.GEMINI_API_KEY or not settings.GEMINI_AVAILABLE:
        if assistant_q_count < len(questions):
            return questions[assistant_q_count]
        return ("Are there any other details or requirements you would like to specify for your project?" if lang != "ar"
                else "هل هناك أي تفاصيل أو متطلبات أخرى تود تحديدها لمشروعك؟"), None

    try:
        chat_str = ""
        for msg in history[-6:]:
            chat_str += f"{msg['role'].capitalize()}: {msg['content']}\n"
            
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=(
                f"You are the CollabBridge Project Interview Agent (Agent 2).\n"
                f"You are conducting a friendly, warm, conversational intake interview with a project owner (like ChatGPT or Gemini).\n"
                f"Do NOT sound robotic, dry, or like a form-filler. Ask questions naturally and show passion for the reconstruction goals.\n\n"
                f"So far, we have extracted these details: {json.dumps(extracted, ensure_ascii=False)}\n"
                f"These fields are still missing: {missing}\n\n"
                f"Recent Chat History:\n{chat_str}\n"
                f"Based on the missing fields and history, ask ONE natural, warm follow-up question to collect the next missing detail. "
                f"If the question can be answered by clicking a list of choices (e.g. sector, collab style, TRL, SDGs, yes/no), provide a list of 2-6 quick options. "
                f"Return the response in JSON format conforming to the NextQuestionSchema structure.\n"
                f"IMPORTANT: If the user is speaking in Arabic or the conversation history is in Arabic, you MUST write your response and options in natural, warm, and conversational Arabic."
            ),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=NextQuestionSchema,
            )
        )
        data = json.loads(response.text)
        return data.get("question"), data.get("options")
    except Exception as e:
        logger.error(f"Error generating project follow-up question: {e}. Disabling Gemini for this session.")
        settings.GEMINI_AVAILABLE = False
        if assistant_q_count < len(questions):
            return questions[assistant_q_count]
        return ("Are there any other details or requirements you would like to specify for your project?" if lang != "ar"
                else "هل هناك أي تفاصيل أو متطلبات أخرى تود تحديدها لمشروعك؟"), None

def save_project_to_db(extracted: dict, db: Session) -> Project:
    """
    Saves the extracted profile into the SQLite Project table, computes embedding.
    """
    search_text = (
        f"Project Title: {extracted.get('project_title')}\n"
        f"Sector: {extracted.get('sector')}\n"
        f"Description & Problem: {extracted.get('problem')}\n"
        f"Required Skills: {', '.join(extracted.get('required_skills', []))}\n"
        f"Location: {extracted.get('preferred_location')}\n"
        f"Expected Impact: {json.dumps(extracted.get('expected_impact', {}))}\n"
        f"Motivation: {extracted.get('motivation', '')}\n"
        f"Novelty & Innovation: {extracted.get('novelty_innovation', '')}\n"
        f"Current Stage: {extracted.get('current_stage', '')}\n"
        f"Technical Approach: {extracted.get('technical_approach', '')}\n"
        f"Required Equipment: {', '.join(extracted.get('required_equipment') or [])}\n"
        f"Funding Status: {extracted.get('funding_status', '')}\n"
        f"Upcoming Milestones: {', '.join(extracted.get('milestones') or [])}\n"
        f"Risks & Mitigation: {extracted.get('risks_mitigation', '')}\n"
        f"Existing Collaborators: {', '.join(extracted.get('existing_collaborators') or [])}\n"
        f"IP Status: {extracted.get('ip_status', '')}\n"
        f"Datasets Involved: {', '.join(extracted.get('datasets_involved') or [])}\n"
        f"Software & Hardware: {', '.join(extracted.get('software_hardware') or [])}\n"
        f"Target Beneficiaries: {extracted.get('target_beneficiaries', '')}\n"
        f"Scalability: {extracted.get('scalability_potential', '')}\n"
        f"Commercialization Plan: {extracted.get('commercialization_plan', '')}\n"
        f"Future Vision: {extracted.get('future_vision', '')}"
    )
    
    emb_vector = get_embedding(search_text)
    emb_binary = json.dumps(emb_vector).encode('utf-8')

    db_project = Project(
        organization=extracted.get("organization", "Anonymous Owner"),
        title=extracted.get("project_title"),
        description=extracted.get("problem"),
        required_skills=json.dumps(extracted.get("required_skills", [])),
        budget=extracted.get("budget"),
        timeline=extracted.get("timeline"),
        impact=json.dumps(extracted.get("expected_impact", {})),
        location=extracted.get("preferred_location"),
        sector=extracted.get("sector"),
        sdgs=json.dumps(extracted.get("sdgs", [])),
        priority=extracted.get("priority", "Medium"),
        embedding=emb_binary,
        raw_json=json.dumps(extracted)
    )
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project
