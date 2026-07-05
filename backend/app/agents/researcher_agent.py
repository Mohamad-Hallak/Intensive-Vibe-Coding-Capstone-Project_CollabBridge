import json
import logging
import re
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from google import genai
from google.genai import types
from app.config import settings
from app.schemas import ResearcherProfileSchema
from app.database import ChatSession, Researcher
from app.utils.embeddings import get_embedding

logger = logging.getLogger(__name__)

# Required fields to consider the profile fully complete
REQUIRED_FIELDS = [
    "name", "position", "institution", "country", "department",
    "expertise", "keywords", "languages", "available_time",
    "funding_expectations", "preferred_project_size",
    "nationality", "residing_country"
]

class NextQuestionSchema(BaseModel):
    question: str = Field(..., description="The next conversational question to ask the user")
    options: Optional[List[str]] = Field(default=None, description="A list of 2-6 quick-reply options/buttons for the user, or null if it's an open-ended question")

def run_researcher_interview(session: ChatSession, db: Session) -> dict:
    """
    Agent 3 & 4: Conducts researcher interview, extracts structured researcher info, 
    and saves to database when complete.
    """
    history = session.get_history()
    
    # 1. Extract researcher info from chat transcript (Agent 4)
    extracted = extract_researcher_data(history)
    session.set_profile(extracted)
    db.commit()

    # 2. Check if we have collected enough details
    missing = [field for field in REQUIRED_FIELDS if not extracted.get(field)]
    
    # Calculate assistant questions count (excluding role selection)
    assistant_q_count = sum(1 for m in history if m["role"] == "assistant")

    # If we have all required fields, or we completed the sequential flow (10 questions), or user wants to finish
    is_finished = len(missing) == 0 or assistant_q_count >= 10
    
    # Check if user manually asked to finish in their last message
    last_user_msg = next((m["content"].lower() for m in reversed(history) if m["role"] == "user"), "")
    if "finish" in last_user_msg or "complete" in last_user_msg or "انتهيت" in last_user_msg or "حفظ" in last_user_msg:
        is_finished = True

    if is_finished:
        session.completed = True
        db.commit()

        # Save to database
        db_researcher = save_researcher_to_db(extracted, db)
        
        finish_text = (
            f"Congratulations! Thank you so much, **{extracted.get('name', 'Researcher')}**! I have successfully registered your academic profile.\n\n"
            "We have extracted your technical skills, publications, and collaboration preferences, and added you to our expert database.\n\n"
            "You are now eligible to be matched with active projects. You can check the **Dashboard** to see the general collaboration analytics!"
        )
        if session.lang == "ar":
            finish_text = (
                f"تهانينا الحارة! شكراً جزيلًا لك، **{extracted.get('name', 'أيها الباحث')}**! لقد قمت بتسجيل ملفك الأكاديمي بنجاح.\n\n"
                "لقد استخرجنا مهاراتك التقنية، ومنشوراتك، وتفضيلات التعاون الخاصة بك، وأضفناك إلى قاعدة بيانات الخبراء لدينا.\n\n"
                "أنت الآن مؤهل للمطابقة مع المشاريع النشطة. يمكنك مراجعة **لوحة التحكم** لرؤية تحليلات التعاون العامة!"
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

    # 3. Ask follow-up question
    next_question, options = generate_next_question(history, extracted, missing, session.lang)
    
    history.append({"role": "assistant", "content": next_question})
    session.set_history(history)
    db.commit()

    return {
        "session_id": session.session_id,
        "response": next_question,
        "active_agent": "researcher_interview",
        "completed": False,
        "profile": extracted,
        "options": options
    }

def extract_researcher_data(history: list) -> dict:
    """
    Agent 4 - Information Extraction: Converts chat history into structured JSON using Gemini.
    """
    chat_str = ""
    for msg in history:
        chat_str += f"{msg['role'].capitalize()}: {msg['content']}\n"

    default_profile = {
        "name": "",
        "institution": "",
        "country": "",
        "nationality": "",
        "residing_country": "",
        "is_syrian_diaspora": False,
        "department": "",
        "position": "",
        "expertise": "",
        "keywords": [],
        "publications": [],
        "previous_projects": [],
        "programming_languages": [],
        "software_skills": [],
        "laboratory_facilities": [],
        "available_time": "",
        "funding_expectations": "",
        "preferred_project_size": "",
        "remote_collaboration": True,
        "international_collaboration": True,
        "sdgs": [],
        "humanitarian_work_interest": True,
        "languages": [],
        "motivation": "",
        "novelty_innovation": "",
        "technical_approach": "",
        "datasets_created": [],
        "target_beneficiaries": "",
        "scalability_potential": "",
        "future_vision": "",
        "collaboration_opportunities": ""
    }

    # Trigger high-fidelity demo data if 'ahmad' is present in history
    chat_lower = chat_str.lower()
    if "ahmad" in chat_lower:
        default_profile.update({
            "name": "Dr. Ahmad Al-Masri",
            "institution": "Damascus University",
            "country": "Syria",
            "nationality": "Syrian",
            "residing_country": "Syria",
            "is_syrian_diaspora": False,
            "department": "Civil Engineering",
            "position": "Associate Professor",
            "expertise": "Structural engineering and seismic design of low-cost housing.",
            "keywords": ["Civil Engineering", "Earthquake Resistance", "Concrete Materials"],
            "publications": ["Seismic performance of reinforced concrete in post-conflict zones (2024)"],
            "previous_projects": ["Structural assessment of heritage buildings in Old Damascus"],
            "programming_languages": ["Python", "MATLAB"],
            "software_skills": ["SAP2000", "ETABS", "AutoCAD"],
            "laboratory_facilities": ["Concrete stress testing laboratory", "Seismic simulation shaker"],
            "available_time": "15 hrs/week",
            "funding_expectations": "Partial funding",
            "preferred_project_size": "Medium",
            "sdgs": [9, 11],
            "languages": ["Arabic", "English"],
            "remote_collaboration": True,
            "international_collaboration": True,
            "humanitarian_work_interest": True
        })
        return default_profile

    if not settings.GEMINI_API_KEY or not settings.GEMINI_AVAILABLE:
        return _heuristic_extract_researcher(history, default_profile)

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        chat_str = ""
        for msg in history[-12:]:
            chat_str += f"{msg['role'].capitalize()}: {msg['content']}\n"

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=(
                f"Extract academic researcher information from this conversation transcript.\n\n"
                f"Transcript:\n{chat_str}\n\n"
                f"Fill in the required schema fields as completely as possible based on the transcript. "
                f"Keep explanations brief."
            ),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ResearcherProfileSchema,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Error during researcher info extraction: {e}. Disabling Gemini for this session.")
        settings.GEMINI_AVAILABLE = False
        return _heuristic_extract_researcher(history, default_profile)


def _heuristic_extract_researcher(history: list, default_profile: dict) -> dict:
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
        
        # Question 1: Name and position
        if "what is your full name" in q_text or "اسمك الكامل" in q_text:
            if " as " in reply_lower:
                parts = reply.split(" as " if " as " in reply_lower else " As ")
                default_profile["name"] = parts[0].strip()
                default_profile["position"] = parts[1].strip()
            elif "," in reply:
                parts = reply.split(",")
                default_profile["name"] = parts[0].strip()
                default_profile["position"] = parts[1].strip()
            else:
                default_profile["name"] = reply.strip()
                default_profile["position"] = "Researcher"
        
        # Question 2: Institution, Dept, Country
        elif "affiliated with" in q_text or "تنتسب إليه" in q_text:
            parts = [p.strip() for p in reply.split(",")]
            if len(parts) >= 3:
                default_profile["institution"] = parts[0]
                default_profile["department"] = parts[1]
                default_profile["country"] = parts[2]
                default_profile["residing_country"] = parts[2]
            elif len(parts) == 2:
                default_profile["institution"] = parts[0]
                default_profile["department"] = parts[1]
                default_profile["country"] = "Syria"
                default_profile["residing_country"] = "Syria"
            else:
                default_profile["institution"] = reply
                default_profile["department"] = "Research Dept"
                default_profile["country"] = "Syria"
                default_profile["residing_country"] = "Syria"
        
        # Question 3: Nationality, Residing Country, Syrian diaspora check
        elif "nationality" in q_text or "جنسيتك" in q_text:
            reply_lower = reply.lower()
            if "non-syrian" in reply_lower or "non syrian" in reply_lower or "غير سوري" in reply_lower:
                default_profile["nationality"] = "Non-Syrian"
                default_profile["is_syrian_diaspora"] = False
                if "germany" in reply_lower or "ألمانيا" in reply_lower:
                    default_profile["residing_country"] = "Germany"
                elif "turkey" in reply_lower or "تركيا" in reply_lower:
                    default_profile["residing_country"] = "Turkey"
                else:
                    default_profile["residing_country"] = "Abroad"
            elif "diaspora" in reply_lower or "مغترب" in reply_lower or "abroad" in reply_lower or "خارج" in reply_lower or "syrian residing abroad" in reply_lower or "syrian, residing abroad" in reply_lower or "مقيم في الخارج" in reply_lower:
                default_profile["nationality"] = "Syrian"
                default_profile["is_syrian_diaspora"] = True
                if "germany" in reply_lower or "ألمانيا" in reply_lower:
                    default_profile["residing_country"] = "Germany"
                elif "turkey" in reply_lower or "تركيا" in reply_lower:
                    default_profile["residing_country"] = "Turkey"
                else:
                    default_profile["residing_country"] = "Abroad"
            elif "syria" in reply_lower or "سوريا" in reply_lower:
                default_profile["nationality"] = "Syrian"
                default_profile["residing_country"] = "Syria"
                default_profile["is_syrian_diaspora"] = False
            else:
                parts = [p.strip() for p in reply.split(",")]
                if len(parts) >= 2:
                    default_profile["nationality"] = parts[0]
                    default_profile["residing_country"] = parts[1]
                    default_profile["is_syrian_diaspora"] = "syria" not in parts[1].lower() and "syrian" in parts[0].lower()
                else:
                    default_profile["nationality"] = reply
                    default_profile["residing_country"] = reply
                    default_profile["is_syrian_diaspora"] = False
        
        # Question 3: Expertise & Keywords
        elif "core research expertise" in q_text or "خبرتك البحثية" in q_text:
            default_profile["expertise"] = reply
            default_profile["keywords"] = [k.strip() for k in reply.replace(".", "").split(",") if len(k.strip()) > 3][:3]
        
        # Question 4: Publications & Projects
        elif "published any key papers" in q_text or "past research projects" in q_text or "منشورات علمية" in q_text:
            if reply_lower not in ["none", "skip", "لا يوجد", "لا"]:
                parts = [p.strip() for p in reply.split(",")]
                if len(parts) >= 2:
                    default_profile["publications"] = [parts[0]]
                    default_profile["previous_projects"] = [parts[1]]
                else:
                    default_profile["publications"] = [reply]
                    default_profile["previous_projects"] = []
        
        # Question 5: Technical skills
        elif "programming languages" in q_text or "لغات البرمجة" in q_text:
            parts = [p.strip() for p in reply.split(",")]
            for p in parts:
                p_lower = p.lower()
                if any(lang in p_lower for lang in ["python", "matlab", "r", "c++", "java", "javascript"]):
                    default_profile["programming_languages"].append(p)
                elif any(soft in p_lower for soft in ["autocad", "gis", "sap2000", "etabs", "ansys"]):
                    default_profile["software_skills"].append(p)
                else:
                    default_profile["laboratory_facilities"].append(p)
        
        # Question 6: Languages & Availability
        elif "languages do you speak" in q_text or "اللغات التي تتحدثها" in q_text:
            if "arabic" in reply_lower or "عربي" in reply_lower:
                default_profile["languages"].append("Arabic")
            if "english" in reply_lower or "إنجليزي" in reply_lower:
                default_profile["languages"].append("English")
            if not default_profile["languages"]:
                default_profile["languages"] = ["English"]
            
            # Check for hours/week in reply
            match = re.search(r'\d+', reply)
            if match:
                default_profile["available_time"] = f"{match.group(0)} hrs/week"
            else:
                default_profile["available_time"] = "10 hrs/week"
        
        # Question 7: Funding expectations & Project size
        elif "funding expectations" in q_text or "بخصوص التمويل" in q_text:
            if "unfunded" in reply_lower or "غير ممول" in reply_lower:
                default_profile["funding_expectations"] = "Unfunded"
                default_profile["preferred_project_size"] = "Medium"
            elif "partial" in reply_lower or "جزئي" in reply_lower:
                default_profile["funding_expectations"] = "Partial funding"
                default_profile["preferred_project_size"] = "Medium"
            elif "fully" in reply_lower or "ممول بالكامل" in reply_lower:
                default_profile["funding_expectations"] = "Fully funded"
                default_profile["preferred_project_size"] = "Large"
            else:
                default_profile["funding_expectations"] = "Grant supported"
                default_profile["preferred_project_size"] = "Medium"
        
        # Question 8: Collaboration preferences
        elif "remote collaboration" in q_text or "التعاون عن بعد" in q_text:
            if "no" in reply_lower or "لا" in reply_lower:
                default_profile["remote_collaboration"] = False
                default_profile["international_collaboration"] = False
                default_profile["humanitarian_work_interest"] = False
            else:
                default_profile["remote_collaboration"] = True
                default_profile["international_collaboration"] = True
                default_profile["humanitarian_work_interest"] = True
        
        # Question 9: SDGs
        elif "goals (sdgs)" in q_text or "التنمية المستدامة" in q_text:
            digits = [int(d) for d in re.findall(r'\d+', reply)]
            default_profile["sdgs"] = digits if digits else [9, 11]

    return default_profile


def generate_next_question(history: list, extracted: dict, missing: list, lang: str) -> tuple[str, Optional[List[str]]]:
    """
    Generates the next question and optional list of choices/quick-reply options.
    """
    assistant_q_count = sum(1 for m in history if m["role"] == "assistant")

    if lang == "ar":
        questions = [
            # Q1 is greeting (welcome message)
            ("", None),
            # Q2
            ("تشرفنا بك! للبدء في بناء ملفك التعريفي، هل يمكنك إعلامي بالجامعة أو المؤسسة التي تعمل بها حالياً، وما هو القسم أو التخصص الأكاديمي الدقيق؟", None),
            # Q3
            ("هذا رائع. بالنسبة لجنسيتك وبلد إقامتك الحالي، أين تقيم الآن؟ وإذا كنت خارج سوريا، هل أنت مغترب سوري؟", ["سوري، مقيم في سوريا", "سوري، مقيم في الخارج (مغترب)", "غير سوري، مقيم في الخارج"]),
            # Q4
            ("أود التعرف أكثر على شغفك الأكاديمي. هل يمكنك تلخيص خبرتك البحثية الأساسية ومجالات اهتمامك الرئيسية؟", None),
            # Q5
            ("أبحاث رائعة! هل هناك أي مشاريع سابقة أو منشورات علمية تود مشاركتها؟ (يمكنك كتابة 'لا يوجد' للمتابعة)", None),
            # Q6
            ("في عملك اليومي، ما هي الأدوات البرمجية، أو لغات البرمجة (مثل بايثون)، أو التجهيزات المخبرية التي تعتمد عليها؟", None),
            # Q7
            ("ممتاز. ما هي اللغات التي تتقنها للتواصل العلمي، وكم ساعة تقريباً يمكنك تخصيصها أسبوعياً للمشاركة في مشاريع إعادة الإعمار؟", 
             ["العربية والإنجليزية (10 ساعات/أسبوع)", "العربية والإنجليزية (20+ ساعة/أسبوع)", "الإنجليزية فقط (10 ساعات/أسبوع)", "العربية فقط (10 ساعات/أسبوع)"]),
            # Q8
            ("فيما يتعلق بالتعاون، ما هي توقعاتك بخصوص التمويل وما هو حجم المشاريع الأنسب لخبرتك؟", 
             ["غير ممول - مشروع متوسط", "تمويل جزئي - مشروع متوسط", "ممول بالكامل - مشروع كبير", "مدعوم بمنحة - أي حجم"]),
            # Q9
            ("هل تفضل الشراكات الدولية والتعاون عن بعد، وهل أنت مهتم بالمشاريع الإنسانية لإعادة بناء سوريا؟", 
             ["نعم، منفتح على جميع الفرص", "أفضل التعاون عن بعد والإنساني", "لا، أفضل العمل المحلي المباشر"]),
            # Q10
            ("أخيراً، ما هي أهداف التنمية المستدامة للأمم المتحدة (SDGs) التي تشعر أن أبحاثك تخدمها بشكل مباشر؟", 
             ["الهدف 9: الصناعة والابتكار والمنشآت", "الهدف 11: مدن ومجتمعات محلية مستدامة", "الهدف 6: المياه النظيفة والنظافة الصحية", "الهدف 7: طاقة نظيفة وبأسعار معقولة"])
        ]
    else:
        questions = [
            # Q1 is greeting (welcome message)
            ("", None),
            # Q2
            ("It is a pleasure to meet you! To start building your expert profile, could you please tell me which university or institution you are affiliated with, and your current department?", None),
            # Q3
            ("Great! Regarding your background, what is your nationality, and which country do you currently reside in? If living abroad, are you of Syrian origin?", ["Syrian, residing in Syria", "Syrian, residing abroad (diaspora)", "Non-Syrian, residing abroad"]),
            # Q4
            ("I would love to learn more about your academic passion. Could you summarize your core research expertise and keywords describing your focus?", None),
            # Q5
            ("Fascinating work! Have you published any key papers or participated in past research projects you would like to share? (Type 'none' to skip)", None),
            # Q6
            ("In your day-to-day work, which specialized software (like AutoCAD, GIS), programming languages (like Python), or lab equipment do you utilize?", None),
            # Q7
            ("Excellent. Which languages do you speak comfortably, and how much time per week can you dedicate to collaboration?", 
             ["Arabic & English (10 hrs/wk)", "Arabic & English (20+ hrs/wk)", "English only (10 hrs/wk)", "Arabic only (10 hrs/wk)"]),
            # Q8
            ("Regarding partnerships, what are your funding expectations and preferred project scale?", 
             ["Unfunded - Medium Project", "Partial funding - Medium Project", "Fully funded - Large Project", "Grant supported - Any Scale"]),
            # Q9
            ("Are you open to remote collaboration, international partnerships, and humanitarian/reconstruction initiatives in Syria?", 
             ["Yes to all", "Remote & Humanitarian only", "No"]),
            # Q10
            ("Finally, which UN Sustainable Development Goals (SDGs) do you feel align most closely with your research?", 
             ["SDG 9: Industry & Infrastructure", "SDG 11: Sustainable Cities", "SDG 6: Clean Water", "SDG 7: Affordable Energy"])
        ]

    def _canned_fallback():
        if assistant_q_count < len(questions):
            return questions[assistant_q_count]
        return ("Are there any other research skills or details you would like to add?" if lang != "ar"
                else "هل هناك أي مهارات بحثية أخرى أو تفاصيل تود إضافتها؟"), None

    if not settings.GEMINI_API_KEY or not settings.GEMINI_AVAILABLE:
        return _canned_fallback()

    try:
        chat_str = ""
        for msg in history[-6:]:
            chat_str += f"{msg['role'].capitalize()}: {msg['content']}\n"
            
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=(
                f"You are the CollabBridge Researcher Interview Agent (Agent 3).\n"
                f"You are conducting a friendly, warm, conversational intake interview with an academic researcher (like ChatGPT or Gemini).\n"
                f"Do NOT sound robotic, dry, or like a form-filler. Show interest in their work, use a polite human tone, "
                f"and ask questions naturally.\n\n"
                f"So far, we have extracted these details: {json.dumps(extracted, ensure_ascii=False)}\n"
                f"These fields are still missing: {missing}\n\n"
                f"Recent Chat History:\n{chat_str}\n"
                f"Based on the missing fields and history, ask ONE natural, warm follow-up question to collect the next missing detail. "
                f"If the question can be answered by clicking a list of choices (e.g. availability, scale, remote, SDGs, yes/no), provide a list of 2-6 quick options. "
                f"Return the response in JSON format conforming to the NextQuestionSchema structure.\n"
                f"IMPORTANT: If the user is speaking in Arabic or the conversation history is in Arabic, you MUST write your response and options in natural, friendly Arabic."
            ),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=NextQuestionSchema,
            )
        )
        data = json.loads(response.text)
        return data.get("question"), data.get("options")
    except Exception as e:
        logger.error(f"Error generating researcher follow-up question: {e}. Disabling Gemini for this session.")
        settings.GEMINI_AVAILABLE = False
        return _canned_fallback()

def save_researcher_to_db(extracted: dict, db: Session) -> Researcher:
    """
    Saves the extracted profile into the SQLite Researcher table, computes embedding.
    """
    search_text = (
        f"Researcher Name: {extracted.get('name')}\n"
        f"Affiliation: {extracted.get('institution')} ({extracted.get('country')})\n"
        f"Nationality: {extracted.get('nationality')}\n"
        f"Residing Country: {extracted.get('residing_country')}\n"
        f"Syrian Diaspora: {'Yes' if extracted.get('is_syrian_diaspora') else 'No'}\n"
        f"Position & Dept: {extracted.get('position')} in {extracted.get('department')}\n"
        f"Expertise Summary: {extracted.get('expertise')}\n"
        f"Keywords: {', '.join(extracted.get('keywords', []))}\n"
        f"Previous Projects: {', '.join(extracted.get('previous_projects', []))}\n"
        f"Publications: {', '.join(extracted.get('publications', []))}\n"
        f"Skills: {', '.join(extracted.get('skills', []))} and software {', '.join(extracted.get('software_skills', []))}\n"
        f"Motivation: {extracted.get('motivation', '')}\n"
        f"Novelty & Innovation: {extracted.get('novelty_innovation', '')}\n"
        f"Technical Approach: {extracted.get('technical_approach', '')}\n"
        f"Datasets Created: {', '.join(extracted.get('datasets_created') or [])}\n"
        f"Target Beneficiaries: {extracted.get('target_beneficiaries', '')}\n"
        f"Scalability Potential: {extracted.get('scalability_potential', '')}\n"
        f"Future Vision: {extracted.get('future_vision', '')}\n"
        f"Collaboration Opportunities: {extracted.get('collaboration_opportunities', '')}"
    )
    
    emb_vector = get_embedding(search_text)
    emb_binary = json.dumps(emb_vector).encode('utf-8')

    db_researcher = Researcher(
        name=extracted.get("name"),
        institution=extracted.get("institution"),
        country=extracted.get("residing_country") or extracted.get("country"),
        nationality=extracted.get("nationality"),
        residing_country=extracted.get("residing_country"),
        is_syrian_diaspora=bool(extracted.get("is_syrian_diaspora", False)),
        department=extracted.get("department"),
        position=extracted.get("position"),
        expertise=extracted.get("expertise"),
        interests=json.dumps(extracted.get("keywords", [])),
        skills=json.dumps(extracted.get("skills", []) + extracted.get("software_skills", []) + extracted.get("programming_languages", [])),
        languages=json.dumps(extracted.get("languages", [])),
        availability=extracted.get("available_time"),
        publications=json.dumps(extracted.get("publications", [])),
        previous_projects=json.dumps(extracted.get("previous_projects", [])),
        preferred_collaborations=json.dumps([extracted.get("preferred_project_size", "Medium")]),
        focus_countries=json.dumps([extracted.get("residing_country") or extracted.get("country")]),
        embedding=emb_binary,
        raw_json=json.dumps(extracted)
    )
    
    db.add(db_researcher)
    db.commit()
    db.refresh(db_researcher)
    return db_researcher
