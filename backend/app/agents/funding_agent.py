import json
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import Project, Researcher, FundingNotification
from app.config import settings
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

def find_funding_opportunities(
    project_id: Optional[int], 
    researcher_id: Optional[int], 
    db: Session
) -> List[Dict[str, Any]]:
    """
    Agent 11 - Funding Agent:
    Finds matching research grants and developmental projects (IEEE, UN, World Bank, Horizon Europe, USAID).
    If a researcher is specified and has enabled notifications, auto-creates database notification logs.
    """
    project = None
    researcher = None
    
    if project_id:
        project = db.query(Project).filter(Project.id == project_id).first()
    if researcher_id:
        researcher = db.query(Researcher).filter(Researcher.id == researcher_id).first()

    if not project and not researcher:
        raise ValueError("Either project_id or researcher_id must be provided and valid.")

    # Determine focus terms for mock opportunities
    focus_title = ""
    focus_desc = ""
    focus_type = ""
    lang = "en"
    
    if project:
        focus_title = project.title
        focus_desc = project.description or project.sector
        focus_type = f"Project: {project.title}"
        lang = project.lang or "en"
    elif researcher:
        focus_title = researcher.name
        focus_desc = researcher.expertise or ", ".join(json.loads(researcher.skills or "[]"))
        focus_type = f"Researcher: {researcher.name}"
        lang = researcher.lang or "en"

    # Default Mock Opportunities for Arabic or English
    if lang == "ar":
        default_opportunities = [
            {
                "title": "تمويل لجنة الأنشطة الإنسانية لجمعية مهندسي الكهرباء والإلكترونيات (IEEE HAC)",
                "source": "IEEE",
                "amount": "$20,000 - $60,000",
                "description": "منح لدعم المشاريع والابتكارات التكنولوجية الموجهة لحل مشكلات المياه والطاقة والتعليم في المناطق النامية والمتضررة.",
                "deadline": "30 نوفمبر 2026",
                "match_reason": f"يتطابق مباشرة مع احتياجات {focus_title} في مجالات الابتكار التكنولوجي.",
                "url": "https://hac.ieee.org"
            },
            {
                "title": "برنامج الأمم المتحدة الإنمائي (UNDP) - صندوق مرونة البنية التحتية المحلية",
                "source": "United Nations",
                "amount": "$100,000 - $250,000",
                "description": "تمويل مصمم لدعم الهيئات المحلية والمشاريع الخدمية التي تهدف إلى إعادة إعمار البنية التحتية وتأهيل الأيدي العاملة في سوريا.",
                "deadline": "15 ديسمبر 2026",
                "match_reason": "يتماشى مع قطاع المشروع وأهداف التنمية المستدامة للأمم المتحدة لتوفير بنية أساسية مرنة.",
                "url": "https://www.undp.org"
            },
            {
                "title": "مبادرة اليونيسف (UNICEF) لحلول الابتكار والمياه والصرف الصحي",
                "source": "UNICEF",
                "amount": "$50,000 - $120,000",
                "description": "منح موجهة لبناء أنظمة مائية وطاقة بديلة للمدارس والمراكز الصحية المتضررة في الشرق الأوسط.",
                "deadline": "1 أكتوبر 2026",
                "match_reason": f"يرتبط بملف {focus_title} المتعلق بالتحديات البيئية وإعادة الإعمار الخدمي.",
                "url": "https://www.unicef.org"
            }
        ]
    else:
        default_opportunities = [
            {
                "title": "IEEE Humanitarian Activities Committee (HAC) Project Funding",
                "source": "IEEE",
                "amount": "$20,000 - $60,000",
                "description": "Supports technological solutions and field-ready projects that address water sanitation, power grids, or educational recovery in post-conflict regions.",
                "deadline": "2026-11-30",
                "match_reason": f"Directly supports the engineering and technology initiatives associated with {focus_title}.",
                "url": "https://hac.ieee.org"
            },
            {
                "title": "UNDP Local Resilience and Syrian Infrastructure Grants",
                "source": "United Nations",
                "amount": "$100,000 - $250,000",
                "description": "Focuses on rebuilding community infrastructure, introducing clean energy mini-grids, and boosting smart agricultural output in Syrian governorates.",
                "deadline": "2026-12-15",
                "match_reason": "Matches the development scope and SDG alignment of this profile for building community sustainability.",
                "url": "https://www.undp.org"
            },
            {
                "title": "Horizon Europe Special Grant for Diaspora and Post-Conflict Research",
                "source": "European Commission",
                "amount": "$80,000 - $150,000",
                "description": "Grants dedicated to joint research consortia featuring diaspora experts addressing sustainable civil engineering and resource recovery challenges.",
                "deadline": "2026-10-01",
                "match_reason": f"Aligned with the academic credentials and collaborative goals identified in {focus_title}.",
                "url": "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home"
            }
        ]

    opportunities = default_opportunities

    # Query Gemini if API Key is available
    if settings.GEMINI_API_KEY:
        try:
            prompt = (
                f"You are the CollabBridge AI Funding Agent (Agent 11).\n"
                f"Your task is to find real or highly realistic ACTIVE funding opportunities, research grants, or project calls "
                f"from international bodies (like IEEE Humanitarian Activities Committee, UN Development Programme, USAID, "
                f"WHO, World Bank, European Commission, Horizon Europe) matching this target:\n"
                f"Type: {focus_type}\n"
                f"Target Name: {focus_title}\n"
                f"Description/Expertise: {focus_desc}\n"
                f"Language: {lang}\n\n"
                f"Generate exactly 3 specific matched opportunities. Each opportunity MUST contain:\n"
                f"- 'title': The name of the funding call/grant.\n"
                f"- 'source': The funding agency name.\n"
                f"- 'amount': Estimated range (e.g. '$15,000 - $50,000').\n"
                f"- 'description': Short description of the grant criteria.\n"
                f"- 'deadline': Format as ISO Date (YYYY-MM-DD) or a clear date string.\n"
                f"- 'url': The URL link to the official program page or agency home page (e.g. 'https://hac.ieee.org').\n"
                f"- 'match_reason': 1-2 sentences explaining why this matches this specific target.\n\n"
                f"Return ONLY a valid JSON array of objects. Do not include markdown code block syntax or extra text. "
                f"Ensure translations match the target language ({lang})."
            )
            
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            
            opportunities = json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini Funding Search error: {e}. Falling back to default mock list.")

    # Process notifications if a researcher is targeted
    if researcher and researcher.receive_funding_notifications:
        try:
            for opp in opportunities:
                # Check for existing notifications for this researcher to avoid duplicate spamming
                existing = db.query(FundingNotification).filter(
                    FundingNotification.researcher_id == researcher.id,
                    FundingNotification.opportunity_title == opp["title"]
                ).first()
                
                if not existing:
                    notif = FundingNotification(
                        researcher_id=researcher.id,
                        opportunity_title=opp["title"],
                        opportunity_source=opp["source"],
                        is_read=False
                    )
                    db.add(notif)
            db.commit()
            print(f"Dispatched {len(opportunities)} funding notifications to researcher {researcher.name}")
        except Exception as err:
            logger.error(f"Error saving funding notifications to DB: {err}")
            db.rollback()

    return opportunities
